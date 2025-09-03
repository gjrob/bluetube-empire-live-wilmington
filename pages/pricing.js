// pages/pricing.js
import Head from "next/head";

const sponsorLink = process.env.NEXT_PUBLIC_SPONSOR_LINK || "/live";

export default function Pricing() {
  return (
    <>
      <Head><title>Pricing • BlueTubeTV</title></Head>
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "56px 16px", color:"#fff" }}>
        <h1 style={{ fontSize: 32, marginBottom: 12 }}>Pricing & Support</h1>
        <p style={{ opacity:.8, marginBottom: 28 }}>
          Power the empire. Tip the stream, sponsor a show, or mint a moment.
        </p>

        <section style={card}>
          <h2 style={h2}>Quick Tips</h2>
          <div style={row}>
            {["$5","$10","$25","$50"].map(v => (
              <a key={v} href="/live#tips" style={pill}>{`Card Tip ${v}`}</a>
            ))}
            {["$10","$25","$50"].map(v => (
              <a key={"c"+v} href="/live#crypto" style={pill}>{`Crypto Tip ${v}`}</a>
            ))}
          </div>
        </section>

        <section style={card}>
          <h2 style={h2}>Sponsor a Stream</h2>
          <p style={{opacity:.85, margin:"8px 0 16px"}}>
            Logo in ticker, on-air shoutouts, partner link, and post recap.
          </p>
          <a href={sponsorLink} style={cta}>Become a Sponsor</a>
        </section>

        <section style={card}>
          <h2 style={h2}>Mint the Moment</h2>
          <p style={{opacity:.85, margin:"8px 0 16px"}}>
            Own a highlight as a collectible. Limited mints per stream.
          </p>
          <a href="/live#mint" style={cta}>Mint This Moment</a>
        </section>
      </main>
    </>
  );
}

const card = {
  background: "rgba(10,14,39,.6)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 16,
  padding: "18px 16px",
  marginBottom: 16
};
const h2 = { fontSize: 22, margin: 0 };
const row = { display:"flex", flexWrap:"wrap", gap:8, marginTop:12 };
const pill = {
  display:"inline-flex", alignItems:"center", justifyContent:"center",
  padding:"10px 14px", borderRadius:999, border:"1px solid rgba(255,255,255,.18)",
  textDecoration:"none", color:"#fff", background:"rgba(29,78,216,.85)", fontSize:14
};
const cta = {
  display:"inline-flex", alignItems:"center", justifyContent:"center",
  padding:"12px 16px", borderRadius:12, textDecoration:"none", color:"#fff",
  background:"rgba(29,78,216,.9)", border:"1px solid rgba(255,255,255,.18)", fontSize:15
};
