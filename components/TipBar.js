import { useState } from "react";

export default function TipBar() {
  const [busy, setBusy] = useState(false);

  async function tip(amount) {
    setBusy(true);
    try {
      const r = await fetch("/api/stripe/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const j = await r.json();
      if (j.url) window.location.href = j.url; else alert(j.error || "Tip failed");
    } finally { setBusy(false); }
  }

  async function sponsor() {
    setBusy(true);
    try {
      const r = await fetch("/api/stripe/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sponsor: true }),
      });
      const j = await r.json();
      if (j.url) window.location.href = j.url;
    } finally { setBusy(false); }
  }

  async function crypto(amount) {
    const r = await fetch("/api/coinbase/create-charge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `BlueTubeTV Tip $${amount}`, amount }),
    });
    const j = await r.json();
    if (j.hosted_url) window.open(j.hosted_url, "_blank"); else alert(j.error || "Crypto checkout failed");
  }

  async function mintMoment() {
    const r = await fetch("/api/mint/mint-moment", { method: "POST" });
    const j = await r.json();
    alert(j.message || "Mint metadata prepared.");
  }

  return (
    <div style={{
      position:"fixed", left:0, right:0, bottom:0,
      padding:"12px 16px", display:"flex", gap:12, justifyContent:"center",
      backdropFilter:"blur(6px)", background:"rgba(2,6,23,.6)", borderTop:"1px solid #1f2937", zIndex:40
    }}>
      <Btn onClick={()=>tip(5)} disabled={busy}>$5 Tip</Btn>
      <Btn onClick={()=>tip(10)} disabled={busy}>$10 Tip</Btn>
      <Btn onClick={()=>tip(25)} disabled={busy}>$25 Tip</Btn>
      <Btn onClick={sponsor} disabled={busy}>Sponsor a slot</Btn>
      <Btn onClick={()=>crypto(10)}>Crypto Tip</Btn>
      <Btn onClick={mintMoment}>Mint this moment</Btn>
    </div>
  );
}

function Btn({ children, ...rest }) {
  return (
    <button {...rest} style={{
      padding:"10px 14px", borderRadius:999, border:"1px solid #164e63",
      background:"#0ea5e9", color:"#02131f", fontWeight:800, cursor:"pointer"
    }}>{children}</button>
  );
}

