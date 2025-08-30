import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import BrandTheme from "../components/BrandTheme";
import BrandLockup from "../components/BrandLockup";
import Offline from "../components/Offline";
import TipBar from "../components/TipBar";
import ViewerCount from "../components/ViewerCount";

// Accept props; fall back to env so /live continues to work.
export default function Live({ meta, angles }) {
  const ANGLES = angles && Array.isArray(angles) ? angles : [
    { name: "Cam A", url: process.env.NEXT_PUBLIC_HLS_A || process.env.NEXT_PUBLIC_LIVEPEER_HLS || "" },
    { name: "Cam B", url: process.env.NEXT_PUBLIC_HLS_B || "" },
  ];

  const pageTitle = meta?.title || "BlueTubeTV • Wilmington Live";

  const [idx, setIdx] = useState(0);
  const [split, setSplit] = useState(false);
  const [audioIdx, setAudioIdx] = useState(0);

  const activeUrl = ANGLES[idx]?.url || "";
  const playbackId = (activeUrl?.split?.("/")?.[4]) || "";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="Live from Wilmington. Tips keep the cameras rolling." />
      </Head>

      <BrandTheme>
        <div className="page">
          <header className="topbar">
            <span className="pill live">LIVE • Wilmington</span>
            <BrandLockup size="md" inline />
            <div style={{ flex: 1 }} />
            <div className="right">
              <span>@BlueTubeTV • tip to support ⚡</span>
              {playbackId ? <ViewerCount playbackId={playbackId} /> : null}
            </div>
          </header>

          <div className="anglebar">
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
            <button
              type="button"
              className={`angle ${split ? "angle--active" : ""}`}
              onClick={() => { setSplit(s => !s); setAudioIdx(0); }}
              disabled={!ANGLES[0]?.url || !ANGLES[1]?.url}
              title="Show both"
            >
              Split
            </button>
          </div>

          {split ? (
            <div className="grid2">
              <section className="player-shell brand-ring">
                <PlayerSection hlsUrl={ANGLES[0]?.url} label="Cam A" active muted={audioIdx !== 0} />
              </section>
              <section className="player-shell brand-ring">
                <PlayerSection hlsUrl={ANGLES[1]?.url} label="Cam B" active muted={audioIdx !== 1} />
              </section>
            </div>
          ) : (
            <section className="player-shell brand-ring">
              <PlayerSection hlsUrl={activeUrl} label={ANGLES[idx]?.name || "Cam"} active muted={false} />
            </section>
          )}

          {split && (
            <div className="anglebar" style={{ marginTop: 6 }}>
              <span style={{ color: "#dbe7ff" }}>Audio:</span>
              <button type="button" className={`angle ${audioIdx === 0 ? "angle--active" : ""}`} onClick={() => setAudioIdx(0)}>Cam A</button>
              <button type="button" className={`angle ${audioIdx === 1 ? "angle--active" : ""}`} onClick={() => setAudioIdx(1)}>Cam B</button>
            </div>
          )}
        </div>

        {/* Pipe the creator’s Stripe link into TipBar if present */}
        <TipBar tipUrl={meta?.stripeLink} />
        <style jsx>{`
          .page { max-width: 1100px; margin: 0 auto; padding: 16px 16px 96px; }
          .topbar {
            position: sticky; top:0; display:flex; align-items:center; gap:12px; padding:12px 0;
            background: linear-gradient(180deg, rgba(12,28,66,.40), rgba(12,28,66,.08));
            backdrop-filter: blur(6px); border-bottom: 1px solid rgba(42,79,168,.35);
          }
          .pill.live { padding:4px 10px; border-radius:999px; font-weight:700;
            background:#c8ffe6; color:#064e3b; border:1px solid rgba(16,185,129,.35); }
          .right { color:#dbe7ff; display:flex; align-items:center; gap:8px; }
          .anglebar { display:flex; gap:8px; margin:12px 0 8px; align-items:center; }
          .angle { padding:6px 10px; border-radius:999px; border:1px solid rgba(79,156,255,.45);
            background:#e6f2ff; color:#082b5c; font-weight:800; cursor:pointer; }
          .angle:disabled { opacity:.5; cursor:not-allowed; }
          .angle--active { background:#6fe3ff; color:#052342; }
          .player-shell { border-radius:18px; overflow:hidden; background:#0d1f44;
            box-shadow:0 10px 28px rgba(0,0,0,.30); margin-top: 8px; }
          .brand-ring { box-shadow: 0 0 0 2px rgba(111,227,255,.65),
                          inset 0 0 44px rgba(111,227,255,.14),
                          0 0 60px rgba(79,156,255,.22); }
          .grid2 { display:grid; gap:12px; grid-template-columns: 1fr 1fr; }
          @media (max-width: 900px) { .grid2 { grid-template-columns: 1fr; } }
        `}</style>
      </BrandTheme>
    </>
  );
}

function PlayerSection({ hlsUrl, label, active = true, muted = false }) {
  const videoRef = useRef(null);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    if (!active || !hlsUrl) return;
    let hls;
    const boot = async () => {
      const video = videoRef.current; if (!video) return;
      const { default: Hls } = await import("hls.js");
      if (Hls.isSupported()) {
        hls = new Hls({ lowLatencyMode: true, maxBufferLength: 10, liveBackBufferLength: 30 });
        hls.on(Hls.Events.ERROR, (_, d) => { if (d?.fatal) setOnline(false); });
        hls.attachMedia(video);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(hlsUrl));
        hls.on(Hls.Events.MANIFEST_PARSED, () => { setOnline(true); video.play().catch(()=>{}); });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl;
        video.addEventListener("loadedmetadata", () => { setOnline(true); video.play().catch(()=>{}); }, { once:true });
      }
    };
    boot();
    return () => { try { if (hls) hls.destroy(); } catch {} setOnline(false); };
  }, [hlsUrl, active]);

  useEffect(() => { if (videoRef.current) videoRef.current.muted = !!muted; }, [muted]);

  return (
    <div style={{ position: "relative" }}>
      <span style={{
        position: "absolute", left: 12, top: 10, zIndex: 2,
        padding: "4px 8px", borderRadius: 999, fontWeight: 800,
        background: "#e6f6ff", color: "#082b5c", border: "1px solid rgba(79,156,255,.45)"
      }}>
        {label}
      </span>
      <video ref={videoRef} controls playsInline preload="metadata" poster="/offline-poster.png" muted={muted}
             style={{ width: "100%", aspectRatio: "16/9", background: "#000" }} />
      {!online && <Offline variant="badge" />}
    </div>
  );
}
