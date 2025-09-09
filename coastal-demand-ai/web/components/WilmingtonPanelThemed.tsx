import { useEffect, useMemo, useState } from "react";
type Pt = { date: string; p10: number; p50: number; p90: number; drivers?: Record<string, number> };
type Resp = { horizon_days: number; geo_id: string; daily: Pt[] };
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const COLORS = { ink:"#0a0e27", dusk:"#111a4b", accent:"#2563eb", border:"rgba(255,255,255,.12)", text:"#fff" };
export default function WilmingtonPanel(){ const [hotel,setHotel]=useState<Resp|null>(null); const [charter,setCharter]=useState<Resp|null>(null);
  useEffect(()=>{ Promise.all([ fetch(`${API}/predict/hotel?geo_id=wrightsville&horizon=7`).then(r=>r.json()),
                                fetch(`${API}/predict/charter?port_id=wilmington&horizon=7`).then(r=>r.json()) ])
                 .then(([h,c])=>{setHotel(h); setCharter(c);}).catch(console.error); },[]);
  return (<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
    <Card title="Hotel Demand • Wrightsville" subtitle="7‑day P10/P50/P90"><Core resp={hotel} unit="rooms" stroke={COLORS.accent}/></Card>
    <Card title="Charter Viability • Wilmington" subtitle="7‑day demand index"><Core resp={charter} unit="index" stroke="#10b981"/></Card>
  </div>); }
function Card({title,subtitle,children}:{title:string;subtitle?:string;children:any}){ return (<div style={{background:`linear-gradient(135deg, ${COLORS.ink}, ${COLORS.dusk})`,border:`1px solid ${COLORS.border}`,borderRadius:16,overflow:"hidden"}}>
  <div style={{display:"flex",justifyContent:"space-between",padding:"12px 12px 8px",borderBottom:`1px solid ${COLORS.border}`}}>
    <div><div style={{fontSize:16,fontWeight:700,color:COLORS.text}}>{title}</div>{subtitle && <div style={{fontSize:12,opacity:.75,marginTop:2}}>{subtitle}</div>}</div>
  </div><div style={{padding:"10px 12px 12px"}}>{children}</div></div>); }
function Core({resp,unit,stroke}:{resp:Resp|null;unit:string;stroke:string}){
  if(!resp) return <div style={{opacity:.85}}>Loading…</div>;
  const p50 = resp.daily.map(d=>d.p50); const d0 = resp.daily[0]; const d1 = resp.daily[1]||d0; const delta=(d0?.p50||0)-(d1?.p50||0);
  return (<div><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
    <div style={{display:"flex",alignItems:"baseline",gap:10}}><div style={{fontSize:28,fontWeight:800}}>{Math.round(d0?.p50||0)}</div><div style={{fontSize:12,opacity:.75}}>{unit} today</div>
      <span style={{padding:"4px 8px",borderRadius:8,border:`1px solid ${COLORS.border}`,background:delta>=0?"rgba(16,185,129,.12)":"rgba(244,63,94,.12)",fontSize:12,color:delta>=0?"#10b981":"#f43f5e"}}>{delta>=0?"▲":"▼"} {Math.round(delta)}</span>
    </div></div>
    <Spark data={p50} stroke={stroke}/>
    <table style={{width:"100%",borderCollapse:"collapse",marginTop:8,fontSize:13,color:COLORS.text}}>
      <thead><tr><th style={th}>Date</th><th style={th}>P10</th><th style={th}>P50</th><th style={th}>P90</th></tr></thead>
      <tbody>{resp.daily.map(d=>(<tr key={d.date}><td style={td}>{d.date}</td><td style={td}>{Math.round(d.p10)}</td><td style={{...td,fontWeight:700,color:COLORS.text}}>{Math.round(d.p50)}</td><td style={td}>{Math.round(d.p90)}</td></tr>))}</tbody>
    </table></div>); }
function Spark({data,height=54,stroke}:{data:number[];height?:number;stroke:string}){
  const W=Math.max(160,(data.length-1)*36), mn=Math.min(...data), mx=Math.max(...data);
  const norm=(v:number)=> mx===mn?height/2: height - ((v-mn)/(mx-mn))*height;
  const pts=data.map((v,i)=>({x:(i/(data.length-1))*W,y:norm(v)}));
  const d=pts.map((p,i)=>`${i?"L":"M"} ${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" "); 
  return (<svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`}><path d={d} stroke={stroke} strokeWidth={2.5} fill="none"/></svg>); }
const th:any={textAlign:"left",opacity:.75,borderBottom:`1px solid ${COLORS.border}`,padding:"6px 4px"};
const td:any={padding:"6px 4px",borderBottom:`1px dashed ${COLORS.border}`};
