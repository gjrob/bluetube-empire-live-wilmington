/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";

export default function SponsorPage() {
  const API_BASE  = process.env.NEXT_PUBLIC_PINS_API || "";
  const SITE_NAME = "BlueTubeTV";

  const [loading, setLoading] = useState(true);
  const [sponsors, setSponsors] = useState([]);
  const [selectedId, setSelectedId] = useState("general");
  const [campaign, setCampaign] = useState("showcase");
  const [error, setError] = useState("");
    const PLANS = [
  { id:"standard", title:"Standard", price:"$299", blurb:"Map pin + bottom ticker mention" },
  { id:"premium",  title:"Premium",  price:"$599", blurb:"Bigger placement + popup ‘Open’ button", highlight:true },
  { id:"marquee",  title:"Marquee",  price:"$999", blurb:"Top position + shout on stream" },
];
  // one place for fetch/override
  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const c  = search.get("campaign") || "showcase";
    const api = (search.get("api") || API_BASE || "").replace(/\/$/, "");
    setCampaign(c);

    if (!api) { setLoading(false); return; }

    const url = `${api}/manifest?campaign=${encodeURIComponent(c)}`;
    fetch(url, { mode: "cors" })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP_${r.status}`)))
      .then(j => {
        const list = Array.isArray(j?.slots) ? j.slots : [];
        // normalize: id, name (keep address/url if you want to show later)
        const norm = list.map(p => ({ id: p.id, name: p.name, address: p.address || "", url: p.url || "" }));
        setSponsors(norm);
      })
      .catch(e => { console.warn("sponsor list fetch failed:", e); })
      .finally(() => setLoading(false));
  }, [API_BASE]);

  const selected = useMemo(() => {
    if (selectedId === "general") return { id: "", name: "General Fund" };
    return sponsors.find(s => s.id === selectedId) || { id: "", name: "General Fund" };
  }, [selectedId, sponsors]);

  async function startCheckout({ tier, amount }) {
    try {
      setError("");
      const r = await fetch("/api/stripe/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,                                // "standard" | "premium" | "marquee" (omit if amount is used)
          amount,                              // number in USD (for custom)
          sponsorId: selected.id,              // pin id or empty for General Fund
          campaign,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data?.url) throw new Error(data?.error || `Checkout failed (${r.status})`);
      window.location.assign(data.url);
    } catch (e) {
      setError(e.message || "Unable to start checkout");
    }
  }

  return (
    <>
      <Head><title>{SITE_NAME} • Sponsor</title></Head>

      <div className="wrap">
        {/* top bar */}
        <header className="top">
          <a href="/live" className="angle" aria-label="Back to Live">← Back to Live</a>
          <div className="spacer" />
          <a href="/map?campaign=showcase" className="angle">Map</a>
        </header>

        {/* hero */}
        <section className="hero card">
          <h1>Fuel the stream. Feature your business.</h1>
          <p className="sub">Pick a partner and a tier. We’ll place your logo on the live map, ticker, and popups today.</p>

          {/* sponsor select */}
          <div className="row">
            <label className="lbl">Choose Sponsor</label>
            <select
              className="select"
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              disabled={loading}
            >
              <option value="general">General Fund (no specific sponsor)</option>
              {sponsors.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </section>

        {/* tiers */}
<section className="grid">
  {PLANS.map(p => (
    <PlanCard
      key={p.id}
      title={p.title}        // <- stays the same SSR/CSR
      price={p.price}
      blurb={p.blurb}
      highlight={p.highlight}
      cta={`Sponsor ${p.price}`}
      onBuy={() => startCheckout({ tier: p.id })}   // keeps your current one-time flow
      btnVariant={p.id === "premium" ? "primary" : "outline"}
    />
  ))}
</section>


        {/* custom amount */}
        <section className="custom card">
          <h3>Custom amount</h3>
          <p className="sub">Tip or one-off buy: enter any amount.</p>
          <CustomAmount onPay={(amt) => startCheckout({ amount: amt })} />
        </section>

        {/* notes */}
        {error && <p className="error">⚠️ {error}</p>}
        {!loading && !sponsors.length && (
          <p className="note">Tip: you can still sponsor the {SITE_NAME} General Fund even if the list hasn’t loaded.</p>
        )}
        <footer className="foot">Secure checkout by Stripe • Campaign: <strong>{campaign}</strong></footer>
      </div>

      <style jsx>{`
        .wrap { max-width: 980px; margin: 0 auto; padding: 18px; color: #dbe7ff; }
        .top { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .spacer { flex: 1; }
        .hero h1 { margin: 6px 0 4px; font-size: 28px; }
        .sub { opacity: .85; margin: 2px 0 10px; }
        .row { display:flex; gap:10px; align-items:center; }
        .lbl { width: 140px; opacity:.8; }
        .select {
          flex:1; padding:10px 12px; border-radius:12px; border:1px solid rgba(111,227,255,.35);
          background: rgba(9,18,48,.55); color:#dbe7ff; font-weight:700;
        }
        .grid { display:grid; gap:14px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); margin-top: 14px; }
        .card {
          background: linear-gradient(180deg, rgba(11,25,64,.75), rgba(9,18,48,.55));
          border: 1px solid rgba(111,227,255,.25);
          border-radius: 16px; padding: 14px; box-shadow: 0 10px 28px rgba(0,0,0,.35);
        }
        .custom { margin-top: 16px; }
        .error { margin-top:10px; color:#ffd7d7; font-weight:800; }
        .note { margin-top:8px; opacity:.8; }
        .foot { margin: 20px 0 8px; opacity:.7; font-size:.9rem; text-align:center; }
        .angle {
          padding: 8px 12px; border-radius: 999px; border:1px solid rgba(79,156,255,.45);
          background:#e6f2ff; color:#082b5c; font-weight:800; cursor:pointer;
        }
        .angle:hover { filter: brightness(1.03); }
      `}</style>
    </>
  );
}

/* --- tiny components --- */
function PlanCard({ title, price, blurb, highlight, cta, onBuy, btnVariant = "primary" }) {
  return (
    <div className="card">
      <h3 style={{ margin: "2px 0 6px" }}>
        {title} {highlight && (
          <span style={{
            marginLeft:8, padding:"2px 8px", borderRadius:999, fontSize:12,
            background:"#4f9cff", color:"#fff", fontWeight:900
          }}>Popular</span>
        )}
      </h3>
      <div style={{ fontSize:28, fontWeight:900, margin:"2px 0 6px" }}>{price}</div>
      <p className="sub">{blurb}</p>
      <button className={`btn btn-${btnVariant} btn-lg`} onClick={onBuy}>
        {cta}
      </button>
      <style jsx>{`.sub{opacity:.85}`}</style>
    </div>
  );
}


function CustomAmount({ onPay }) {
  const [val, setVal] = useState("10");
  const disabled = !Number.isFinite(Number(val)) || Number(val) <= 0;

  return (
    <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
      <input
        value={val}
        onChange={e => setVal(e.target.value)}
        inputMode="decimal"
        pattern="[0-9]*"
        placeholder="Amount (USD)"
        className="amt"
      />
      <button className="btn btn-primary" disabled={disabled} onClick={() => onPay(Number(val))}>
        {`Pay $${val}`}
      </button>
      <style jsx global>{`
  .btn{
    --bg1:#1d4ed8; --bg2:#2563eb; --txt:#fff;
    display:inline-flex; align-items:center; justify-content:center; gap:.5rem;
    padding:.60rem .95rem; border-radius:999px;
    border:1px solid rgba(255,255,255,.08);
    background:linear-gradient(135deg,var(--bg1),var(--bg2));
    color:var(--txt); font-weight:900; letter-spacing:.2px;
    box-shadow:0 10px 28px rgba(37,99,235,.35);
    transition:transform .12s, box-shadow .12s, filter .12s, border-color .12s;
    cursor:pointer; user-select:none; -webkit-tap-highlight-color:transparent;
  }
  .btn:hover{ filter:brightness(1.06); box-shadow:0 12px 34px rgba(37,99,235,.45); }
  .btn:active{ transform:translateY(1px); filter:brightness(0.98); }
  .btn-primary{} /* semantic */
  .btn-outline{
    background:transparent; color:#dbe7ff;
    border-color:rgba(111,227,255,.45); box-shadow:0 6px 18px rgba(0,0,0,.25);
  }
  .btn-outline:hover{ background:rgba(79,156,255,.14); }
  .btn-lg{ padding:.80rem 1.1rem; font-size:1.05rem; }
  .btn:disabled{ opacity:.5; cursor:not-allowed; box-shadow:none; transform:none; }
  .btn:focus-visible{ outline:2px solid #6fe3ff; outline-offset:2px; }
`}</style>

      <style jsx>{`
      
        .amt {
          width: 160px; padding:10px 12px; border-radius:12px;
          border:1px solid rgba(111,227,255,.35);
          background: rgba(9,18,48,.55); color:#dbe7ff; font-weight:800;
        }
      `}</style>
    </div>
  );
}

