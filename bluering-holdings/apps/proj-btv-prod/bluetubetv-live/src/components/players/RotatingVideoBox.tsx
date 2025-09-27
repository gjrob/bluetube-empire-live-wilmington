"use client";

import React, { useEffect, useRef } from "react";
import Hls from "hls.js";
import OverlayLayer from "../overlays/OverlayLayer";
import type { OverlayItem } from "../../lib/overlays/types";
import { useOverlayRotation } from "../../lib/overlays/useRotation";
import { useImpressions } from "../../lib/analytics/useImpressions";
import type { SlotItem } from "../../lib/schemas/slots";

type Stream = { id: string; url: string; label?: string; overlays?: OverlayItem[] };

export default function RotatingVideoBox({
  stream,
  globalOverlays,
  layout,
  className,
}: {
  stream: Stream;
  globalOverlays?: OverlayItem[];
  layout: "solo" | "split-2" | "grid-3";
  className?: string;
}) {
  // hooks live here (stable per tile)
  const activeBySlot = useOverlayRotation({
    streamId: stream.id,
    streamOverlays: stream.overlays,
    globalOverlays,
    layout,
  });
  useImpressions({ streamId: stream.id, layout, activeBySlot });

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream?.url) return;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream.url;
      video.play().catch(() => {});
      return;
    }
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(stream.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => { video.play().catch(() => {}); });
      return () => hls.destroy();
    }
    video.src = stream.url;
  }, [stream.url]);

  // flatten active overlays
  const items: OverlayItem[] = Object.values(activeBySlot).flat();

  return (
    <div className={`relative rounded-xl overflow-hidden border border-neutral-800 bg-black ${className}`}>
      <video ref={videoRef} controls playsInline className="h-full w-full object-cover bg-black" />
      <div className="absolute left-2 top-2 text-xs px-2 py-1 rounded bg-white/80 text-black z-10">
        {stream.label ?? stream.id}
      </div>
      <OverlayLayer items={items} />
    </div>
  );
}
