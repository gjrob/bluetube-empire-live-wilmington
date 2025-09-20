// components/VodGrid.jsx
import {useEffect,useState} from "react";
export default function VodGrid(){
  const [rows,setRows]=useState([]);
  useEffect(()=>{ fetch("http://127.0.0.1:5001/api/vod").then(r=>r.json()).then(setRows); },[]);
  return <div style={{display:"grid",gap:12,gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))"}}>
    {rows.map(v=>(
      <div key={v.id} style={{background:"#0f151c",padding:12,borderRadius:12}}>
        <b>{v.stream_key}</b> • {v.duration_sec||0}s
        <video controls src={v.public_url} style={{width:"100%",borderRadius:8,marginTop:8}}/>
        <div><a href={v.public_url} download>Download</a></div>
      </div>
    ))}
  </div>;
}
