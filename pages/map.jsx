// pages/map.jsx
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";

const LiveMap = dynamic(() => import("../components/LiveMap"), { ssr: false });

export default function MapPage() {
  const API_BASE = process.env.NEXT_PUBLIC_PINS_API || "";
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiUsed, setApiUsed] = useState("");

  useEffect(() => {
    // runs client-side only
    const search = new URLSearchParams(window.location.search);
    const campaign = search.get("campaign") || "showcase";
    const override = search.get("api");              // optional manual API override
    const base = (override || API_BASE || "").replace(/\/$/, "");

    if (!base) {
      console.error("Pins API base URL is empty. Set NEXT_PUBLIC_PINS_API or pass &api=...");
      setLoading(false);
      return;
    }

    const url = `${base}/manifest?campaign=${encodeURIComponent(campaign)}`;
    setApiUsed(base);
    console.log("[/map] Fetching pins:", url);

    fetch(url, { mode: "cors" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j) => setPins(Array.isArray(j?.slots) ? j.slots : []))
      .catch((err) => {
        console.error("[/map] Pins fetch failed:", err);
        setPins([]);
      })
      .finally(() => setLoading(false));
  }, [API_BASE]);

  return (
    <>
      <Head>
        <title>BlueTubeTV • Map</title>
        <meta name="robots" content="noindex" />
      </Head>

      {/* Top bar */}
      <div
        style={{
          position: "fixed", left: 0, right: 0, top: 0, height: 56, zIndex: 80,
          display: "flex", alignItems: "center", gap: 12, padding: "0 12px",
          background: "linear-gradient(180deg, rgba(11,25,64,.85), rgba(9,18,48,.55))",
          borderBottom: "1px solid rgba(111,227,255,.25)", color: "#dbe7ff", fontWeight: 800,
        }}
      >
        <a href="/live" style={{ textDecoration: "none" }} className="angle">← Back to Live</a>
        <span style={{ opacity: .8 }}>BlueTube • Map</span>
        <div style={{ flex: 1 }} />
        <a href="/map" className="angle" title="Reload map page">Refresh</a>
      </div>

      {/* Fullscreen map (below the top bar) */}
      <div style={{ position: "fixed", inset: "56px 0 0 0" }}>
        <LiveMap
          pins={pins}
          mode="fullscreen"
          collapsed={false}
          fabPos={{ right: 12, top: 76 }}
        />

        {loading && (
          <div style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", color: "#9fbaff" }}>
            Loading pins…
          </div>
        )}

        {!loading && !pins.length && (
          <div
            style={{
              position: "fixed", right: 12, bottom: 12,
              padding: "8px 10px", borderRadius: 12,
              border: "1px solid rgba(111,227,255,.35)",
              background: "rgba(9,18,48,.6)", color: "#dbe7ff",
              fontWeight: 800,
            }}
          >
            No pins returned. API: {apiUsed || "(unset)"}.
          </div>
        )}
      </div>
    </>
  );
}
