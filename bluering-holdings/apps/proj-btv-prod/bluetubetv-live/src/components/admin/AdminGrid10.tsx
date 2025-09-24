"use client";

import React, { useState } from "react";
import VideoTile from "./VideoTile";

const EMPTY = Array.from({ length: 10 }, (_, i) => ({
  title: `Cam ${i + 1}`,
  url: "",
}));

export default function AdminGrid10() {
  const [cams, setCams] = useState(EMPTY);

  const featureToMain = (url: string) => {
    if (!url) return;
    // you can wire this to update your manifest or a "featured" state
    // For now just copy to clipboard so you can paste into your Main
    navigator.clipboard?.writeText(url);
    alert("Copied HLS URL to clipboard for 'Main' feature.");
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Admin Grid (10 Streams)</h2>
        <div className="text-xs text-neutral-400">
          Tip: paste Livepeer playback URLs (…/hls/&lt;id&gt;/index.m3u8)
        </div>
      </div>

      {/* Responsive: 1→2→3→5 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4">
        {cams.map((c, idx) => (
          <VideoTile
            key={idx}
            title={c.title}
            initialUrl={c.url}
            onFeature={featureToMain}
          />
        ))}
      </div>
    </div>
  );
}
