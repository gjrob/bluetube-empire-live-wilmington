import { useState } from "react";

type Badge = { id: string; label: string; priceId: string; blurb?: string };

const BADGES: Badge[] = [
  { id: "castle",  label: "Castle Street Legacy Badge", priceId: "price_1S8smiGf1VrUr665eE9Rezbm", blurb: "Castle & 9th activation zone" },
  { id: "empire",  label: "Empire Builder Badge",       priceId: "price_1S8soNGf1VrUr665n33Yn3z0", blurb: "Architect of the platform" },
  { id: "recovery",label: "Recovery Champion Badge",    priceId: "price_1S8sqNGf1VrUr665ujMXkkgL", blurb: "ADKT × Recovery message" },
  { id: "founder", label: "Founder’s Circle",           priceId: "price_1S8ssWGf1VrUr665S9oSqCP0", blurb: "Founding backer" },
];

export default function BadgeButtons({ compact = false, badges = BADGES }:{
  compact?: boolean; badges?: Badge[];
}) {
  const [loading, setLoading] = useState<string | null>(null);

  async function buy(b: Badge) {
    try {
      setLoading(b.id);
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: b.priceId, badge: b.id }),
      });
      const j = await r.json().catch(()=> ({}));
      if (!r.ok || !j?.url) throw new Error(j?.error || `HTTP ${r.status}`);
      window.location.href = j.url;
    } catch (e:any) {
      alert(e?.message || "Could not start checkout");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ display:"grid", gap:12 }}>
      {badges.map(b => (
        <div key={b.id}
             style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"12px 14px", borderRadius:12, background:"#0b1d41",
                      border:"1px solid rgba(111,227,255,.28)" }}>
          <div style={{ maxWidth: "70%" }}>
            <div style={{ fontWeight:900, color:"#dbe7ff" }}>{b.label}</div>
            {!compact && b.blurb && (
              <div style={{ fontSize:13, opacity:.8, color:"#cfe4ff" }}>{b.blurb}</div>
            )}
          </div>
          <button onClick={() => buy(b)} disabled={loading===b.id}
            style={{ padding:"10px 14px", borderRadius:10, border:0,
                     fontWeight:900, cursor:"pointer",
                     background:"linear-gradient(135deg,#1d4ed8,#2563eb)", color:"#fff" }}>
            {loading===b.id ? "Loading…" : "Buy"}
          </button>
        </div>
      ))}
    </div>
  );
}
