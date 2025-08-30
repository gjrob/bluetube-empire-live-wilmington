import Live from "../live";
import { supabaseServer } from "../../lib/supabaseServer";

export async function getServerSideProps(ctx) {
  const handle = ctx.params.handle?.toLowerCase();
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("creator_profiles")
    .select("display_name,title,hls_a,hls_b,stripe_link")
    .eq("handle", handle)
    .maybeSingle();

  if (error || !data) {
    // 404 if unknown handle
    return { notFound: true };
  }

  const angles = [
    { name: "Cam A", url: data.hls_a || "" },
    { name: "Cam B", url: data.hls_b || "" },
  ];

  const meta = {
    title: `${data.title || "Live"} • ${data.display_name || handle} • BlueTubeTV`,
    stripeLink: data.stripe_link || null,
  };

  return { props: { angles, meta } };
}

export default function CreatorLive(props) {
  return <Live {...props} />;
}
