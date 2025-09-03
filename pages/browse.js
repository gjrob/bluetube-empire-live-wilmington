// pages/browse.js
import Head from "next/head";
import Link from "next/link";
import { supabaseServer } from "../lib/supabaseServer";

export async function getServerSideProps() {
  try {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("creator_profiles")
      .select("handle, display_name, title, hls_a, og_image")
      .order("display_name", { ascending: true })
      .limit(24);

    if (error) throw error;

    const items = (data || []).filter(r => r.hls_a && r.hls_a.trim());
    return { props: { items } };
  } catch {
    return { props: { items: [] } };
  }
}

export default function Browse({ items }) {
  return (
    <>
      <Head><title>Browse • BlueTubeTV</title></Head>
      <main style={{ maxWidth: 1100, margin:"0 auto", padding:"56px 16px", color:"#fff" }}>
        <h1 style={{ fontSize: 32, marginBottom: 12 }}>Browse Streams</h1>
        <p style={{ opacity:.8, marginBottom: 24 }}>
          Live and recent creators. Tap a card to enter their live room.
        </p>

        {items.length === 0 && (
          <div style={empty}>
            Nothing listed yet. Try <Link href="/live" style={{color:"#9ecbff"}}>the main live page</Link>.
          </div>
        )}

        <div style={grid}>
          {items.map(x => (
            <Link key={x.handle} href={`/${x.handle}/live`} style={card}>
              <div style={thumb(x.og_image)} />
              <div style={{ padding:"10px 12px" }}>
                <div style={{ fontSize:16, fontWeight:600 }}>{x.display_name || x.handle}</div>
                <div style={{ fontSize:13, opacity:.8 }}>{x.title || "Live"}</div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

const grid = { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))", gap:12 };
const card = {
  borderRadius:14, border:"1px solid rgba(255,255,255,.12)", textDecoration:"none",
  color:"#fff", overflow:"hidden", background:"rgba(10,14,39,.6)"
};
const thumb = (src) => ({
  width:"100%", height:120, backgroundImage:`url(${src || "/og-image.png"})`,
  backgroundSize:"cover", backgroundPosition:"center"
});
const empty = {
  padding:"16px", border:"1px solid rgba(255,255,255,.12)", borderRadius:12,
  background:"rgba(10,14,39,.6)"
};
