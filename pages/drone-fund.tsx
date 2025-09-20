// pages/drone-fund.tsx
import { useEffect, useState } from "react";

const GOAL = 36000;
const PAYPAL = "garlanjrobinson";      // paypal.me/garlanjrobinson
const VENMO  = "Garlan-Robinson";      // @Garlan-Robinson


export default function DroneFund() {
  const [raised, setRaised] = useState<number | null>(null);
  const [loadingAmt, setLoadingAmt] = useState<number | null>(null);
  const [custom, setCustom] = useState(25);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/drone-progress");
        const j = await r.json();
        setRaised(j.total || 0);
      } catch { setRaised(0); }
    })();
  }, []);

  async function donateStripe(amount: number) {
    setLoadingAmt(amount);
    try {
      const r = await fetch("/api/drone-donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, campaign: "drone_fund" }),
      });
      const j = await r.json();
      if (!r.ok || !j.url) throw new Error(j.error || `HTTP ${r.status}`);
      window.location.href = j.url;
    } catch (e: any) {
      alert(e?.message || "Checkout failed");
    } finally {
      setLoadingAmt(null);
    }
  }

  const pct = Math.max(0, Math.min(1, (raised ?? 0) / GOAL));
  return (
    <main style={{ maxWidth: 820, margin: "40px auto", padding: "0 16px", color: "#dbe7ff" }}>
      <h1 style={{ marginBottom: 8 }}>Wilmington Drone Fund</h1>
      <h3 style={{ marginTop: 0, color: "#6fe3ff" }}>$36,000 goal • Count & Care</h3>

      <p style={{ fontSize: 18, lineHeight: 1.6, opacity: .95 }}>
        We’re raising <strong>$36,000</strong> for drones to give Wilmington the first real-time census of our
        homeless neighbors—so outreach, shelters, and services can reach them faster and smarter.
      </p>

      {/* progress */}
      <div style={{ margin: "18px 0 4px" }}>Progress</div>
      <div style={{ background:"#132a5a", borderRadius: 14, overflow: "hidden", border:"1px solid rgba(111,227,255,.25)" }}>
        <div style={{
          width: `${pct*100}%`,
          minWidth: 6,
          height: 20,
          background: "linear-gradient(90deg,#4f9cff,#6fe3ff)"
        }}/>
      </div>
      <div style={{ marginTop: 6, opacity: .85 }}>
        <strong>${(raised ?? 0).toLocaleString()}</strong> raised of ${GOAL.toLocaleString()}
      </div>

      {/* donate */}
      <h2 style={{ marginTop: 28 }}>Donate</h2>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {[25, 50, 100, 250].map(a => (
          <button key={a} onClick={() => donateStripe(a)} disabled={loadingAmt === a}
            style={btn}>{loadingAmt === a ? "Loading…" : `$${a}`}</button>
        ))}
        <div style={{ display:"inline-flex", gap:8, alignItems:"center" }}>
          <input type="number" min={1} value={custom}
                 onChange={e => setCustom(parseInt(e.target.value||"0",10))}
                 style={{ width: 96, padding:8, borderRadius:10, border:"1px solid rgba(111,227,255,.35)", background:"#091a3a", color:"#dbe7ff" }}/>
          <button onClick={()=>donateStripe(custom)} disabled={loadingAmt === custom} style={btn}>Other</button>
        </div>
      </div>

     <div style={{ marginTop: 14, display:"flex", gap:10, flexWrap:"wrap" }}>
   <a
     href={`https://paypal.me/${PAYPAL}/${Math.max(1, custom || 25)}`}
     target="_blank" rel="noreferrer" style={linkBtn}
   >
     PayPal
   </a>
   <a
     href={`https://account.venmo.com/u/${VENMO}`}
     target="_blank" rel="noreferrer" style={linkBtn}
   >
     Venmo
   </a>
 </div>

      <div style={{ marginTop: 26, fontSize: 14, opacity: .75 }}>
        Your receipt is provided by Stripe/PayPal. We’ll publish a transparent roll-up of totals and grant proposals.
      </div>
    </main>
  );
}

const btn: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 12,
  border: "0",
  fontWeight: 800,
  background: "linear-gradient(135deg,#1d4ed8,#2563eb)",
  color: "#fff",
  cursor: "pointer"
};
const linkBtn: React.CSSProperties = {
  ...btn as any, textDecoration:"none", display:"inline-block"
};
