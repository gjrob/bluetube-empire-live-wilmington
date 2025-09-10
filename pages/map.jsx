// pages/map.jsx
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";

const LiveMap = dynamic(() => import("../components/LiveMap"), { ssr: false });

export default function MapPage() {
  const API_BASE = process.env.NEXT_PUBLIC_PINS_API;
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!API_BASE) { setLoading(false); return; }
    const u = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const campaign = u.get("campaign") || "showcase";
    fetch(`${API_BASE}/manifest?campaign=${encodeURIComponent(campaign)}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`${r.status}`)))
      .then(d => setPins(d?.slots || []))
      .catch(() => setPins([]))
      .finally(() => setLoading(false));
  }, [API_BASE]);

  return (
    <>
      <Head>
        <title>BlueTubeTV • Map</title>
        <meta name="robots" content="noindex" />
      </Head>

      {/* Top bar */}
      <div style={{
        position:"fixed", left:0, right:0, top:0, height:56, zIndex:80,
        display:"flex", alignItems:"center", gap:12, padding:"0 12px",
        background:"linear-gradient(180deg, rgba(11,25,64,.85), rgba(9,18,48,.55))",
        borderBottom:"1px solid rgba(111,227,255,.25)", color:"#dbe7ff", fontWeight:800
      }}>
        <a href="/live" style={{textDecoration:"none"}} className="angle">← Back to Live</a>
        <span style={{opacity:.8}}>BlueTube • Map</span>
        <div style={{flex:1}} />
        <a href="/map" className="angle">Refresh</a>
      </div>

      {/* Fullscreen map (below the top bar) */}
      <div style={{position:"fixed", inset:"56px 0 0 0"}}>
        <LiveMap
          pins={pins}
          mode="fullscreen"
          collapsed={false}
          fabPos={{ right: 12, top: 76 }}   // tucks under the top bar
        />
        {loading && (
          <div style={{position:"fixed", inset:0, display:"grid", placeItems:"center", color:"#9fbaff"}}>
            Loading pins…
          </div>
        )}
      </div>
    </>
  );
}
