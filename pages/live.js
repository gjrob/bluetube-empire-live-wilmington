// pages/live.js
import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import BrandTheme from "../components/BrandTheme";
import BrandLockup from "../components/BrandLockup";
import TipBar from "../components/TipBar";
import Offline from "../components/Offline";
import ViewerCount from "../components/ViewerCount";
import TipTicker from "../components/TipTicker";

export default function Live() {
  const HLS_URL = process.env.NEXT_PUBLIC_LIVEPEER_HLS || "";
  const parts = HLS_URL.split("/");
  const playbackId = parts.length >= 5 ? parts[4] : "";
const [shareHref, setShareHref] = useState("");
useEffect(() => {
  if (typeof window !== "undefined") {
    const url = `${window.location.origin}/live`;
    const text = "BlueTubeTV is live from Wilmington — pull up.";
    setShareHref(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
  }
}, []);
  return (
    <>
      <Head>
        <title>BlueTubeTV • Wilmington Live</title>
        <meta name="description" content="Live from Wilmington. Tips keep the cameras rolling." />
        <meta property="og:image" content="/og-live.jpg" />
      </Head>

      <BrandTheme>
     <style jsx>{`
    :global(.btv-theme){
      --bg-1:#2a60b8;       /* brighter navy */
      --bg-2:#6aa2ff;       /* sky blue */
      --surface:#123a85;    /* lighter shell */
      --text:#f7fbff;
      --muted:#eaf2ff;

      --brand-1:#6fe3ff;    /* brighter cyan */
      --brand-2:#4f9cff;    /* electric blue */
      --border:#6aa2ff;
    }
  `}</style>
        <div className="page">
          <div className="bg-orb" />
          <header className="topbar">
            <span className="pill live">LIVE • Wilmington</span>
            <BrandLockup size="md" inline />
            <div className="spacer" />
            <div className="right">
  <span>@BlueTubeTV • tip to support ⚡</span>
  {playbackId ? <ViewerCount playbackId={playbackId} /> : null}
  <a href={shareHref} target="_blank" rel="noreferrer" className="share">Share</a>
</div>
            
          </header>

          <section className="player-shell brand-ring">
            <PlayerSection hlsUrl={HLS_URL} />
          </section>
        </div>

        <TipBar />

        {/* page-scoped styles */}
         <style jsx>{`
    .page { position: relative; max-width: 1100px; margin: 0 auto; padding: 16px 16px 96px; }

    .bg-orb {
      position: absolute; left: -120px; top: -80px; width: 520px; height: 520px;
      background: radial-gradient(240px 240px at 45% 45%,
        rgba(92,220,255,.35), rgba(59,130,246,.18) 42%, transparent 70%);
      filter: blur(14px); opacity: .8; pointer-events: none;
    }

    .topbar {
      position: sticky; top: 0; z-index: 30;
      display: flex; align-items: center; gap: 12px; padding: 12px 0;
      /* lighter glass */
      background: linear-gradient(180deg, rgba(12,28,66,.40), rgba(12,28,66,.08));
      backdrop-filter: blur(6px);
      border-bottom: 1px solid rgba(42,79,168,.35);
    }

    .pill.live {
      padding: 4px 10px; border-radius: 999px; font-weight: 700;
      color: #063; background: #c8ffe6; /* lighter mint chip */
      border: 1px solid rgba(16,185,129,.35);
      color: #064e3b;
    }

    .spacer { flex: 1; }
    .right { color: var(--muted); display: flex; align-items: center; gap: 8px; }

    .player-shell {
      margin-top: 14px; border-radius: 18px; overflow: hidden; background: #0d1f44;
      box-shadow: 0 10px 28px rgba(0,0,0,.30);
    }

    /* brighter cyan ring */
    .brand-ring {
      box-shadow:
        0 0 0 2px rgba(92,220,255,.55),
        inset 0 0 44px rgba(92,220,255,.12),
        0 0 60px rgba(59,130,246,.18);
    }
  `}</style>
      </BrandTheme>
    </>
  );
}

function PlayerSection({ hlsUrl }) {
  const videoRef = useRef(null);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    if (!hlsUrl) return;
    let hls;

    const boot = async () => {
      const video = videoRef.current;
      if (!video) return;

      const { default: Hls } = await import("hls.js");
      if (Hls.isSupported()) {
        hls = new Hls({ lowLatencyMode: true, maxBufferLength: 10, liveBackBufferLength: 30 });
        hls.on(Hls.Events.ERROR, (_, data) => { if (data?.fatal) setOnline(false); });
        hls.attachMedia(video);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(hlsUrl));
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setOnline(true);
          video.play().catch(() => {});
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl;
        video.addEventListener("loadedmetadata", () => {
          setOnline(true);
          video.play().catch(() => {});
        }, { once: true });
      }
    };

    boot();
    return () => { try { if (hls) hls.destroy(); } catch {} };
  }, [hlsUrl]);

  return (
    <div style={{ position: "relative" }}>
      <video
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        poster="/offline-poster.png"
        style={{ width: "100%", aspectRatio: "16/9", background: "#000" }}
      />
        {!online && <Offline variant="badge" />}
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
          <Offline />
        </div>
    </div>
  );
}
