"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { computeActiveBySlot } from "./rotator";
import type { OverlayItem, OverlaySlot, RotationPlan } from "./types";

export function useOverlayRotation(args: {
  streamId: string;
  globalOverlays?: OverlayItem[];
  streamOverlays?: OverlayItem[];
  rotation?: RotationPlan;
  cadenceSec?: number; // default fallback if not in rules
  layout?: string;
}) {
  const { streamId, globalOverlays = [], streamOverlays = [], rotation = defaultPlan(), cadenceSec = 10 } = args;
  const [active, setActive] = useState<Record<OverlaySlot, OverlayItem[]>>(() => emptyActive());
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const pool = useMemo(
    () => [...globalOverlays, ...streamOverlays],
    [globalOverlays, streamOverlays]
  );

  useEffect(() => {
    const tick = () => {
      if (document.hidden) return;                // pause when tab hidden
      if (document.visibilityState !== "visible") return;
      if (typeof window !== "undefined" && (window as any).btv_pauseRotation) return;

      const now = new Date();
      const seedKey = streamId;                   // stable per stream
      const computed = computeActiveBySlot({ all: pool, plan: rotation, now, seedKey });
      setActive(computed);
    };

    tick();
    timer.current = setInterval(tick, (cadenceSec || 10) * 1000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [pool, rotation, cadenceSec, streamId]);

  return active;
}

function emptyActive(): Record<OverlaySlot, OverlayItem[]> {
  return {
    "top-left": [], "top-center": [], "top-right": [],
    "bottom-left": [], "bottom-center": [], "bottom-right": [], "full": []
  };
}

function defaultPlan(): RotationPlan {
  return [
    { slot: "top-left",     cadenceSec: 20, maxConcurrent: 1 },
    { slot: "top-right",    cadenceSec: 20, maxConcurrent: 1 },
    { slot: "bottom-left",  cadenceSec: 20, maxConcurrent: 1 },
    { slot: "bottom-center",cadenceSec: 15, maxConcurrent: 1 },
    { slot: "bottom-right", cadenceSec: 20, maxConcurrent: 1 },
  ];
}
