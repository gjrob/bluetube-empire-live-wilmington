import Live from "../live";
import { supabaseServer } from "../../lib/supabaseServer";

export async function getServerSideProps(ctx) {
  const handle = (ctx.params?.handle || "").toLowerCase();
  if (!handle) return { notFound: true };

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("creator_profiles")
    .select("id, display_name, title, hls_a, hls_b, stripe_link")
    .eq("handle", handle)
    .maybeSingle();

  if (error || !data) return { notFound: true };

  const hasA = !!(data.hls_a && data.hls_a.trim());
  const hasB = !!(data.hls_b && data.hls_b.trim());

  // Build angles only for streams that actually exist
  const angles = [
    ...(hasA ? [{ name: "Cam A", url: data.hls_a }] : []),
    ...(hasB ? [{ name: "Cam B", url: data.hls_b }] : []),
  ];

  const meta = {
    title: `${data.title || "Live"} • ${data.display_name || handle} • BlueTubeTV`,
    stripeLink: data.stripe_link || null,
  };

  return {
    props: {
      angles,
      meta,
      handle,
      creatorId: data.id || null,
      // Optional: UI hints (Live page can read or ignore)
      ui: {
        showCamB: hasB,
        showSplit: hasA && hasB,
      },
    },
  };
}

export default function CreatorLive(props) {
  return <Live {...props} />;
}

