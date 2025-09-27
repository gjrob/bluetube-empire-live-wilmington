// src/components/players/VideoTile.tsx
"use client";

import { useRef } from "react";
import { useHlsPlayer } from "../../hooks/useHlsPlayer";
import type { SlotItem } from "../../lib/schemas/slots";


type Props = { src: string; autoPlay?: boolean; muted?: boolean; controls?: boolean };

export default function VideoTile({ src, autoPlay = true, muted = true, controls = false }: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useHlsPlayer(ref.current, src);

  return (
    <video
      ref={ref}
      playsInline
      muted={muted}
      autoPlay={autoPlay}
      controls={controls}
      className="w-full h-full object-cover rounded-xl"
    />
  );
}
// src/lib/analytics/impressions/route.ts