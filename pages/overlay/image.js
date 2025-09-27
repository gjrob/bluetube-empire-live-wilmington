/* eslint-disable react/no-unknown-property */
import { useEffect, useState } from "react";

const qp = (sp, k, d = "") => sp.get(k) ?? d;

export default function ImageOverlay() {
  const [mounted, setMounted] = useState(false);
  const [q, setQ] = useState({
    img: "", anchor: "bottom-right", w: "320", x: "24px", y: "24px",
    br: "16", bg: "transparent", pad: "8", opacity: "1",
    animate: "slide-up", inMs: 600, outMs: 600, delayMs: 0, holdMs: 9999999,
    loop: false, click: "", border: "", shadow: "0 12px 40px rgba(0,0,0,.35)", z: 2147483000
  });

  useEffect(() => {
    setMounted(true);
    const sp = new URLSearchParams(window.location.search);
    setQ(prev => ({
      ...prev,
      img: qp(sp,"img",""),
      anchor: qp(sp,"anchor", prev.anchor),
      w: qp(sp,"w", prev.w), x: qp(sp,"x", prev.x), y: qp(sp,"y", prev.y),
      br: qp(sp,"br", prev.br), bg: qp(sp,"bg", prev.bg), pad: qp(sp,"pad", prev.pad),
      opacity: qp(sp,"opacity", prev.opacity), animate: qp(sp,"animate", prev.animate),
      inMs: parseInt(qp(sp,"inMs", String(prev.inMs)),10),
      outMs: parseInt(qp(sp,"outMs", String(prev.outMs)),10),
      delayMs: parseInt(qp(sp,"delayMs", String(prev.delayMs)),10),
      holdMs: parseInt(qp(sp,"holdMs", String(prev.holdMs)),10),
      loop: qp(sp,"loop", prev.loop ? "1" : "0") === "1",
      click: qp(sp,"click", prev.click), border: qp(sp,"border", prev.border),
      shadow: qp(sp,"shadow", prev.shadow), z: parseInt(qp(sp,"z", String(prev.z)),10)
    }));
  }, []);

  if (!mounted) return null; // avoid SSR/client mismatch

  const width = /^\d+$/.test(q.w) ? `${q.w}px` : q.w;

  const place = (() => {
    const p = { position: "fixed" };
    if (q.anchor === "top-left") { p.top = q.y; p.left = q.x; }
    else if (q.anchor === "top-right") { p.top = q.y; p.right = q.x; }
    else if (q.anchor === "bottom-left") { p.bottom = q.y; p.left = q.x; }
    else if (q.anchor === "center") { p.top = "50%"; p.left = "50%"; p.transform = "translate(-50%,-50%)"; }
    else { p.bottom = q.y; p.right = q.x; } // bottom-right
    return p;
  })();

  const kfIn = {
    "slide-up":"from{transform:translateY(24px)}to{transform:translateY(0)}",
    "slide-down":"from{transform:translateY(-24px)}to{transform:translateY(0)}",
    "slide-left":"from{transform:translateX(24px)}to{transform:translateX(0)}",
    "slide-right":"from{transform:translateX(-24px)}to{transform:translateX(0)}",
    "fade":"from{opacity:0}to{opacity:1}",
    "none":"from{}to{}"
  }[q.animate];

  const kfOut = {
    "slide-up":"from{transform:translateY(0)}to{transform:translateY(24px);opacity:0}",
    "slide-down":"from{transform:translateY(0)}to{transform:translateY(-24px);opacity:0}",
    "slide-left":"from{transform:translateX(0)}to{transform:translateX(24px);opacity:0}",
    "slide-right":"from{transform:translateX(0)}to{transform:translateX(-24px);opacity:0}",
    "fade":"from{opacity:1}to{opacity:0}",
    "none":"from{}to{}"
  }[q.animate];

  const total = q.delayMs + q.inMs + q.holdMs + q.outMs;
  const anim  = `in ${q.inMs}ms ease ${q.delayMs}ms both, hold ${q.holdMs}ms linear ${q.delayMs+q.inMs}ms both, out ${q.outMs}ms ease ${q.delayMs+q.inMs+q.holdMs}ms both`;
  const loopStyle = q.loop ? { animationIterationCount: "infinite", animationDuration: `${total}ms` } : {};

  return (
    <div style={{ background: "transparent" }}>
      <style jsx global>{`
        @keyframes in{${kfIn}} @keyframes out{${kfOut}}
        @keyframes hold{from{opacity:1}to{opacity:1}}
        html,body{background:transparent}
      `}</style>

      {!q.img ? (
        <div style={{ padding:16, color:"#fff", background:"rgba(0,0,0,.6)", borderRadius:12, position:"fixed", top:16, left:16 }}>
          Add <code>?img=https://…/logo.png</code>
        </div>
      ) : (
        <div style={{ ...place, zIndex:q.z, pointerEvents: q.click ? "auto" : "none" }}>
          <a href={q.click || undefined} target={q.click ? "_blank" : undefined} rel="noopener noreferrer" style={{ textDecoration:"none", display:"inline-block" }}>
            <div style={{
              width, padding:q.pad, background:q.bg, borderRadius:`${q.br}px`,
              boxShadow:q.shadow, border:q.border || undefined, opacity:Number(q.opacity),
              animation: anim, ...loopStyle
            }}>
              <img src={q.img} alt="" style={{ width:"100%", height:"auto", display:"block", borderRadius:`${Math.max(0, Number(q.br)-6)}px` }} />
            </div>
          </a>
        </div>
      )}
    </div>
  );
}
