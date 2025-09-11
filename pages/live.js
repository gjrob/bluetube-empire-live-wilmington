// pages/live.js
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef, useState, useCallback } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import BrandTheme from "../components/BrandTheme";
import BrandLockup from "../components/BrandLockup";
import Offline from "../components/Offline";
import CountdownChip from "../components/CountdownChip";
import { BrowserProvider, Contract, parseEther } from "ethers";
import CheckoutButton from "../components/CheckoutButton";

const SITE_URL   = process.env.NEXT_PUBLIC_SITE_URL || "https://live.bluetubetv.live";
const TIPJAR_ADDR = process.env.NEXT_PUBLIC_TIPJAR_ADDRESS;
const PAYOUT_ADDR = process.env.NEXT_PUBLIC_PAYOUT_ADDRESS;
const MOMENT_ADDR = process.env.NEXT_PUBLIC_MOMENT_ADDRESS;
const API_BASE    = process.env.NEXT_PUBLIC_PINS_API;

// Optional: show promo until a start time (unused by default, keep for future)
const EVENT_START_MS = new Date("2025-10-24T19:30:00-04:00").getTime();

/* -------------------------- ABIs ----------------------------- */
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

/* ------------------------ Utilities -------------------------- */
async function getProviderAndSigner() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No wallet found");
  await window.ethereum.request?.({ method: "eth_requestAccounts" });
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const account = await signer.getAddress();
  return { provider, signer, account };
}

  const text = encodeURIComponent("🎥 Live now — tip to keep the cameras rolling!");
  const via  = "BlueTubeTV";
  const url  = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(href)}&via=${via}`;

  const mapHref = "/map?campaign=showcase"; // open full map page

  return (
    <>
      <a className="angle" href={url} target="_blank" rel="noreferrer" title="Share on X/Twitter">
        Share ↗
      </a>

      <a className="angle" href={mapHref} target="_blank" rel="noreferrer" title="Open sponsor map">
        Map • Center ↗
      </a>
    </>
  );
}
/* -------------------- Small helper UI bits -------------------- */
function ShareButton() {
  const [href, setHref] = useState("https://live.bluetubetv.live");
  useEffect(() => { if (typeof window !== "undefined") setHref(window.location.href); }, []);
  const text = encodeURIComponent("🎥 Live now — tip to keep the cameras rolling!");
  const via  = "BlueTubeTV";
  const url  = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(href)}&via=${via}`;
  return (
    <a className="angle" href={url} target="_blank" rel="noreferrer" title="Share on X/Twitter">
      Share ↗
    </a>
  );
}  // ← make sure this closing brace is here

function MapButton({ campaign = "showcase", newTab = true }) {
  const href = `/map?campaign=${encodeURIComponent(campaign)}`;
  const tab  = newTab ? { target: "_blank", rel: "noreferrer" } : {};
  return (
    <a className="angle" href={href} {...tab} title="Open sponsor map">
      Map • Center{newTab ? " ↗" : ""}
    </a>
  );
}


function CopyLink() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="angle"
      onClick={() => {
        if (typeof window === "undefined") return;
        navigator.clipboard.writeText(window.location.href).then(() => setCopied(true));
        setTimeout(() => setCopied(false), 1200);
      }}
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}

/** Slim chat panel (Cbox) */
function ChatPanel() {
  const boxId = "3548678";
  const tag = "9qUukn";

  // Try transparent-ish theme knobs. If Cbox ignores them, the wrapper still makes it look glassy.
  const params = [
    `boxid=${boxId}`,
    `boxtag=${tag}`,
    // Optional “theme-ish” hints — harmless if ignored
    `theme=light`,
    `boxbg=transparent`,
    `boxborder=0`,
  ].join("&");

  const src = `https://www3.cbox.ws/box/?${params}`;
  const pop = `${src}&boxtoggle=1`;

  return (
    <aside className="chatPanel card glass">
      <div className="chatHead">
        <strong>Chat</strong>
        <a href={pop} target="_blank" rel="noreferrer" className="chatPop">Pop-out ↗</a>
      </div>

      <div className="chatWrap">
        <iframe
          src={src}
          allow="autoplay"
          scrolling="auto"
          allowTransparency="true"
          style={{ background: "transparent" }}
        />
      </div>

      <style jsx>{`
        .chatPanel { min-height: 520px; overflow: hidden; border-radius: 14px }
        .chatHead {
          display:flex; align-items:center; justify-content:space-between;
          padding:10px 12px; border-bottom:1px solid rgba(255,255,255,.08)
        }
        .chatWrap {
          position: relative;
          background: transparent;
        }
        .glass {
          background: linear-gradient(180deg, rgba(11,19,56,.35), rgba(11,19,56,.08));
          backdrop-filter: blur(8px) saturate(120%);
          border: 1px solid rgba(111,227,255,.20);
          box-shadow: 0 8px 28px rgba(0,0,0,.35);
        }
        iframe {
          width:100%; height:480px; border:0; background:transparent;
        }
      `}</style>
    </aside>
  );
}


/** Bottom sponsor ticker */
function SponsorTicker({
  items = [
    { badge: "SPONSOR", text: "Live Oak Bank • Local Business Heroes" },
    { badge: "SPECIAL", text: "Creator Print House • Custom Merchandise" },
    { badge: "HOT",     text: "Sweet D's Cuisine • HOMEMADE SWEETS" },
    { badge: "Cigars",   text: "Sip And Chill" },
    { badge: "SUPPORT", text: "On Tyme Restaurant • Restaurant" },
  ],
}) {
  return (
    <div className="ticker">
      <div className="ticker-track">
        {items.concat(items).map((item, i) => (
          <span key={i}>
            <span className="t-badge">{item.badge}</span>
            {item.text}
          </span>
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

/* ---------------------- Media components --------------------- */
// ===== CAM A: SoundCloud (hard-wired) =====
const SC_TRACK_ID = "943082998"; // <-- replace with the exact SoundCloud track id you want

function CamA_Live({ hlsUrl, muted = true, onReady }) {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let hls; let destroyed = false;
    if (typeof window === "undefined" || !hlsUrl || !videoRef.current) return;

    (async () => {
      const video = videoRef.current;
      const setOK = () => { if (!destroyed) { setReady(true); onReady?.(true); video.play().catch(()=>{}); } };
      try {
        const { default: Hls } = await import("hls.js");
        if (Hls.isSupported()) {
          hls = new Hls({ lowLatencyMode:true, liveSyncDurationCount:3, capLevelToPlayerSize:true, enableWorker:true });
          hls.attachMedia(video);
          hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(hlsUrl));
          hls.on(Hls.Events.MANIFEST_PARSED, setOK);
          hls.on(Hls.Events.LEVEL_LOADED, setOK);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = hlsUrl;
          video.addEventListener("loadedmetadata", setOK, { once:true });
        }
      } catch (e) {
        const v = videoRef.current;
        if (v?.canPlayType("application/vnd.apple.mpegurl")) {
          v.src = hlsUrl; v.addEventListener("loadedmetadata", setOK, { once:true });
        }
      }
    })();

    return () => { destroyed = true; try { hls?.destroy(); } catch {} };
  }, [hlsUrl, onReady]);

  return (
    <div style={{ position:"relative" }}>
      <video ref={videoRef} controls playsInline preload="metadata" poster="/offline-poster.png"
             muted={muted} style={{ width:"100%", aspectRatio:"16/9", background:"#000" }} />
      {!ready && (
        <div style={{ position:"absolute", inset:0, display:"grid", placeItems:"center",
                      color:"#aab4ff", background:"linear-gradient(180deg,#0b1338cc,#0b133800)" }}>
          Connecting to Cam A…
        </div>
      )}
    </div>
  );
}


// ===== CAM B: HLS live video =====
function CamB_Live({ hlsUrl, muted = true, onReady }) {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let hls;
    let destroyed = false;
    if (typeof window === "undefined") return;
    if (!hlsUrl || !videoRef.current) return;

    (async () => {
      const video = videoRef.current;
      const setOK = () => {
        if (!destroyed) {
          setReady(true);
          onReady?.(true);
          video.play().catch(() => {});
        }
      };

      try {
        const { default: Hls } = await import("hls.js");

        if (Hls.isSupported()) {
          hls = new Hls({
            lowLatencyMode: true,
            liveSyncDurationCount: 3,
            capLevelToPlayerSize: true,
            enableWorker: true,
          });
          hls.attachMedia(video);
          hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(hlsUrl));
          hls.on(Hls.Events.MANIFEST_PARSED, setOK);
          hls.on(Hls.Events.LEVEL_LOADED, setOK);
          hls.on(Hls.Events.ERROR, (_e, data) => {
            if (data?.fatal && video.canPlayType("application/vnd.apple.mpegurl")) {
              hls?.destroy();
              video.src = hlsUrl;
              video.addEventListener("loadedmetadata", setOK, { once: true });
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = hlsUrl;
          video.addEventListener("loadedmetadata", setOK, { once: true });
        } else {
          console.warn("No HLS support detected.");
        }
      } catch (err) {
        const video = videoRef.current;
        if (video?.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = hlsUrl;
          video.addEventListener("loadedmetadata", setOK, { once: true });
        } else {
          console.error("HLS init failed:", err);
        }
      }
    })();

    return () => {
      destroyed = true;
      try { hls?.destroy(); } catch {}
    };
  }, [hlsUrl, onReady]);

  return (
    <div style={{ position: "relative" }}>
      <video
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        poster="/offline-poster.png"
        muted={muted}
        style={{ width: "100%", aspectRatio: "16/9", background: "#000" }}
      />
      {!ready && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center",
          color: "#aab4ff", background: "linear-gradient(180deg,#0b1338cc,#0b133800)" }}>
          Connecting to live…
        </div>
      )}
    </div>
  );
}
/** SoundCloud (minimal) */
function SoundCloudWidget({ trackId, autoPlay=false }) {
  // Build official SC embed URL; only the inner `url=` is encoded.
  const scUrl = `https%3A//api.soundcloud.com/tracks/${trackId}`;
  const src = `https://w.soundcloud.com/player/?url=${scUrl}&auto_play=${autoPlay ? "true" : "false"}&visual=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false`;

  return (
    <iframe
      title="SoundCloud"
      src={src}
      allow="autoplay"
      style={{ width: "100%", height: 320, border: 0, borderRadius: 12 }}
    />
  );
}

/* ------------------------- Main page ------------------------- */
export default function Live(props) {
  const meta   = props?.meta || {};
  const handle = props?.handle;
  const angles = props?.angles || [];

  const ANGLES = Array.isArray(angles) && angles.length
    ? angles
    : [
        { name: "Cam A", url: process.env.NEXT_PUBLIC_HLS_A || process.env.NEXT_PUBLIC_LIVEPEER_HLS || "" },
        { name: "Cam B", url: process.env.NEXT_PUBLIC_HLS_B || "" },
      ];

  const pageTitle = meta.title || "BlueTubeTV • Wilmington Live";
  const [idx, setIdx] = useState(0);
  const [split, setSplit] = useState(false);
  const [audioIdx, setAudioIdx] = useState(0);
  const [showChat, setShowChat] = useState(true);
  const [pins, setPins] = useState([]);
  const [ready, setReady] = useState(false);          // wallet-ready for ETH/Mint flows
  const [camAReady, setCamAReady] = useState(false);
  const [camBReady, setCamBReady] = useState(false);
  const canSplit = camAReady && camBReady;

  const activeUrl = ANGLES[idx]?.url || "";

  useEffect(() => {
    if (typeof window !== "undefined") setShowChat(window.innerWidth >= 1200);
  }, []);

  // check wallet connectivity (non-blocking)
  useEffect(() => {
    (async () => {
      try {
        const { signer } = await getProviderAndSigner();
        if (signer) setReady(true);
      } catch {
        setReady(false);
      }
    })();
  }, []);

  // pull pins (optional)
  useEffect(() => {
    if (!API_BASE) return;
    fetch(`${API_BASE}/manifest?campaign=showcase`)
      .then(r => r.json())
      .then(d => setPins(d?.slots || []))
      .catch(() => {});
  }, []);

  /* ------------ Payments: Stripe / Crypto / ETH --------------- */
  const startStripe = useCallback(
    async (amountCents, kind = "tip") => {
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
    },
    [handle]
  );

  const handleCryptoTip = useCallback(
    async (amount = 10) => {
      const pending = typeof window !== "undefined" ? window.open("", "_blank", "noopener") : null;
      try {
        const r = await fetch("/api/coinbase/create-charge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            currency: "USD",
            name: `BlueTubeTV Tip $${amount}`,
            description: "Thanks for supporting the stream!",
            metadata: { handle, source: "live" },
            redirect_url: typeof window !== "undefined" ? window.location.href : undefined,
            cancel_url: typeof window !== "undefined" ? window.location.href : undefined,
          }),
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok || !data?.hosted_url) {
          if (pending) pending.close();
          return alert(
            (typeof data?.error === "string" ? data.error : "Crypto checkout failed") +
              (r.status ? ` (HTTP ${r.status})` : "")
          );
        }
        if (pending) pending.location = data.hosted_url;
        else window.open(data.hosted_url, "_blank", "noopener");
      } catch (e) {
        if (pending) pending.close();
        console.error(e);
        alert("Crypto checkout failed (network).");
      }
    },
    [handle]
  );

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
          params: [
            {
              chainId: HH,
              chainName: "Localhost 8545 (Hardhat)",
              rpcUrls: ["http://127.0.0.1:8545"],
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            },
          ],
        });
        await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: HH }] });
      } else {
        throw e;
      }
    }
  }, []);

  const handleEthTip = useCallback(
    async (ethAmount = "0.002") => {
      await ensureLocalChain();
      try {
        const { signer, account } = await getProviderAndSigner();
        const value = parseEther(ethAmount);
        if (TIPJAR_ADDR) {
          const jar = new Contract(TIPJAR_ADDR, TIPJAR_ABI, signer);
          let tx;
          try {
            tx = await jar["tip()"]({ value });
          } catch {
            try {
              tx = await jar["tipTo(address)"](PAYOUT_ADDR || account, { value });
            } catch {
              try {
                tx = await jar["tip(address)"](PAYOUT_ADDR || account, { value });
              } catch {
                try {
                  tx = await jar["donate()"]({ value });
                } catch {
                  tx = await signer.sendTransaction({ to: PAYOUT_ADDR || account, value });
                }
              }
            }
          }
          await tx.wait();
          alert(`Tipped ${ethAmount} ETH ✅`);
        } else {
          const tx = await signer.sendTransaction({ to: PAYOUT_ADDR || account, value });
          await tx.wait();
          alert(`Sent ${ethAmount} ETH to payout ✅`);
        }
      } catch (e) {
        console.error("handleEthTip error:", e);
        alert(e?.message || "ETH tip failed");
      }
    },
    [ensureLocalChain]
  );

  const handleMintMoment = useCallback(
    async () => {
      await ensureLocalChain();
      try {
        if (!MOMENT_ADDR) throw new Error("MOMENT contract address missing");
        const { signer, account } = await getProviderAndSigner();
        const nft = new Contract(MOMENT_ADDR, MOMENT_ABI, signer);
        let tx;
        try {
          tx = await nft["mint()"]();
        } catch {
          try {
            tx = await nft["mintTo(address)"](account);
          } catch {
            try {
              tx = await nft["safeMint(address)"](account);
            } catch {
              const now = new Date().toISOString();
              const meta = { name: "BlueTubeTV Moment", description: "Minted live on stream", timestamp: now };
              const dataURI = `data:application/json,${encodeURIComponent(JSON.stringify(meta))}`;
              try {
                tx = await nft["mintMoment(string)"](dataURI);
              } catch {
                tx = await nft["mintWithURI(string)"](dataURI);
              }
            }
          }
        }
        const receipt = await tx.wait();
        alert(`Minted! tx: ${receipt.transactionHash}`);
      } catch (e) {
        console.error("handleMintMoment error:", e);
        alert(e?.message || "Mint failed");
      }
    },
    [ensureLocalChain]
  );

  /* --------------------------- Render -------------------------- */
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <link rel="canonical" href={`${SITE_URL}/live`} />
        <meta property="og:url" content={`${SITE_URL}/live`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="BlueTubeTV • Wilmington Live" />
        <meta property="og:description" content="Tap in to the live stream and support the movement." />
        <meta property="og:image" content={`${SITE_URL}/og-yb-live.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="BlueTubeTV" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BlueTubeTV • Wilmington Live" />
        <meta name="twitter:description" content="Tap in to the live stream and support the movement." />
        <meta name="twitter:image" content={`${SITE_URL}/og-yb-live.png`} />
      </Head>

      <BrandTheme>
        <div className="page">
          {/* Header */}
          <header className="topbar">
            <span className="pill live">LIVE • Wilmington</span>
            <BrandLockup size="md" inline />
            <a href="/yb-raleigh" className="angle" title="NBA YoungBoy — Raleigh • Oct 24">
              YB Raleigh • Oct 24
            </a>
            <div style={{ flex: 1 }} />
            <button className="angle" onClick={() => handleCryptoTip(10)}>Crypto Tip $10</button>
            <button className="angle" onClick={() => handleEthTip("0.002")} disabled={!ready}>ETH Tip</button>
            <button className="angle" onClick={handleMintMoment} disabled={!ready}>Mint</button>
            <MapButton campaign="showcase" newTab />
            <a href="/sponsor" className="angle">Sponsor</a>
            <ShareButton />
            <CopyLink />
          </header>

          {/* Promo banner */}
          <a href="/yb-raleigh" aria-label="NBA YoungBoy — Raleigh">
            <img
              src="/og-yb-live.png"
              alt="NBA YoungBoy — Raleigh • Oct 24"
              style={{ width: "100%", maxWidth: 720, height: "auto",
                       borderRadius: 12, border: "1px solid #1f2937",
                       display: "block", margin: "8px auto 0" }}
            />
          </a>

{/* Angle controls + Split + Audio source */}
<div className="anglebar">
  {/* Single-view buttons (Cam A / Cam B) */}
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

  {/* Split toggle */}
  <button
    type="button"
    className={`angle ${split ? "angle--active" : ""}`}
    onClick={() => { setSplit(s => !s); setAudioIdx(0); }}
    disabled={!ANGLES[0]?.url || !ANGLES[1]?.url || !canSplit}
    title={canSplit ? "Show both" : "Waiting for both feeds"}
  >
    Split
  </button>

  {/* Inline Audio source buttons (only when Split is on) */}
  {split && (
    <div style={{ display:"inline-flex", gap:8, alignItems:"center", marginLeft:12 }}>
      <span style={{ opacity:.7 }}>Audio from:</span>
      <button
        type="button"
        className={`angle ${audioIdx === 0 ? "angle--active" : ""}`}
        onClick={() => setAudioIdx(0)}
      >
        Cam A
      </button>
      <button
        type="button"
        className={`angle ${audioIdx === 1 ? "angle--active" : ""}`}
        onClick={() => setAudioIdx(1)}
      >
        Cam B
      </button>
      <button
        type="button"
        className={`angle ${audioIdx === 2 ? "angle--active" : ""}`}
        onClick={() => setAudioIdx(2)}
      >
        SoundCloud
      </button>
    </div>
  )}
</div>



            {/* Grid: player + (optional chat) */}
<div className={`grid ${showChat ? "grid--chat" : "grid--nochat"}`}>
  <section className="player-shell brand-ring card" aria-label="Live player">

    {/* Controls for split + audio source */}
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
        <>
          <span style={{ opacity:.7 }}>|</span>
          <span>Audio from:</span>
          <button
            type="button"
            className={`angle ${audioIdx === 0 ? "angle--active" : ""}`}
            onClick={() => setAudioIdx(0)}
          >
            Cam A
          </button>
          <button
            type="button"
            className={`angle ${audioIdx === 1 ? "angle--active" : ""}`}
            onClick={() => setAudioIdx(1)}
          >
            Cam B
          </button>
          <button
            type="button"
            className={`angle ${audioIdx === 2 ? "angle--active" : ""}`}
            onClick={() => setAudioIdx(2)}
          >
            SoundCloud
          </button>
        </>
      )}
    </div>

    {split ? (
      <div className="grid2">
        {/* LEFT PANE: Cam A */}
        <div className="player-shell brand-ring">
          <CamA_Live
            hlsUrl={ANGLES[0]?.url || process.env.NEXT_PUBLIC_HLS_A}
            muted={audioIdx !== 0}
            onReady={() => setCamAReady(true)}
          />
        </div>

        {/* RIGHT PANE: switch between Cam B and SoundCloud */}
        <div className="player-shell brand-ring" style={{ padding: 8 }}>
          {/* If you want a toggle UI to pick Cam B vs SoundCloud, keep both buttons.
              If you always want SoundCloud in right pane, remove the buttons and leave <SoundCloudWidget/> alone. */}
          <div style={{ display:"flex", gap:8, margin:"0 0 8px" }}>
            <button className="angle" onClick={() => setIdx(1)}>Show Cam B</button>
            <button className="angle" onClick={() => setIdx(2)}>Show SoundCloud</button>
          </div>

          {idx === 1 ? (
            <CamB_Live
              hlsUrl={ANGLES[1]?.url || process.env.NEXT_PUBLIC_HLS_B}
              muted={audioIdx !== 1}
              onReady={setCamBReady}
            />
          ) : (
            <>
              {/* SoundCloud: make this your soundtrack */}
              <SoundCloudWidget trackId={SC_TRACK_ID} autoPlay={audioIdx === 2} />
              {/* If SC is the audio source, ensure cams are muted */}
              {audioIdx === 2 && (
                <div style={{ fontSize:12, opacity:.7, marginTop:6 }}>
                  SoundCloud owns audio • Cam A/B auto-muted
                </div>
              )}
            </>
          )}
        </div>
      </div>
    ) : (
      // Single view: whichever angle is selected (0 = Cam A, 1 = Cam B)
      (idx === 0) ? (
        <CamA_Live
          hlsUrl={ANGLES[0]?.url || process.env.NEXT_PUBLIC_HLS_A}
          muted={false}
          onReady={() => setCamAReady(true)}
        />
      ) : (
        <CamB_Live
          hlsUrl={ANGLES[1]?.url || process.env.NEXT_PUBLIC_HLS_B}
          muted={false}
          onReady={setCamBReady}
        />
      )
    )}
  </section>

  {showChat ? <ChatPanel /> : null}
</div>

        {/* Map FAB + ticker + tip rail */}
        <SponsorTicker />

        <div id="tipbar">
          {[5, 10, 25, 50].map((amt) => (
            <button key={`card-${amt}`} className="tipbtn" onClick={() => startStripe(amt * 100, "tip")}>
              Card Tip ${amt}
            </button>
          ))}
          {[5, 10, 25, 50].map((amt) => (
            <button key={`c-${amt}`} className="tipbtn" onClick={() => handleCryptoTip(amt)}>
              Crypto Tip ${amt}
            </button>
          ))}
          <button className="tipbtn" onClick={() => handleEthTip("0.002")} disabled={!ready}>ETH Tip</button>
          <button className="tipbtn" onClick={handleMintMoment} disabled={!ready}>Mint this moment</button>
          <button className="tipbtn" onClick={() => startStripe(10000, "sponsor")}>Sponsor</button>
        </div>
          
        <style jsx>{`
          :root { --bg-1:#07132e; --bg-2:#0e224d; --ink:#dbe7ff; --accent:#6fe3ff; --accent-2:#4f9cff; --pill:#e6f2ff; --pill-text:#082b5c; --ring-outer:rgba(111,227,255,.65); --ring-inner:rgba(111,227,255,.14); --ring-shadow:rgba(79,156,255,.22) }
          .page { max-width:1280px; margin:0 auto; padding:20px 18px 176px; color:var(--ink); background:radial-gradient(1200px 700px at 14% 12%, rgba(79,156,255,.16), transparent 55%), radial-gradient(1000px 600px at 86% 90%, rgba(111,227,255,.1), transparent 55%), linear-gradient(180deg, var(--bg-1), var(--bg-2)); border-radius:18px; box-shadow:0 20px 60px rgba(0,0,0,.35) inset }
          .topbar { position:sticky; top:0; display:flex; align-items:center; gap:12px; padding:12px 0; background:linear-gradient(180deg, rgba(12,28,66,.35), rgba(12,28,66,.05)); backdrop-filter:blur(6px); border-bottom:1px solid rgba(42,79,168,.35); z-index:5 }
          .pill.live { padding:4px 10px; border-radius:999px; font-weight:800; background:#c8ffe6; color:#064e3b; border:1px solid rgba(16,185,129,.35) }
          .anglebar { display:flex; gap:8px; margin:12px 0 8px; align-items:center; flex-wrap:wrap }
          .angle { padding:8px 12px; border-radius:999px; border:1px solid rgba(79,156,255,.45); background:var(--pill); color:var(--pill-text); font-weight:800; cursor:pointer; transition:transform .12s ease, box-shadow .12s ease }
          .angle:hover { transform:translateY(-1px); box-shadow:0 6px 18px rgba(0,0,0,.25) }
          .angle:disabled { opacity:.5; cursor:not-allowed }
          .angle--active { background:var(--accent); color:#052342 }
          .player-shell { border-radius:20px; overflow:hidden; background:#0b1d41; box-shadow:0 10px 28px rgba(0,0,0,.3); margin-top:8px }
          .brand-ring { box-shadow:0 0 0 2px var(--ring-outer), inset 0 0 44px var(--ring-inner), 0 0 60px var(--ring-shadow) }
          .grid { display:grid; gap:16px }
          @media (min-width:1200px) { .grid.grid--chat { grid-template-columns:2fr .95fr } .grid.grid--nochat { grid-template-columns:1fr } }
          @media (max-width:1199px) { .grid { grid-template-columns:1fr } }
          .card { background:#0b1338; border-radius:14px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,.35) }
          .grid2 { display:grid; gap:12px; grid-template-columns:1fr 1fr }
          @media (max-width:900px) { .grid2 { grid-template-columns:1fr } }
            .lm-wrap {
    position: fixed;
    left: 12px;
    bottom: 148px;                   /* clears your tip bar so it never overlaps */
    width: min(560px, 92vw);
    height: 320px;
    z-index: 60;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgba(111,227,255,.25);
    box-shadow: 0 12px 40px rgba(0,0,0,.35);
    background:
      radial-gradient(800px 400px at 20% 80%, rgba(111,227,255,.08), transparent 60%),
      rgba(7,19,46,.85);
    backdrop-filter: blur(8px);
    transition: height .18s ease;
  }
  .lm-wrap.lm-collapsed {
    height: 0;
    pointer-events: none;            /* doesn’t block clicks */
    border: 0;
    box-shadow: none;
  }
  .lm-map { width: 100%; height: 100%; }
          #tipbar { position:fixed; left:0; right:0; bottom:112px; padding:10px 14px; display:flex; justify-content:center; gap:12px; z-index:60; pointer-events:none }
          #tipbar .tipbtn { pointer-events:auto; padding:10px 16px; border:0; border-radius:12px; font-weight:700; letter-spacing:.2px; cursor:pointer; background:linear-gradient(135deg,#1d4ed8,#2563eb); color:#fff; box-shadow:0 8px 24px rgba(37,99,235,.35); transition:transform .15s ease, box-shadow .15s ease, opacity .2s ease }
          #tipbar .tipbtn:hover { transform:translateY(-1px); box-shadow:0 10px 28px rgba(37,99,235,.45) }
          #tipbar .tipbtn:active { transform:translateY(0); opacity:.9 }
          @media (max-width:480px) { #tipbar { bottom:96px; gap:10px } }
        `}</style>
        </div>
      </BrandTheme>
    </>
  );
}

/* ---------------------- Optional player ---------------------- */
function PlayerSection({ hlsUrl, label, active = true, muted: mutedProp = false }) {
  const videoRef = useRef(null);
  const [online, setOnline] = useState(false);
  const [isMuted, setIsMuted] = useState(mutedProp);

  useEffect(() => {
    if (!active || !hlsUrl) return;
    let hls;
    let destroyed = false;
    const video = videoRef.current;
    if (!video) return;

    (async () => {
      const { default: Hls } = await import("hls.js");
      const markOnline = () => { if (!destroyed) { setOnline(true); video.play().catch(() => {}); } };

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
    })();

    return () => { destroyed = true; try { hls?.destroy(); } catch {} setOnline(false); };
  }, [hlsUrl, active]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = !!isMuted;
  }, [isMuted]);

  return (
    <div style={{ position: "relative" }}>
      <span
        style={{
          position: "absolute", left: 12, top: 10, zIndex: 2,
          padding: "4px 8px", borderRadius: 999, fontWeight: 800,
          background: "#e6f6ff", color: "#082b5c",
          border: "1px solid rgba(79,156,255,.45)"
        }}
      >
        {label}
      </span>

      {online ? (
        <div style={{ position: "relative" }}>
          <video
            ref={videoRef}
            controls
            playsInline
            preload="metadata"
            poster="/offline-poster.png"
            muted={isMuted}
            style={{ width: "100%", aspectRatio: "16/9", background: "#000" }}
          />
          <button
            onClick={() => setIsMuted(m => !m)}
            style={btnStyle}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? "🔇 Unmute" : "🔊 Mute"}
          </button>
        </div>
      ) : (
        <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden" }}>
          <iframe
            src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/123456789&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
            title="Promo"
            allow="autoplay; encrypted-media"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
          />
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  position: "absolute",
  bottom: 12,
  right: 12,
  padding: "6px 10px",
  borderRadius: 8,
  border: "none",
  background: "rgba(0,0,0,.6)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};
