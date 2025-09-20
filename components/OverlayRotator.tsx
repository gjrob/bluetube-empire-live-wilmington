import { useEffect, useState } from "react";

type Overlay = { id: string; src: string; slot: "lower-third" | "corner" | "custom"; weight?: number };

export default function OverlayRotator({ intervalMs = 15000 }: { intervalMs?: number }) {
  const [list, setList] = useState<Overlay[]>([]);
  const [i, setI] = useState(0);

  // Load rotation list (and refresh every minute)
  useEffect(() => {
    let on = true;
    const load = async () => {
      try {
        const r = await fetch("/overlays.json?ts=" + Date.now());
        const j: Overlay[] = await r.json();
        if (!on) return;
        const expanded = j.flatMap(o => Array(Math.max(1, o.weight ?? 1)).fill(o));
        setList(expanded);
      } catch (e) {
        console.warn("overlay fetch failed", e);
      }
    };
    load();
    const t = setInterval(load, 60_000);
    return () => { on = false; clearInterval(t); };
  }, []);

  // Rotate the current item
  useEffect(() => {
    if (!list.length) return;
    const t = setInterval(() => setI(x => (x + 1) % list.length), intervalMs);
    return () => clearInterval(t);
  }, [list, intervalMs]);

  // (Optional) debug — safe here because it’s before any return
  useEffect(() => {
    if (list.length) console.log("overlays loaded:", list);
  }, [list]);

  // Compute the current overlay AFTER hooks
  const cur = list.length ? list[i] : null;
  if (!cur) return null;

  return (
    <>
      {cur.slot === "lower-third" && (
        <img src={cur.src} alt="" style={{
          position: "fixed", left: 24, bottom: 24, maxWidth: "38vw", width: 480,
          zIndex: 99999, pointerEvents: "none", opacity: .98, transition: "opacity .6s ease"
        }} />
      )}
      {cur.slot === "corner" && (
        <img src={cur.src} alt="" style={{
          position: "fixed", right: 16, top: 16, width: 220,
          zIndex: 99999, pointerEvents: "none", opacity: .98, transition: "opacity .6s ease"
        }} />
      )}
      {cur.slot === "custom" && (
        <img src={cur.src} alt="" style={{
          position: "fixed", left: 0, right: 0, top: 0, height: 260,
          zIndex: 99999, pointerEvents: "none",
          transform: "translateY(-260px)", animation: "btvDrop .7s ease-out forwards"
        }} />
      )}
      <style jsx global>{`
        @keyframes btvDrop { to { transform: translateY(0); } }
      `}</style>
    </>
  );
}

