// pages/live.js
import { useEffect, useRef, useState, useCallback } from "react";
import Head from "next/head";
import BrandTheme from "../components/BrandTheme";
import BrandLockup from "../components/BrandLockup";
import Offline from "../components/Offline";

// ethers v6
import { BrowserProvider, Contract, parseEther } from "ethers";

// ── ENV
const TIPJAR_ADDR = process.env.NEXT_PUBLIC_TIPJAR_ADDRESS;
const PAYOUT_ADDR = process.env.NEXT_PUBLIC_PAYOUT_ADDRESS;
const MOMENT_ADDR = process.env.NEXT_PUBLIC_MOMENT_ADDRESS;

// ── ABIs
const TIPJAR_ABI = [
  "function tip() payable",
  "function tipTo(address to) payable",
  "function tip(address to) payable",
  "function donate() payable",
];
const MOMENT_ABI = [
  "function mint() returns (uint256)",
  "function mintTo(address to) returns (uint256)",
  "function safeMint(address to) returns (uint256)",
  "function mintMoment(string uri) returns (uint256)",
  "function mintWithURI(string uri) returns (uint256)",
];

// ── helpers
const getProviderAndSigner = async () => {
  if (typeof window === "undefined" || !window.ethereum) throw new Error("No wallet found");
  await window.ethereum.request?.({ method: "eth_requestAccounts" });
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const account = await signer.getAddress();
  return { provider, signer, account };
};

/* ---------- Small helpers ---------- */
function ShareButton() {
  const [href, setHref] = useState("https://live.bluetubetv.live");
  useEffect(() => { if (typeof window !== "undefined") setHref(window.location.href); }, []);
  const text = encodeURIComponent("🎥 Live now — tip to keep the cameras rolling!");
  const via = "BlueTubeTV";
  const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(href)}&via=${via}`;
  return (
    <a className="angle" href={url} target="_blank" rel="noreferrer" title="Share on X/Twitter">
      Share ↗
    </a>
  );
}

function CopyLink() {
  const [copied, setCopied] = useState(false);
  return (
    <button className="angle" onClick={() => {
      if (typeof window === "undefined") return;
      navigator.clipboard.writeText(window.location.href).then(() => setCopied(true));
      setTimeout(() => setCopied(false), 1200);
    }}>
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}

/** Slim chat panel (Cbox) */
function ChatPanel() {
  const boxId = "3548678";
  const tag = "9qUukn";
  const src = `https://www3.cbox.ws/box/?boxid=${boxId}&boxtag=${tag}`;
  const pop = `${src}&boxtoggle=1`;
  return (
    <aside className="chatPanel card">
      <div className="chatHead">
        <strong>Chat</strong>
        <a href={pop} target="_blank" rel="noreferrer" className="chatPop">Pop-out ↗</a>
      </div>
      <iframe src={src} allow="autoplay" scrolling="auto" />
      <style jsx>{`
        .chatPanel{min-height:520px}
        .chatHead{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.08)}
        iframe{width:100%;height:480px;border:0;background:#050b20}
      `}</style>
    </aside>
  );
}

/** Bottom sponsor ticker */
function SponsorTicker({
  items = [
    { badge: "SPONSOR", text: "Live Oak Bank • Local Business Heroes" },
    { badge: "SPECIAL", text: "Harris Teeter • Weekend Specials" },
    { badge: "LOCAL", text: "Vigilant Coffee • Fresh Roast" },
  ],
}) {
  return (
    <div className="ticker" role="marquee" aria-label="Sponsors">
      <div className="ticker-track">
        {[...items, ...items].map((it, i) => (
          <span key={i} className="t-item"><span className="t-badge">{it.badge}</span>{it.text}</span>
        ))}
      </div>
      <style jsx>{`
        .ticker{position:fixed;left:0;right:0;bottom:0;z-index:50;background:linear-gradient(90deg,#0a0e27,#1a237e,#0f172a);border-top:1px solid rgba(255,255,255,.12);box-shadow:0 -6px 18px rgba(0,0,0,.35)}
        .ticker-track{display:flex;gap:40px;white-space:nowrap;overflow:hidden;animation:ticker 28s linear infinite;padding:10px 16px;font-weight:800;color:#dbe7ff}
        .ticker:hover .ticker-track{animation-play-state:paused}
        .t-badge{background:#4f9cff;color:#fff;padding:4px 8px;border-radius:999px;margin-right:10px;font-size:.8rem}
        @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      `}</style>
    </div>
  );
}

/* ---------- Main page ---------- */
export default function Live({ meta, angles, handle }) {
  const ANGLES = Array.isArray(angles) ? angles : [
    { name: "Cam A", url: process.env.NEXT_PUBLIC_HLS_A || process.env.NEXT_PUBLIC_LIVEPEER_HLS || "" },
    { name: "Cam B", url: process.env.NEXT_PUBLIC_HLS_B || "" },
  ];

  const pageTitle = meta?.title || "BlueTubeTV • Wilmington Live";
  const [idx, setIdx] = useState(0);
  const [split, setSplit] = useState(false);
  const [audioIdx, setAudioIdx] = useState(0);
  const [showChat, setShowChat] = useState(true);

  useEffect(() => { if (typeof window !== "undefined") setShowChat(window.innerWidth >= 1200); }, []);

  const activeUrl = ANGLES[idx]?.url || "";

  // ── Stripe (card) — minimal, robust
  const startStripe = useCallback(async (amountCents, kind = "tip") => {
    try {
      const r = await fetch("/api/stripe/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, amount: amountCents, kind }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data?.url) return alert(data?.error || `Stripe failed (HTTP ${r.status})`);
      window.location.href = data.url;
    } catch (e) {
      console.error(e);
      alert("Stripe failed (network).");
    }
  }, [handle]);

  // ── Crypto (Coinbase)
  const handleCryptoTip = useCallback(async (amount = 10) => {
    const pending = typeof window !== 'undefined' ? window.open('', '_blank', 'noopener') : null;
    try {
      const r = await fetch('/api/coinbase/create-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount, currency: 'USD',
          name: `BlueTubeTV Tip $${amount}`,
          description: 'Thanks for supporting the stream!',
          metadata: { handle, source: 'live' },
          redirect_url: typeof window !== 'undefined' ? window.location.href : undefined,
          cancel_url:   typeof window !== 'undefined' ? window.location.href : undefined,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data?.hosted_url) {
        if (pending) pending.close();
        return alert((typeof data?.error === 'string' ? data.error : 'Crypto checkout failed') + (r.status ? ` (HTTP ${r.status})` : ''));
      }
      if (pending) pending.location = data.hosted_url; else window.open(data.hosted_url, '_blank', 'noopener');
    } catch (e) {
      if (pending) pending.close();
      console.error(e); alert('Crypto checkout failed (network).');
    }
  }, [handle]);

  // ── Chain switcher
  const ensureLocalChain = useCallback(async () => {
    const ethereum = typeof window !== "undefined" ? window.ethereum : null;
    if (!ethereum) throw new Error("No wallet found");
    const HH = "0x7A69"; // 31337
    try {
      await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: HH }] });
    } catch (e) {
      if (e?.code === 4902) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{ chainId: HH, chainName: "Localhost 8545 (Hardhat)", rpcUrls: ["http://127.0.0.1:8545"], nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 } }],
        });
        await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: HH }] });
      } else { throw e; }
    }
  }, []);

  // ── ETH tip
  const handleEthTip = useCallback(async (ethAmount = "0.002") => {
    await ensureLocalChain();
    try {
      const { signer, account } = await getProviderAndSigner();
      const value = parseEther(ethAmount);
      if (TIPJAR_ADDR) {
        const jar = new Contract(TIPJAR_ADDR, TIPJAR_ABI, signer);
        let tx;
        try { tx = await jar["tip()"]({ value }); }
        catch { try { tx = await jar["tipTo(address)"](PAYOUT_ADDR || account, { value }); }
        catch { try { tx = await jar["tip(address)"](PAYOUT_ADDR || account, { value }); }
        catch { try { tx = await jar["donate()"]({ value }); }
        catch { tx = await signer.sendTransaction({ to: PAYOUT_ADDR || account, value }); }}}}
        await tx.wait(); alert(`Tipped ${ethAmount} ETH ✅`);
      } else {
        const tx = await signer.sendTransaction({ to: PAYOUT_ADDR || account, value });
        await tx.wait(); alert(`Sent ${ethAmount} ETH to payout ✅`);
      }
    } catch (e) { console.error("handleEthTip error:", e); alert(e?.message || "ETH tip failed"); }
  }, [ensureLocalChain]);

  // ── Mint moment
  const handleMintMoment = useCallback(async () => {
    await ensureLocalChain();
    try {
      if (!MOMENT_ADDR) throw new Error("MOMENT contract address missing");
      const { signer, account } = await getProviderAndSigner();
      const nft = new Contract(MOMENT_ADDR, MOMENT_ABI, signer);
      let tx;
      try { tx = await nft["mint()"](); }
      catch { try { tx = await nft["mintTo(address)"](account); }
      catch { try { tx = await nft["safeMint(address)"](account); }
      catch {
        const now = new Date().toISOString();
        const meta = { name: "BlueTubeTV Moment", description: "Minted live on stream", timestamp: now };
        const dataURI = `data:application/json,${encodeURIComponent(JSON.stringify(meta))}`;
        try { tx = await nft["mintMoment(string)"](dataURI); }
        catch { tx = await nft["mintWithURI(string)"](dataURI); }
      }}}
      const receipt = await tx.wait(); alert(`Minted! tx: ${receipt.transactionHash}`);
    } catch (e) { console.error("handleMintMoment error:", e); alert(e?.message || "Mint failed"); }
  }, [ensureLocalChain]);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="Live from Wilmington. Tips keep the cameras rolling." />
      </Head>

      <BrandTheme>
        <div className="page">
          {/* Header */}
          <header className="topbar">
            <span className="pill live">LIVE • Wilmington</span>
            <BrandLockup size="md" inline />
            <div style={{ flex: 1 }} />
            <button className="angle" onClick={() => handleCryptoTip(10)}>Crypto Tip $10</button>
            <button className="angle" onClick={() => handleEthTip("0.002")}>ETH Tip</button>
            <button className="angle" onClick={handleMintMoment}>Mint</button>
            <ShareButton />
            <CopyLink />
          </header>

          {/* Angle controls */}
          <div className="anglebar">
            {ANGLES.map((a, i) => (
              <button key={i} type="button"
                className={`angle ${i === idx && !split ? "angle--active" : ""}`}
                onClick={() => { setSplit(false); setIdx(i); }}
                disabled={!a.url} title={a.url ? a.url : "No URL set"}>
                {a.name}
              </button>
            ))}
            <button type="button" className={`angle ${split ? "angle--active" : ""}`}
              onClick={() => { setSplit(s => !s); setAudioIdx(0); }}
              disabled={!ANGLES[0]?.url || !ANGLES[1]?.url} title="Show both">
              Split
            </button>
          </div>

          {/* Grid: player + (optional chat) */}
          <div className={`grid ${showChat ? "grid--chat" : "grid--nochat"}`}>
            <section className="player-shell brand-ring card" aria-label="Live player">
              {split ? (
                <div className="grid2">
                  <div className="player-shell brand-ring"><PlayerSection hlsUrl={ANGLES[0]?.url} label="Cam A" active muted={audioIdx !== 0} /></div>
                  <div className="player-shell brand-ring"><PlayerSection hlsUrl={ANGLES[1]?.url} label="Cam B" active muted={audioIdx !== 1} /></div>
                </div>
              ) : (
                <PlayerSection hlsUrl={activeUrl} label={ANGLES[idx]?.name || "Cam"} active muted={false} />
              )}
              {split && (
                <div className="anglebar" style={{ marginTop: 6 }}>
                  <span style={{ color: "#dbe7ff" }}>Audio:</span>
                  <select className="angle" value={audioIdx} onChange={(e)=>setAudioIdx(parseInt(e.target.value,10))} title="Select Audio">
                    {ANGLES.map((a,i)=>(<option key={i} value={i} disabled={!a.url}>{a.name} Audio</option>))}
                  </select>
                </div>
              )}
            </section>
            {showChat ? <ChatPanel /> : null}
          </div>
        </div>

        <SponsorTicker />

        {/* Tip rail */}
        <div id="tipbar">
          {[5,10,25,50].map(amt => (
            <button key={`card-${amt}`} className="tipbtn" onClick={() => startStripe(amt*100, "tip")}>Card Tip ${amt}</button>
          ))}
          {[5,10,25,50].map(amt => (
            <button key={`c-${amt}`} className="tipbtn" onClick={() => handleCryptoTip(amt)}>Crypto Tip ${amt}</button>
          ))}
          <button className="tipbtn" onClick={() => handleEthTip("0.002")}>ETH Tip</button>
          <button className="tipbtn" onClick={handleMintMoment}>Mint this moment</button>
          <button className="tipbtn" onClick={() => startStripe(10000, "sponsor")}>Sponsor</button>
        </div>

        <style jsx>{`
          :root{--bg-1:#07132e;--bg-2:#0e224d;--ink:#dbe7ff;--accent:#6fe3ff;--accent-2:#4f9cff;--pill:#e6f2ff;--pill-text:#082b5c;--ring-outer:rgba(111,227,255,.65);--ring-inner:rgba(111,227,255,.14);--ring-shadow:rgba(79,156,255,.22)}
          .page{max-width:1280px;margin:0 auto;padding:20px 18px 146px;color:var(--ink);background:radial-gradient(1200px 700px at 14% 12%, rgba(79,156,255,.16), transparent 55%),radial-gradient(1000px 600px at 86% 90%, rgba(111,227,255,.1), transparent 55%),linear-gradient(180deg, var(--bg-1), var(--bg-2));border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.35) inset}
          .topbar{position:sticky;top:0;display:flex;align-items:center;gap:12px;padding:12px 0;background:linear-gradient(180deg, rgba(12,28,66,.35), rgba(12,28,66,.05));backdrop-filter:blur(6px);border-bottom:1px solid rgba(42,79,168,.35);z-index:5}
          .pill.live{padding:4px 10px;border-radius:999px;font-weight:800;background:#c8ffe6;color:#064e3b;border:1px solid rgba(16,185,129,.35)}
          .anglebar{display:flex;gap:8px;margin:12px 0 8px;align-items:center;flex-wrap:wrap}
          .angle{padding:8px 12px;border-radius:999px;border:1px solid rgba(79,156,255,.45);background:var(--pill);color:var(--pill-text);font-weight:800;cursor:pointer;transition:transform .12s ease, box-shadow .12s ease}
          .angle:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(0,0,0,.25)}
          .angle:disabled{opacity:.5;cursor:not-allowed}
          .angle--active{background:var(--accent);color:#052342}
          .player-shell{border-radius:20px;overflow:hidden;background:#0b1d41;box-shadow:0 10px 28px rgba(0,0,0,.3);margin-top:8px}
          .brand-ring{box-shadow:0 0 0 2px var(--ring-outer), inset 0 0 44px var(--ring-inner), 0 0 60px var(--ring-shadow)}
          .grid{display:grid;gap:16px}
          @media(min-width:1200px){.grid.grid--chat{grid-template-columns:2fr .95fr}.grid.grid--nochat{grid-template-columns:1fr}}
          @media(max-width:1199px){.grid{grid-template-columns:1fr}}
          .card{background:#0b1338;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35)}
          .grid2{display:grid;gap:12px;grid-template-columns:1fr 1fr}
          @media(max-width:900px){.grid2{grid-template-columns:1fr}}
          :global(.video-badge){position:absolute;left:12px;top:10px;z-index:2;padding:4px 8px;border-radius:999px;font-weight:800;background:#e6f6ff;color:#082b5c;border:1px solid rgba(79,156,255,.45)}
          #tipbar{position:fixed;left:0;right:0;bottom:56px;padding:10px 14px;display:flex;justify-content:center;gap:12px;z-index:60;pointer-events:none}
          #tipbar .tipbtn{pointer-events:auto;padding:10px 16px;border:0;border-radius:12px;font-weight:700;letter-spacing:.2px;cursor:pointer;background:linear-gradient(135deg,#1d4ed8,#2563eb);color:#fff;box-shadow:0 8px 24px rgba(37,99,235,.35);transition:transform .15s ease, box-shadow .15s ease, opacity .2s ease}
          #tipbar .tipbtn:hover{transform:translateY(-1px);box-shadow:0 10px 28px rgba(37,99,235,.45)}
          #tipbar .tipbtn:active{transform:translateY(0);opacity:.9}
          @media (max-width:480px){#tipbar{bottom:64px;gap:10px}}
        `}</style>
      </BrandTheme>
    </>
  );
}

/* ---------- Video player ---------- */
function PlayerSection({ hlsUrl, label, active = true, muted = false }) {
  const videoRef = useRef(null);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    if (!active || !hlsUrl) return;
    let hls;
    let destroyed = false;
    const video = videoRef.current;
    if (!video) return;

    const boot = async () => {
      const { default: Hls } = await import("hls.js");
      const markOnline = () => { if (!destroyed) { setOnline(true); video.play().catch(()=>{}); } };

      if (Hls.isSupported()) {
        hls = new Hls({
          lowLatencyMode: true,
          maxBufferLength: 10,
          liveBackBufferLength: 30,
          liveSyncDurationCount: 3,
          capLevelToPlayerSize: true,
          enableWorker: true,
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data?.fatal) {
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) { try { hls.startLoad(); } catch {} }
            else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) { try { hls.recoverMediaError(); } catch {} }
            else { setOnline(false); }
          }
        });

        hls.attachMedia(video);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(hlsUrl));
        hls.on(Hls.Events.MANIFEST_PARSED, markOnline);
        hls.on(Hls.Events.LEVEL_LOADED, markOnline);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl;
        video.addEventListener("loadedmetadata", () => markOnline(), { once: true });
      }
    };

    boot();
    return () => { destroyed = true; try { if (hls) hls.destroy(); } catch {} setOnline(false); };
  }, [hlsUrl, active]);

  useEffect(() => { if (videoRef.current) videoRef.current.muted = !!muted; }, [muted]);

  return (
    <div style={{ position: "relative" }}>
      <span style={{ position:"absolute", left:12, top:10, zIndex:2, padding:"4px 8px",
        borderRadius:999, fontWeight:800, background:"#e6f6ff", color:"#082b5c",
        border:"1px solid rgba(79,156,255,.45)" }}>
        {label}
      </span>
      <video ref={videoRef} controls playsInline preload="metadata" poster="/offline-poster.png"
             muted={muted} style={{ width:"100%", aspectRatio:"16/9", background:"#000" }} />
      {!online && <Offline variant="badge" />}
    </div>
  );
}
