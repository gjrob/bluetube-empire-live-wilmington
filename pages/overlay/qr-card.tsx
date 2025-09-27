// pages/overlay/qr-card.tsx
/* eslint-disable react/no-unknown-property */
import { useEffect, useState } from "react";
import QRCard, { type QRCardProps } from "../../components/QRCard";

type Pos = {
  anchor: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  x: string;
  y: string;
  z: number;
  animate: "slide-up" | "slide-down" | "slide-left" | "slide-right" | "fade" | "none";
  inMs: number; outMs: number; delayMs: number; holdMs: number;
  loop: boolean; opacity: string;
};

const qp = (sp: URLSearchParams, k: string, d = "") => sp.get(k) ?? d;
const num = (v: string, d: number) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};

export default function QrCardOverlay() {
  const [mounted, setMounted] = useState(false);

  const [p, setP] = useState<QRCardProps>({
    img: "", q: "", qr: "", cta: "", label: "", href: "",
    layout: "side", w: 520,
    bg: "rgba(0,0,0,.40)", fg: "#fff", br: 18, pad: "12px",
    border: "1px solid rgba(255,255,255,.18)", shadow: "0 18px 50px rgba(0,0,0,.45)",
    qrSize: 220, qrMargin: 8,
  });

  const [pos, setPos] = useState<Pos>({
    anchor: "bottom-right", x: "24px", y: "24px", z: 2147483000,
    animate: "slide-up", inMs: 600, outMs: 600, delayMs: 0, holdMs: 9_999_999,
    loop: false, opacity: "1",
  });

  useEffect(() => {
    setMounted(true);
    const sp = new URLSearchParams(window.location.search);

    setP(prev => ({
      ...prev,
      img: qp(sp, "img", prev.img),
      q: qp(sp, "q", prev.q),
      qr: qp(sp, "qr", prev.qr),
      cta: qp(sp, "cta", prev.cta),
      label: qp(sp, "label", prev.label),
      href: qp(sp, "href", prev.href),
      layout: (qp(sp, "layout", prev.layout || "side") as QRCardProps["layout"]),
      w: qp(sp, "w", String(prev.w ?? 520)),
      bg: qp(sp, "bg", prev.bg),
      fg: qp(sp, "fg", prev.fg),
      pad: qp(sp, "pad", prev.pad),
      border: qp(sp, "border", prev.border),
      shadow: qp(sp, "shadow", prev.shadow),
      br: num(qp(sp, "br", String(prev.br ?? 18)), 18),
      qrSize: num(qp(sp, "qrSize", String(prev.qrSize ?? 220)), 220),
      qrMargin: num(qp(sp, "qrMargin", String(prev.qrMargin ?? 8)), 8),
    }));

    setPos(prev => ({
      ...prev,
      anchor: (qp(sp, "anchor", prev.anchor) as Pos["anchor"]),
      x: qp(sp, "x", prev.x),
      y: qp(sp, "y", prev.y),
      z: num(qp(sp, "z", String(prev.z)), prev.z),
      animate: (qp(sp, "animate", prev.animate) as Pos["animate"]),
      inMs: num(qp(sp, "inMs", String(prev.inMs)), prev.inMs),
      outMs: num(qp(sp, "outMs", String(prev.outMs)), prev.outMs),
      delayMs: num(qp(sp, "delayMs", String(prev.delayMs)), prev.delayMs),
      holdMs: num(qp(sp, "holdMs", String(prev.holdMs)), prev.holdMs),
      loop: qp(sp, "loop", prev.loop ? "1" : "0") === "1",
      opacity: qp(sp, "opacity", prev.opacity),
    }));
  }, []);

  if (!mounted) return null;

  const width = typeof p.w === "number" || /^\d+$/.test(String(p.w)) ? `${p.w}px` : String(p.w);
  const place: React.CSSProperties = (() => {
    const s: React.CSSProperties = { position: "fixed" };
    if (pos.anchor === "top-left") { s.top = pos.y; s.left = pos.x; }
    else if (pos.anchor === "top-right") { s.top = pos.y; s.right = pos.x; }
    else if (pos.anchor === "bottom-left") { s.bottom = pos.y; s.left = pos.x; }
    else if (pos.anchor === "center") { s.top = "50%"; s.left = "50%"; s.transform = "translate(-50%,-50%)"; }
    else { s.bottom = pos.y; s.right = pos.x; }
    return s;
  })();

  const kfIn = {
    "slide-up":"from{transform:translateY(24px)}to{transform:translateY(0)}",
    "slide-down":"from{transform:translateY(-24px)}to{transform:translateY(0)}",
    "slide-left":"from{transform:translateX(24px)}to{transform:translateX(0)}",
    "slide-right":"from{transform:translateX(-24px)}to{transform:translateX(0)}",
    "fade":"from{opacity:0}to{opacity:1}",
    "none":"from{}to{}"
  }[pos.animate];

  const kfOut = {
    "slide-up":"from{transform:translateY(0)}to{transform:translateY(24px);opacity:0}",
    "slide-down":"from{transform:translateY(0)}to{transform:translateY(-24px);opacity:0}",
    "slide-left":"from{transform:translateX(0)}to{transform:translateX(24px);opacity:0}",
    "slide-right":"from{transform:translateX(0)}to{transform:translateX(-24px);opacity:0}",
    "fade":"from{opacity:1}to{opacity:0}",
    "none":"from{}to{}"
  }[pos.animate];

  const total = pos.delayMs + pos.inMs + pos.holdMs + pos.outMs;
  const anim = `in ${pos.inMs}ms ease ${pos.delayMs}ms both, hold ${pos.holdMs}ms linear ${pos.delayMs+pos.inMs}ms both, out ${pos.outMs}ms ease ${pos.delayMs+pos.inMs+pos.holdMs}ms both`;
  const loopStyle: React.CSSProperties = pos.loop ? { animationIterationCount: "infinite", animationDuration: `${total}ms` } : {};

  return (
    <div style={{ background: "transparent" }}>
      <style jsx global>{`
        @keyframes in{${kfIn}} @keyframes out{${kfOut}}
        @keyframes hold{from{opacity:1}to{opacity:1}}
        html,body{background:transparent}
      `}</style>

      {!p.q && !p.qr && !p.img ? (
        <div style={{ position:"fixed", top:16, left:16, color:"#fff", background:"rgba(0,0,0,.6)", padding:12, borderRadius:10 }}>
          Add <code>?q=https://your.link</code> or <code>?qr=/overlays/qr.png</code> (optional <code>&img=/overlays/logo.png</code>)
        </div>
      ) : null}

      <div style={{ ...place, zIndex: pos.z, pointerEvents: p.href ? "auto" : "none", opacity: Number(pos.opacity) }}>
        <div style={{ width, animation: anim, ...loopStyle }}>
          <QRCard {...p} w={width} />
        </div>
      </div>
    </div>
  );
}
