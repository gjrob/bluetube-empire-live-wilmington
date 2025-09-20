/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import BrandTheme from "../components/BrandTheme";
import BrandLockup from "../components/BrandLockup";
import { BrowserProvider, Contract, parseEther } from "ethers";

const MultiCamLive = dynamic(() => import("../components/MultiCamLive"), { ssr: false });

const SITE_URL    = process.env.NEXT_PUBLIC_SITE_URL || "https://live.bluetubetv.live";
const TIPJAR_ADDR = process.env.NEXT_PUBLIC_TIPJAR_ADDRESS;
const PAYOUT_ADDR = process.env.NEXT_PUBLIC_PAYOUT_ADDRESS;
const MOMENT_ADDR = process.env.NEXT_PUBLIC_MOMENT_ADDRESS;

const SC_TRACK_ID = "943082998";

// FIX: Read HLS URLs once at the top, so they are available for client-side use
const HLS_A = process.env.NEXT_PUBLIC_HLS_A || process.env.NEXT_PUBLIC_LIVEPEER_HLS || "";
const HLS_B = process.env.NEXT_PUBLIC_HLS_B || "";

/* ---------------- helpers ---------------- */
async function getProviderAndSigner() {
  if (typeof window === "undefined" || !window.ethereum) throw new Error("No wallet found");
  await window.ethereum.request?.({ method: "eth_requestAccounts" });
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const account = await signer.getAddress();
  return { provider, signer, account };
}
function ShareButton() {
  const [href, setHref] = useState(SITE_URL + "/live");
  useEffect(() => { if (typeof window !== "undefined") setHref(window.location.href); }, []);
  const text = encodeURIComponent("🎥 Live now — tip to keep the cameras rolling!");
  const via  = "BlueTubeTV";
  const url  = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(href)}&via=${via}`;
  return <a className="angle" href={url} target="_blank" rel="noreferrer">Share ↗</a>;
}
function MapButton({ campaign = "showcase", newTab = true }) {
  const href = `/map?campaign=${encodeURIComponent(campaign)}`;
  const tab  = newTab ? { target: "_blank", rel: "noreferrer" } : {};
  return <a className="angle" href={href} {...tab}>Map • Center{newTab ? " ↗" : ""}</a>;
}
function CopyLink() {
  const [copied, setCopied] = useState(false);
  return (
    <button className="angle" onClick={() => {
      if (typeof window === "undefined") return;
      navigator.clipboard.writeText(window.location.href).then(() => setCopied(true));
      setTimeout(() => setCopied(false), 1200);
    }}>{copied ? "Copied!" : "Copy link"}</button>
    );
  }
/* ---------------- chat + ticker (unchanged) ---------------- */
function ChatPanel() {
  const src = `https://www3.cbox.ws/box/?boxid=3548678&boxtag=9qUukn&theme=light&boxbg=transparent&boxborder=0`;
  return (
    <aside className="chatPanel card glass">
      <div className="chatHead">
        <strong>Chat</strong>
        <a href={`${src}&boxtoggle=1`} target="_blank" rel="noreferrer" className="chatPop">Pop-out ↗</a>
      </div>
      <div className="chatWrap">
        <iframe src={src} allow="autoplay" scrolling="auto" style={{ background: "transparent" }} />
      </div>
      <style jsx>{`
        .chatPanel { min-height: 520px; overflow: hidden; border-radius: 14px }
        .chatHead { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid rgba(255,255,255,.08) }
        .glass { background: linear-gradient(180deg, rgba(11,19,56,.35), rgba(11,19,56,.08)); backdrop-filter: blur(8px) saturate(120%); border: 1px solid rgba(111,227,255,.20); box-shadow: 0 8px 28px rgba(0,0,0,.35) }
        iframe { width:100%; height:480px; border:0; background:transparent }
      `}</style>
    </aside>
  );
}
function SponsorTicker({ items = [
  { badge: "SPONSOR", text: "Live Oak Bank • Local Business Heroes" },
  { badge: "SPECIAL", text: "Creator Print House • Custom Merchandise" },
  { badge: "HOT",     text: "Sweet D's Cuisine • HOMEMADE SWEETS" },
  { badge: "Cigars",  text: "Sip And Chill • Lounge" },
  { badge: "SUPPORT", text: "On Tyme Restaurant • Restaurant" },
]}) {
  return (
    <div className="ticker">
      <div className="ticker-track">
        {items.concat(items).map((it,i) => (
          <span key={i}><span className="t-badge">{it.badge}</span>{it.text}</span>
        ))}
      </div>
      <style jsx>{`
        .ticker { position:fixed; left:0; right:0; bottom:0; z-index:50; background:linear-gradient(90deg,#0a0e27,#1a237e,#0f172a); border-top:1px solid rgba(255,255,255,.12); box-shadow:0 -6px 18px rgba(0,0,0,.35) }
        .ticker-track { display:flex; gap:40px; white-space:nowrap; overflow:hidden; animation:ticker 28s linear infinite; padding:10px 16px; font-weight:800; color:#dbe7ff }
        .ticker:hover .ticker-track { animation-play-state: paused }
        .t-badge { background:#4f9cff; color:#fff; padding:4px 8px; border-radius:999px; margin-right:10px; font-size:.8rem }
        @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
      `}</style>
    </div>
  );
}

/* ---------------- page ---------------- */
export default function Live(props) {
  const meta   = props?.meta || {};
  const angles = props?.angles || [];
  // FIX: Use HLS_A and HLS_B from top-level constants
  const ANGLES = Array.isArray(angles) && angles.length ? angles : [
    { name: "Cam A", url: HLS_A },
    { name: "Cam B", url: HLS_B },
  ];

  const pageTitle = meta.title || "BlueTubeTV • Wilmington Live";

  // view + audio
  const [idx, setIdx] = useState(0);           // 0=A, 1=B
  const [split, setSplit] = useState(false);
  const [audioIdx, setAudioIdx] = useState(0); // 0:A, 1:B, 2:SC
  const [showChat, setShowChat] = useState(true);

  // readiness
  const [camAReady, setCamAReady] = useState(false);
  const [camBReady, setCamBReady] = useState(false);
  const canSplit = camAReady && camBReady;

  // wallet
  const [ready, setReady] = useState(false);
  useEffect(() => { (async () => { try { const { signer } = await getProviderAndSigner(); if (signer) setReady(true); } catch {} })(); }, []);
  useEffect(() => { if (typeof window !== "undefined") setShowChat(window.innerWidth >= 1200); }, []);

  /* ------- payments (Stripe uses USD, not cents) ------- */
  const startStripe = useCallback(async (amountUsd, kind = "tip") => {
    try {
      const r = await fetch("/api/stripe/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: "live", amount: amountUsd, kind }), // dollars
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data?.url) return alert(data?.error || `Stripe failed (HTTP ${r.status})`);
      window.location.href = data.url;
    } catch { alert("Stripe failed (network)."); }
  }, []);

  const ensureLocalChain = useCallback(async () => {
    const ethereum = typeof window !== "undefined" ? window.ethereum : null;
    if (!ethereum) throw new Error("No wallet found");
    const HH = "0x7A69";
    try { await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: HH }] }); }
    catch (e) {
      if (e?.code === 4902) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{ chainId: HH, chainName: "Localhost 8545 (Hardhat)", rpcUrls: ["http://127.0.0.1:8545"], nativeCurrency: { name:"ETH", symbol:"ETH", decimals:18 } }],
        });
        await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: HH }] });
      } else { throw e; }
    }
  }, []);
  const handleEthTip = useCallback(async (ethAmount = "0.002") => {
    await ensureLocalChain();
    try {
      const { signer, account } = await getProviderAndSigner();
      const value = parseEther(ethAmount);
      if (TIPJAR_ADDR) {
        const jar = new Contract(TIPJAR_ADDR, [
          "function tip() payable", "function tipTo(address to) payable",
          "function tip(address to) payable", "function donate() payable",
        ], signer);
        let tx;
        try { tx = await jar["tip()"]({ value }); }
        catch { try { tx = await jar["tipTo(address)"](PAYOUT_ADDR || account, { value }); }
        catch { try { tx = await jar["tip(address)"](PAYOUT_ADDR || account, { value }); }
        catch { try { tx = await jar["donate()"]({ value }); }
        catch { tx = await signer.sendTransaction({ to: PAYOUT_ADDR || account, value }); }}}}
        await tx.wait(); alert(`Tipped ${ethAmount} ETH ✅`);
      } else {
        const tx = await signer.sendTransaction({ to: PAYOUT_ADDR || account, value });
        await tx.wait(); alert(`Sent ${ethAmount} ETH ✅`);
      }
    } catch (e) { alert(e?.message || "ETH tip failed"); }
  }, [ensureLocalChain]);

  /* ---------------- render ---------------- */
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <link rel="canonical" href={`${SITE_URL}/live`} />
        <meta property="og:url" content={`${SITE_URL}/live`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="BlueTubeTV • Wilmington Live" />
        <meta property="og:description" content="Tap in to the live stream and support the movement." />
        <meta property="og:image" content={`${SITE_URL}/og-yg-live.png`} />
        <meta name="twitter:image" content={`${SITE_URL}/og-yg-live.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BlueTubeTV • Wilmington Live" />
        <meta name="twitter:description" content="Tap in to the live stream and support the movement." />
        <meta name="twitter:image" content={`${SITE_URL}/og-yg-live.png`} />
      </Head>

      <BrandTheme>
        <div className="page">
          <header className="topbar">
            <span className="pill live">LIVE • Wilmington</span>
            <BrandLockup size="md" inline />
            <a href="/yb-raleigh" className="angle">YB Raleigh • Oct 24</a>
            <div style={{ flex: 1 }} />
            <button className="angle" onClick={() => startStripe(10)}>Card Tip $10</button>
            <button className="angle" onClick={() => handleEthTip("0.002")} disabled={!ready}>ETH Tip</button>
            <MapButton campaign="showcase" newTab />
            <a href="/sponsor" className="angle">Sponsor</a>
            <ShareButton />
            <CopyLink />
          </header>
          <a href="/yb-raleigh" aria-label="Red Eye — YoungBoy">
  <img
    src="/og-yg-live.png"       // or "/castle.png"
    alt="MASA — YoungBoy"
    style={{
      width: "100%", maxWidth: 720, height: "auto",
      borderRadius: 12, border: "1px solid #1f2937",
      display: "block", margin: "8px auto 0"
    }}
  />
</a>
          <a className="angle" href="/drone-fund">Donate</a>
          <a href="/yb-raleigh" aria-label="NBA YoungBoy — Raleigh">
            <img
              src="/og-yb-live.png"
              alt="NBA YoungBoy — Raleigh • Oct 24"
              style={{ width: "100%", maxWidth: 720, height: "auto", borderRadius: 12, border: "1px solid #1f2937", display: "block", margin: "8px auto 0" }}
            />
          </a>
<a className="angle" href="/home">Home</a>
  {/* Anglebar: view + audio */}
<div className="anglebar">
  {/* A/B single-view */}
  {ANGLES.map((a, i) => (
    <button
      key={i}
      type="button"
      className={`angle ${i === idx && !split ? "angle--active" : ""}`}
      onClick={() => { setSplit(false); setIdx(i); }}
      disabled={!a.url}
      title={a.url ? a.url : "No URL set"}
    >
      {a.name}
    </button>
  ))}
<a className="angle" href="/sponsor">Sponsor • Badges</a>

  {/* Split toggle (button) */}
  <button
    type="button"
    className={`angle ${split ? "angle--active" : ""}`}
    onClick={() => { setSplit(s => !s); setAudioIdx(0); }}
    disabled={!ANGLES[0]?.url || !ANGLES[1]?.url || !canSplit}
    title={canSplit ? "Show both" : "Waiting for both feeds"}
  >
    Split
  </button>

  {/* Convenience: one-click SoundCloud.
     If not split, this turns split ON and sets audio to SC. */}
  <button
    type="button"
    className={`angle ${split && audioIdx === 2 ? "angle--active" : ""}`}
    onClick={() => { if (!split) setSplit(true); setAudioIdx(2); }}
    title="Use SoundCloud audio in split view"
  >
    SoundCloud
  </button>
</div>
<div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center", margin:"8px 0 4px" }}>
  <label style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
    <input
      type="checkbox"
      checked={split}
      onChange={() => { setSplit(s => !s); setAudioIdx(0); }}
    />
    <span>Split View</span>
  </label>

            {split && (
              <div style={{ display:"inline-flex", gap:8, alignItems:"center", marginLeft:12 }}>
                <span style={{ opacity:.7 }}>Audio from:</span>
                <button className={`angle ${audioIdx === 0 ? "angle--active" : ""}`} onClick={() => setAudioIdx(0)}>Cam A</button>
                <button className={`angle ${audioIdx === 1 ? "angle--active" : ""}`} onClick={() => setAudioIdx(1)}>Cam B</button>
                <button className={`angle ${audioIdx === 2 ? "angle--active" : ""}`} onClick={() => setAudioIdx(2)}>SoundCloud</button>
              </div>
            )}
          </div>

          {/* Player + Chat */}
          <div className={`grid ${showChat ? "grid--chat" : "grid--nochat"}`}>
            <section className="player-shell brand-ring card" aria-label="Live player">
              <MultiCamLive
                state={{
                  layout: split ? 'split' : 'single',
                  active: idx === 0 ? 'a' : 'b',
                  audioFrom: audioIdx === 0 ? 'a' : audioIdx === 1 ? 'b' : 'sc',
                }}
                // FIX: Pass HLS_A and HLS_B from top-level constants
                urls={{ a: HLS_A, b: HLS_B }}
                soundcloud={{ trackId: SC_TRACK_ID }}
                overlay
                onReady={(which, ok) => {
                  if (which === 'a') setCamAReady(ok);
                  if (which === 'b') setCamBReady(ok);
                }}
                 promo={{ src: "/promos/tiktok-tim-qr.png", width: 140 }}  // <- your QR overlay

              />
            </section>
            {showChat ? <ChatPanel /> : null}
          </div>

          <SponsorTicker />

          <div id="tipbar">
            {[5,10,25,50].map((amt) => (
              <button key={`card-${amt}`} className="tipbtn" onClick={() => startStripe(amt)}>Card Tip ${amt}</button>
            ))}
            <button className="tipbtn" onClick={() => startStripe(500, "sponsor")}>Sponsor</button>
          </div>

          <style jsx>{`
            :root { --bg-1:#07132e; --bg-2:#0e224d; --ink:#dbe7ff; --accent:#6fe3ff; --accent-2:#4f9cff; --pill:#e6f2ff; --pill-text:#082b5c; --ring-outer:rgba(111,227,255,.65); --ring-inner:rgba(111,227,255,.14); --ring-shadow:rgba(79,156,255,.22) }
            .page { max-width:1280px; margin:0 auto; padding:20px 18px 176px; color:var(--ink);
                    background:radial-gradient(1200px 700px at 14% 12%, rgba(79,156,255,.16), transparent 55%),
                               radial-gradient(1000px 600px at 86% 90%, rgba(111,227,255,.1), transparent 55%),
                               linear-gradient(180deg, var(--bg-1), var(--bg-2)); border-radius:18px; box-shadow:0 20px 60px rgba(0,0,0,.35) inset }
            .topbar { position:sticky; top:0; display:flex; align-items:center; gap:12px; padding:12px 0;
                      background:linear-gradient(180deg, rgba(12,28,66,.35), rgba(12,28,66,.05));
                      backdrop-filter:blur(6px); border-bottom:1px solid rgba(42,79,168,.35); z-index:5 }
            .pill.live { padding:4px 10px; border-radius:999px; font-weight:800; background:#c8ffe6; color:#064e3b; border:1px solid rgba(16,185,129,.35) }
            .anglebar { display:flex; gap:8px; margin:12px 0 8px; align-items:center; flex-wrap:wrap }
            .angle { padding:8px 12px; border-radius:999px; border:1px solid rgba(79,156,255,.45); background:#e6f2ff; color:#082b5c; font-weight:800; cursor:pointer }
            .angle--active { background:#6fe3ff; color:#052342 }
            .player-shell { border-radius:20px; overflow:hidden; background:#0b1d41; box-shadow:0 10px 28px rgba(0,0,0,.3); margin-top:8px }
            .brand-ring { box-shadow:0 0 0 2px var(--ring-outer), inset 0 0 44px var(--ring-inner), 0 0 60px var(--ring-shadow) }
            .grid { display:grid; gap:16px }
            @media (min-width:1200px) { .grid.grid--chat { grid-template-columns:2fr .95fr } .grid.grid--nochat { grid-template-columns:1fr } }
            @media (max-width:1199px) { .grid { grid-template-columns:1fr } }
            .card { background:#0b1338; border-radius:14px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,.35) }
            #tipbar { position:fixed; left:0; right:0; bottom:112px; padding:10px 14px; display:flex; justify-content:center; gap:12px; z-index:60; pointer-events:none }
            #tipbar .tipbtn { pointer-events:auto; padding:10px 16px; border:0; border-radius:12px; font-weight:700; background:linear-gradient(135deg,#1d4ed8,#2563eb); color:#fff;
                               box-shadow:0 8px 24px rgba(37,99,235,.35); }
          `}</style>
          </div>
      </BrandTheme>
 </>
  );
}