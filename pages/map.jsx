import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// ⬇️ this prevents server-side rendering of Leaflet code
const LiveMapClient = dynamic(() => import("../components/LiveMap"), { ssr: false });

export default function MapPage({ campaign }) {
  const [pins, setPins] = useState([]);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_PINS_API;
    const u = new URL(`${API}/manifest`);
    u.searchParams.set("campaign", campaign || "showcase");
    u.searchParams.set("t", Date.now());
    fetch(u.toString(), { cache: "no-store" })
      .then(r => r.json())
      .then(j => setPins(Array.isArray(j?.slots) ? j.slots : []))
      .catch(() => setPins([]));
  }, [campaign]);

  return (
    <main style={{ padding: 12 }}>
      <a href="/live">← Back to Live</a>
      <LiveMapClient pts={pins} mode="overlay" />
    </main>
  );
}

export async function getServerSideProps({ query }) {
  return { props: { campaign: query.campaign || "showcase" } };
}
