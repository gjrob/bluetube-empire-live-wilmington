// src/hooks/useHlsPlayer.ts
"use client";

import { useEffect } from "react";
export function useHlsPlayer(videoEl: HTMLVideoElement | null, src: string | undefined) {
  useEffect(() => {
    if (!videoEl || !src) return;

    // If the browser has native HLS (Safari, iOS), use it directly
    if (videoEl.canPlayType("application/vnd.apple.mpegURL")) {
      videoEl.src = src;
      videoEl.load?.();
      return;
    }

    let hls: any | null = null;
    let active = true;

    (async () => {
      try {
        const mod = await import("hls.js"); // dynamic import on client
        const Hls = (mod as any).default ?? mod;

        if (!active) return;

        if (Hls.isSupported()) {
          hls = new Hls({ enableWorker: true });
          hls.loadSource(src);
          hls.attachMedia(videoEl);
        } else {
          // last resort: direct src (some chromium builds support m3u8 via extensions)
          videoEl.src = src;
          videoEl.load?.();
        }
      } catch (e) {
        console.warn("[HLS] failed to init, falling back to direct src", e);
        videoEl.src = src;
        videoEl.load?.();
      }
    })();

    return () => {
      active = false;
      try {
        hls?.destroy?.();
      } catch {}
    };
  }, [videoEl, src]);
}
// src/lib/analytics/impressions/route.ts