// components/SoundCloudQueue.js
import { useEffect, useRef, useState } from "react";

export default function SoundCloudQueue({
  tracks = [],                   // e.g., ['https://soundcloud.com/user/track1', ...]
  startIndex = 0,
  autoPlay = true,
  visual = true
}) {
  const iframeRef = useRef(null);
  const widgetRef = useRef(null);
  const [idx, setIdx] = useState(startIndex);
  const safe = (u) =>
    u?.startsWith("https://") ? u : `https://api.soundcloud.com/tracks/${u}`;

  const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(
    safe(tracks[idx] || "")
  )}&auto_play=${autoPlay ? "true" : "false"}&visual=${visual ? "true" : "false"}&show_teaser=false&hide_related=true&show_user=false&show_reposts=false`;

  // Load SoundCloud Widget API once
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.SC && window.SC.Widget) return;
    const s = document.createElement("script");
    s.src = "https://w.soundcloud.com/player/api.js";
    document.body.appendChild(s);
  }, []);

  // Bind widget & auto-next on finish
  useEffect(() => {
    if (!iframeRef.current || !(window.SC && window.SC.Widget)) return;
    const w = window.SC.Widget(iframeRef.current);
    widgetRef.current = w;

    const onReady = () => {
      // when a track ends, advance
      w.bind(window.SC.Widget.Events.FINISH, () => {
        const next = (idx + 1) % tracks.length;
        if (tracks[next]) {
          w.load(safe(tracks[next]), {
            auto_play: true,
            visual,
            show_teaser: false,
            hide_related: true,
            show_user: false,
            show_reposts: false,
          });
          setIdx(next);
        }
      });
    };
    w.bind(window.SC.Widget.Events.READY, onReady);

    return () => {
      try { w.unbind(window.SC.Widget.Events.READY); } catch {}
      try { w.unbind(window.SC.Widget.Events.FINISH); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks.length, visual]);

  // manual controls
  const jump = (nextIdx) => {
    const w = widgetRef.current;
    if (!w || !tracks[nextIdx]) return;
    w.load(safe(tracks[nextIdx]), {
      auto_play: true,
      visual,
      show_teaser: false,
      hide_related: true,
      show_user: false,
      show_reposts: false,
    });
    setIdx(nextIdx);
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <iframe
        ref={iframeRef}
        title="SoundCloud Queue"
        src={src}
        allow="autoplay"
        style={{ width: "100%", height: visual ? 340 : 166, border: 0, borderRadius: 12 }}
      />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="angle" onClick={() => jump((idx - 1 + tracks.length) % tracks.length)}>
          ◀︎ Prev
        </button>
        <button className="angle" onClick={() => jump((idx + 1) % tracks.length)}>
          Next ▶︎
        </button>
        <span style={{ opacity: .8, alignSelf: "center" }}>
          {idx + 1} / {tracks.length}
        </span>
      </div>
    </div>
  );
}
