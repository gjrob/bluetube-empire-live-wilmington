"use client";

import { useEffect, useRef } from "react";
import type { OverlayItem, OverlaySlot } from "../overlays/types";

type VisibleKey = string;

type Burst = {
  streamId: string;
  itemId: string;
  slot: OverlaySlot;
  layout?: string;
  startedAt: number; // ms
};

type BatchRow = {
  streamId: string;
  itemId: string;
  slot: OverlaySlot;
  layout?: string;
  visibleSec: number;
  startedAt: string;
  endedAt: string;
};

export function useImpressions(args: {
  streamId: string;
  layout?: string;
  activeBySlot: Record<OverlaySlot, OverlayItem[]>;
  flushSec?: number;             // batch every N sec
}) {
  const { streamId, layout, activeBySlot, flushSec = 10 } = args;
  const visibles = useRef<Map<VisibleKey, Burst>>(new Map());
  const batch = useRef<BatchRow[]>([]);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);

  // Track current actives as “visible” bursts
  useEffect(() => {
    const now = Date.now();
    const seen = new Set<string>();

    for (const [slot, items] of Object.entries(activeBySlot) as [OverlaySlot, OverlayItem[]][]) {
      for (const it of items) {
        const key = makeKey(streamId, it.id, slot);
        seen.add(key);
        if (!visibles.current.has(key)) {
          visibles.current.set(key, { streamId, itemId: it.id, slot, layout, startedAt: now });
        }
      }
    }

    // Any previously visible that are no longer visible → close their burst
    for (const [key, burst] of [...visibles.current.entries()]) {
      if (!seen.has(key)) {
        closeBurstToBatch(burst, now, batch.current);
        visibles.current.delete(key);
      }
    }
  }, [streamId, layout, activeBySlot]);

  // Periodically flush batch
  useEffect(() => {
    const flush = async () => {
      // Pause on hidden tabs
      if (document.hidden) return;
      if (!batch.current.length) return;
      const payload = batch.current.splice(0, batch.current.length);
      try {
        await fetch("/api/analytics/impression", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ events: payload }),
          keepalive: true, // survive page close
        });
      } catch {
        // If it fails, requeue (best effort)
        batch.current.unshift(...payload);
      }
    };

    // flush on interval
    ticker.current = setInterval(flush, flushSec * 1000);
    // flush on unload
    const unload = () => {
      if (!batch.current.length) return;
      navigator.sendBeacon?.(
        "/api/analytics/impression",
        new Blob([JSON.stringify({ events: batch.current })], { type: "application/json" })
      );
      batch.current = [];
    };
    window.addEventListener("beforeunload", unload);
    return () => {
      if (ticker.current) clearInterval(ticker.current);
      window.removeEventListener("beforeunload", unload);
    };
  }, [flushSec]);

  return null; // hook only
}

function makeKey(streamId: string, itemId: string, slot: OverlaySlot): string {
  return `${streamId}:${slot}:${itemId}`;
}

function closeBurstToBatch(burst: Burst, nowMs: number, out: BatchRow[]) {
  const durSec = Math.max(0, Math.round((nowMs - burst.startedAt) / 1000));
  if (durSec <= 0) return;
  out.push({
    streamId: burst.streamId,
    itemId: burst.itemId,
    slot: burst.slot,
    layout: burst.layout,
    visibleSec: durSec,
    startedAt: new Date(burst.startedAt).toISOString(),
    endedAt: new Date(nowMs).toISOString(),
  });
}
