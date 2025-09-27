/* eslint-disable react/no-unknown-property */
import { useEffect, useState } from "react";
const qp = (sp,k,d="") => sp.get(k) ?? d;

export default function RockstarOverlay() {
  const [mounted,setMounted] = useState(false);
  const [q,setQ] = useState({ img:"", w:"420", anchor:"bottom-right", x:"24px", y:"24px", br:"16", opacity:"1", z:2147483000 });

  useEffect(() => {
    setMounted(true);
    const sp = new URLSearchParams(window.location.search);
    setQ(prev => ({
      ...prev,
      img: qp(sp,"img",""),
      w: qp(sp,"w",prev.w), anchor: qp(sp,"anchor",prev.anchor),
      x: qp(sp,"x",prev.x), y: qp(sp,"y",prev.y),
      br: qp(sp,"br",prev.br), opacity: qp(sp,"opacity",prev.opacity),
      z: parseInt(qp(sp,"z", String(prev.z)),10)
    }));
  }, []);

  if (!mounted) return null;

  const width = /^\d+$/.test(q.w) ? `${q.w}px` : q.w;
  const place = (() => {
    const p = { position:"fixed" };
    if (q.anchor === "top-left") { p.top = q.y; p.left = q.x; }
    else if (q.anchor === "top-right") { p.top = q.y; p.right = q.x; }
    else if (q.anchor === "bottom-left") { p.bottom = q.y; p.left = q.x; }
    else if (q.anchor === "center") { p.top = "50%"; p.left = "50%"; p.transform = "translate(-50%,-50%)"; }
    else { p.bottom = q.y; p.right = q.x; }
    return p;
  })();

  return (
    <div style={{ background:"transparent" }}>
      <style jsx global>{`
        html,body{background:transparent}
        .curtain{
          position:fixed; inset:0; pointer-events:none;
          background:
            radial-gradient(120% 60% at 50% -10%, rgba(255,215,0,.30), rgba(0,0,0,0) 50%),
            linear-gradient(90deg, rgba(0,0,0,.65), rgba(0,0,0,.1), rgba(0,0,0,.65));
        }
        .drape{
          position:absolute; top:0; left:0; right:0; height:32%;
          background: radial-gradient(120% 100% at 50% 0%, #d4af37, #b8860b 55%, #7a5f00 100%);
          box-shadow: 0 24px 60px rgba(0,0,0,.6) inset;
          animation: open 1000ms ease forwards;
          transform: translateY(-20%);
        }
        @keyframes open { from{transform:translateY(-20%)} to{transform:translateY(0)} }
      `}</style>

      <div className="curtain"><div className="drape" /></div>

      {q.img ? (
        <div style={{ ...place, zIndex:q.z }}>
          <div style={{
            width, padding:"10px", background:"rgba(0,0,0,.35)",
            borderRadius:`${q.br}px`, boxShadow:"0 12px 36px rgba(0,0,0,.45)",
            border:"1px solid rgba(255,255,255,.15)", opacity:Number(q.opacity)
          }}>
            <img src={q.img} alt="" style={{ width:"100%", height:"auto", display:"block", borderRadius:`${Math.max(0, Number(q.br)-6)}px` }} />
          </div>
        </div>
      ) : (
        <div style={{ position:"fixed", top:16, left:16, color:"#fff", background:"rgba(0,0,0,.6)", padding:12, borderRadius:10 }}>
          Add <code>?img=https://…/logo.png</code>
        </div>
      )}
    </div>
  );
}
