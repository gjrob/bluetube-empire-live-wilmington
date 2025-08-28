import { useEffect, useState } from "react";

export default function ViewerCount({ playbackId }) {
  const [n, setN] = useState(null);

  useEffect(() => {
    if (!playbackId) return;
    let t;
    const poll = async () => {
      try {
        const r = await fetch(`/api/livepeer/viewers?playbackId=${playbackId}`);
        const j = await r.json();
        if (typeof j.viewers === "number") setN(j.viewers);
      } catch {}
    };
    poll();
    t = setInterval(poll, 15000);
    return () => clearInterval(t);
  }, [playbackId]);

  if (n === null) return null;
  return <span style={{ marginLeft: 8, color:"#22d3ee" }}>• {n} watching</span>;
}
