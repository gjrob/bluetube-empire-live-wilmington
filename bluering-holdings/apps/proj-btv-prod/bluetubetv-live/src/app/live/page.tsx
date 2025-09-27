'use client';

import HtmlOverlay from "@/components/HtmlOverlay";

export default function Page() {
  return (
    <div className="relative w-full max-w-6xl mx-auto">
      <video id="btv-player" className="w-full h-auto block relative z-10" controls />
      {/* Hard-mount once to verify layering */}
      <HtmlOverlay src="/overlays/rockstar.html?openAt=400&text=ROCK★STAR" />
    </div>
  );
}
