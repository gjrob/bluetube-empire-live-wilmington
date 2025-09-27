"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { OverlayItem } from "../../lib/overlays/types";
import RotatingVideoBox from "./RotatingVideoBox";
import VideoTile from "./VideoTile";
import type { SlotItem } from "../../lib/schemas/slots";
import { readSchedule } from "../../lib/db/slotsStore"; 
type Stream = { id: string; url: string; label?: string; overlays?: OverlayItem[] };
type Layout = "solo" | "split-2" | "grid-3" | "tiles";
type Manifest = {
  streams: Stream[];
  layouts?: Layout[];
  globalOverlays?: OverlayItem[];
};

export default function MultiCamPlayer() {
  const [layout, setLayout] = useState<Layout>("solo");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [globalOverlays, setGlobalOverlays] = useState<OverlayItem[]>([]);
  const [featuredUrl, setFeaturedUrl] = useState<string | null>(null);

  // Seed with defaults; manifest will overwrite
  const [streams, setStreams] = useState<Stream[]>([
    { id: "stream1", url: "https://cdn.livepeer.studio/hls/stream1/index.m3u8" },
    { id: "stream2", url: "https://cdn.livepeer.studio/hls/stream2/index.m3u8" },
    { id: "stream3", url: "https://cdn.livepeer.studio/hls/stream3/index.m3u8" },
    { id: "stream4", url: "https://cdn.livepeer.studio/hls/stream4/index.m3u8" },
  ]);

  // Load manifest
  useEffect(() => {
    const manifestUrl =
      process.env.NEXT_PUBLIC_STREAM_MANIFEST || "/api/streams/manifest";
    fetch(manifestUrl)
      .then((r) => r.json())
      .then((data: Manifest) => {
        const s: Stream[] = data?.streams ?? [];
        if (s.length) setStreams(s);
        setLayout((data?.layouts?.[0] as Layout) || "solo");
        setActiveId(s[0]?.id ?? null);
        setGlobalOverlays(data?.globalOverlays ?? []);
      })
      .catch(() => {});
  }, []);

  // Poll featured switch (optional)
  useEffect(() => {
    let t: ReturnType<typeof setInterval> | undefined;
    const load = async () => {
      try {
        const r = await fetch("/api/streams/feature", { cache: "no-store" });
        const d = await r.json();
        setFeaturedUrl(d?.featured?.url ?? null);
      } catch {
        // ignore
      }
    };
    load();
    t = setInterval(load, 5000);
    return () => t && clearInterval(t);
  }, []);

  // Honor featured stream if present
  useEffect(() => {
    if (!streams.length || !featuredUrl) return;
    const m = streams.find((s) => s.url === featuredUrl);
    if (m) setActiveId(m.id);
  }, [streams, featuredUrl]);

  const active = useMemo(
    () => streams.find((s) => s.id === activeId) ?? null,
    [streams, activeId]
  );

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="inline-flex rounded-xl border border-neutral-800 overflow-hidden">
          {(["solo", "split-2", "grid-3", "tiles"] as Layout[]).map((l) => (
            <button
              key={l}
              onClick={() => setLayout(l)}
              className={`px-3 py-1.5 text-sm ${
                layout === l
                  ? "bg-white text-black"
                  : "bg-neutral-900 text-neutral-300"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="inline-flex rounded-xl border border-neutral-800 overflow-hidden">
          {streams.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={`px-3 py-1.5 text-sm ${
                activeId === s.id
                  ? "bg-white text-black"
                  : "bg-neutral-900 text-neutral-300"
              }`}
            >
              {s.label ?? s.id}
            </button>
          ))}
        </div>
      </div>

      {/* Layouts */}
      {layout === "solo" && active && (
        <RotatingVideoBox
          stream={active}
          globalOverlays={globalOverlays}
          layout="solo"
          className="aspect-video w-full"
        />
      )}

      {layout === "split-2" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[streams[0], streams[1] ?? streams[0]].filter(Boolean).map((s, i) => (
            <RotatingVideoBox
              key={s!.id ?? `split-${i}`}
              stream={s!}
              globalOverlays={globalOverlays}
              layout="split-2"
              className="aspect-video w-full"
            />
          ))}
        </div>
      )}

      {layout === "grid-3" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {streams.slice(0, 3).map((s, i) => (
            <RotatingVideoBox
              key={s?.id ?? `g-${i}`}
              stream={s ?? streams[0]}
              globalOverlays={globalOverlays}
              layout="grid-3"
              className="aspect-video w-full"
            />
          ))}
        </div>
      )}

      {/* All tiles = VideoTile everywhere (no overlays) */}
      {layout === "tiles" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {streams.map((s) => (
            <VideoTile key={s.id} src={s.url} />
          ))}
        </div>
      )}
    </div>
  );
}
