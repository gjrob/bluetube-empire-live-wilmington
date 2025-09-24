import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    streams: [
      {
        id: "main",
        url: "https://livepeercdn.studio/hls/12d7v6cywiquwgp8/index.m3u8",      // 👈 swap this (see #2)
        label: "Main",
        overlays: [
          { id: "logo",  slot: "top-left",     img: "/overlays/logo.png",           href: "https://bluetubetv.live", w: 96,  h: 96 },
          { id: "bug",   slot: "bottom-right", img: "/overlays/patriot-bug.svg",    href: "https://bluetubetv.live", w: 80,  h: 80 },
          // lower-third SVG bar across the bottom
          { id: "lower", slot: "bottom-center", html: "<img src='/overlays/patriot-lower-third.svg' alt='' />", w: 640, h: 120 },
        ],
      },
      {
        id: "sideA",
        url: "https://livepeercdn.studio/hls/12d7v6cywiquwgp8/index.m3u8",
        label: "Cam A",
        overlays: [{ id: "champ", slot: "top-right", img: "/overlays/champion.png", w: 120, h: 120 }],
      },
      {
        id: "sideB",
        url: "https://livepeercdn.studio/hls/635ffqyscg6xdy29/index.m3u8",
        label: "Cam B",
        overlays: [{ id: "castle", slot: "top-left", img: "/overlays/castle.png", w: 110, h: 110 }],
      },
    ],
    globalOverlays: [
      { id: "wm", slot: "top-center", html: "<div class='text-xs opacity-60'>BlueTubeTV</div>" },
    ],
    layouts: ["solo","split-2","grid-3"],
  });
}
