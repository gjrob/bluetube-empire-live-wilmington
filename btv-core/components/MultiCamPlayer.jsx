import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export default function MultiCamPlayer({ manifestUrl }) {
  const [cfg, setCfg] = useState(null);
  const refs = useRef({});

  useEffect(() => {
    (async () => {
      const res = await fetch(manifestUrl, { cache: "no-store" });
      const data = await res.json(); setCfg(data);
      if (data.brandpack) {
        const bp = await (await fetch(data.brandpack, { cache: "no-store" })).json();
        const r = document.documentElement.style;
        r.setProperty("--btv-primary", bp.colors?.primary || "#0ea5e9");
        r.setProperty("--btv-accent",  bp.colors?.accent || "#ef4444");
        r.setProperty("--btv-bg",      bp.colors?.bg || "#0b1220");
        r.setProperty("--btv-text",    bp.colors?.text || "#e5e7eb");
      }
    })();
  }, [manifestUrl]);

  useEffect(() => {
    if (!cfg) return;
    cfg.streams.forEach(s => {
      const v = refs.current[s.id]; if (!v) return;
      if (v.canPlayType("application/vnd.apple.mpegurl")) v.src = s.hls;
      else if (Hls.isSupported()) { const h = new Hls({ maxBufferLength: 10 }); h.loadSource(s.hls); h.attachMedia(v); v._hls = h; }
      else v.src = s.hls;
      v.muted = !!s.muted; v.play().catch(()=>{});
    });
  }, [cfg]);

  if (!cfg) return <div className="p-6 text-white">Loading…</div>;

  const Layout = () => {
    const m = cfg.layout?.mode || "split-2";
    const vids = id => (
      <video key={id} ref={el => (refs.current[id] = el)}
        className="w-full h-full object-cover rounded-xl" playsInline controls={false}/>
    );
    if (m === "solo") return <div className="w-full aspect-video">{vids(cfg.streams[0].id)}</div>;
    if (m === "grid-3")
      return <div className="grid grid-cols-3 gap-2 p-2">{cfg.streams.slice(0,3).map(s => vids(s.id))}</div>;
    return <div className="grid grid-cols-2 gap-2 p-2">{cfg.streams.slice(0,2).map(s => vids(s.id))}</div>;
  };

  return (
    <div className="relative min-h-screen bg-[var(--btv-bg)] text-[var(--btv-text)]">
      {cfg.overlay?.top && <img src={cfg.overlay.top} alt="" className="absolute top-0 left-0 w-full pointer-events-none" />}
      <Layout/>
      <PinRotator rotatorUrl={cfg.pins?.rotator}/>
    </div>
  );
}

function PinRotator({ rotatorUrl }) {
  const [items, setItems] = useState([]); const [i, setI] = useState(0);
  useEffect(() => { if (!rotatorUrl) return;
    fetch(rotatorUrl, { cache:"no-store" }).then(r=>r.json()).then(j=>setItems(j.schedule||[])); }, [rotatorUrl]);
  useEffect(() => { if (!items.length) return; const t=setInterval(()=>setI(n=>(n+1)%items.length), 90000); return ()=>clearInterval(t); }, [items.length]);
  if (!items.length) return null; const it = items[i];
  return (
    <a href={it.cta?.url || "#"} target="_blank" rel="noreferrer">
      <img src={it.image} alt={it.cta?.label || ""} className="pointer-events-auto absolute bottom-10 right-6 max-w-[40%]" />
    </a>
  );
}
