import { useEffect, useState } from "react";

export default function TipTicker(){
  const [items, setItems] = useState([]);

  useEffect(() => {
    let t;
    const load = async () => {
      try{
        const r = await fetch("/api/tips/recent");
        const j = await r.json();
        setItems(j.tips || []);
      }catch{}
    };
    load(); t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  if (!items.length) return null;

  return (
    <>
      <div className="ticker">
        {items.map((x,i)=>(
          <span key={i}>💙 {x.kind} • ${(x.amount_cents/100).toFixed(2)}</span>
        ))}
      </div>
      <style jsx>{`
        .ticker{
          position: fixed; left: 16px; bottom: 70px; z-index: 45;
          display: flex; gap: 12px; padding: 8px 12px; border-radius: 12px;
          background: rgba(255,255,255,.86); color:#0b1530;
          border: 1px solid rgba(59,130,246,.35); backdrop-filter: blur(6px);
        }
      `}</style>
    </>
  );
}
