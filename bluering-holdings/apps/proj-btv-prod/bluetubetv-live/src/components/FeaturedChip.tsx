"use client";

import React, { useEffect, useState } from "react";

export default function FeaturedChip() {
  const [label, setLabel] = useState<string>("none");

  useEffect(() => {
    let t: ReturnType<typeof setInterval> | null = null;
    const load = async () => {
      try {
        const res = await fetch("/api/streams/feature", { cache: "no-store" });
        const data = await res.json();
        const f = data?.featured ?? null;
        if (!f) return setLabel("none");
        setLabel(f.label || trimUrl(f.url));
      } catch {
        setLabel("none");
      }
    };
    load();
    t = setInterval(load, 5000);
    return () => t && clearInterval(t);
  }, []);

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-neutral-800 text-neutral-200 text-xs px-3 py-1">
      <span className="h-2 w-2 rounded-full bg-emerald-400" />
      Featured: {label}
    </span>
  );
}

function trimUrl(u: string) {
  try {
    const url = new URL(u);
    return url.pathname.split("/").slice(-2).join("/"); // e.g., "<id>/index.m3u8"
  } catch {
    return u.slice(0, 24) + (u.length > 24 ? "…" : "");
  }
}
