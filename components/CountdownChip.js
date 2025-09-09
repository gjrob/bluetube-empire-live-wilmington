import { useEffect, useState } from "react";

export default function Countdown({ targetISO }) {
  const [t, setT] = useState(diff(targetISO));
  useEffect(() => {
    const id = setInterval(() => setT(diff(targetISO)), 1000);
    return () => clearInterval(id);
  }, [targetISO]);

  if (t.total <= 0) return (
    <div style={wrap}>
      <Tile label="LIVE" value="Now" />
    </div>
  );

  return (
    <div style={wrap}>
      <Tile label="Days" value={t.days} />
      <Tile label="Hours" value={t.hours} />
      <Tile label="Minutes" value={t.minutes} />
      <Tile label="Seconds" value={t.seconds} />
    </div>
  );
}

const wrap = { display:"flex", gap:10, alignItems:"center", justifyContent:"center", flexWrap:"wrap" };
function Tile({ label, value }) {
  return (
    <div style={{minWidth:90, textAlign:"center", background:"#0b1220", border:"1px solid #1f2937", borderRadius:12, padding:"12px 14px"}}>
      <div style={{fontSize:28, fontWeight:900}}>{value}</div>
      <div style={{color:"#94a3b8"}}>{label}</div>
    </div>
  );
}
function diff(iso){
  const now = new Date().getTime();
  const end = new Date(iso).getTime();
  const total = Math.max(0, end - now);
  const s = Math.floor(total/1000);
  const days = Math.floor(s/86400);
  const hours = Math.floor((s%86400)/3600);
  const minutes = Math.floor((s%3600)/60);
  const seconds = s%60;
  return { total, days, hours, minutes, seconds };
}
