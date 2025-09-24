"use client";

import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

type Props = {
  title: string;
  initialUrl?: string; // HLS playback URL (e.g., Livepeer .../index.m3u8)
  onFeature?: (url: string) => void;
};

export default function VideoTile({ title, initialUrl = "", onFeature }: Props) {
  const [url, setUrl] = useState(initialUrl);
  const [loadedUrl, setLoadedUrl] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<"idle"|"loading"|"playing"|"error">("idle");

  useEffect(() => {
    if (!loadedUrl) return;
    const video = videoRef.current;
    if (!video) return;

    setStatus("loading");

    // Native HLS?
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = loadedUrl;
      video.play().then(() => setStatus("playing")).catch(() => setStatus("error"));
      return;
    }

    // HLS.js
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(loadedUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        video.play().then(() => setStatus("playing")).catch(() => setStatus("error"));
      });
      hls.on(Hls.Events.ERROR, () => setStatus("error"));
      return () => hls.destroy();
    }

    // Fallback
    video.src = loadedUrl;
    video.play().then(() => setStatus("playing")).catch(() => setStatus("error"));
  }, [loadedUrl]);

  const load = () => {
    if (!url.trim()) return;
    setLoadedUrl(url.trim());
  };
  const kill = () => {
    const v = videoRef.current;
    if (v) { try { v.pause(); } catch {} v.removeAttribute("src"); v.load(); }
    setLoadedUrl("");
    setStatus("idle");
  };
  const feature = async () => {
  const chosen = loadedUrl || url || "";
  if (!chosen) return;
  try {
    await fetch("/api/streams/feature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: chosen, label: title }),
    });
    // optional toast:
    alert(`Featured set to: ${title}`);
  } catch {
    alert("Failed to feature stream");
  }
};
  const open = () => { const u = loadedUrl || url; if (u) window.open(u, "_blank"); };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3 flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="text-sm text-neutral-300 font-medium truncate">{title}</div>
        <span className={`text-[11px] px-2 py-0.5 rounded-full
          ${status === "playing" ? "bg-green-500/20 text-green-300" :
            status === "loading" ? "bg-yellow-500/20 text-yellow-200" :
            status === "error" ? "bg-red-500/20 text-red-300" :
            "bg-neutral-800 text-neutral-400"}`}>
          {status}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="paste HLS playback URL (…/index.m3u8)"
          className="flex-1 rounded-lg bg-neutral-900 text-neutral-200 text-xs px-3 py-2 outline-none border border-neutral-800"
        />
        <button onClick={load}   className="btn-sm">Load</button>
        <button onClick={kill}   className="btn-sm-subtle">Kill</button>
        <button onClick={feature} className="btn-sm">Feature</button>
        <button onClick={open}   className="btn-sm-subtle">Open</button>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-black aspect-video">
        {loadedUrl ? (
          <video ref={videoRef} controls playsInline className="w-full h-full object-cover bg-black" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-neutral-500 text-sm">
            no source loaded
          </div>
        )}
      </div>
    </div>
  );
}

/* Tailwind helpers via className (no plugin required)
   Add these utilities once in your global CSS if you want prettier buttons globally.
   Or leave inline as-is. */
