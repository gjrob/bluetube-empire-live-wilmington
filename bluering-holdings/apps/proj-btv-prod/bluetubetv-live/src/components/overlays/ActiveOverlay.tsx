"use client";
import { useEffect, useState } from "react";

export default function ActiveOverlay() {
  const [src, setSrc] = useState<string | null>(null);
  const [slotItemId, setSlotItemId] = useState<string | null>(null);

  async function refresh() {
    const r = await fetch("/api/slots/active", { cache: "no-store" });
    const j = await r.json();
    setSrc(j.overlayUrl);
    setSlotItemId(j.slotItemId);
    if (j.slotItemId) {
      fetch("/api/events/impression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotItemId: j.slotItemId })
      });
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, []);

  if (!src) return null;
  return <iframe src={src} className="pointer-events-none w-full h-full border-0" allow="autoplay" />;
}
