import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    streams: [
      {
        id: "cam1",
        label: "Cam 1",
        url: "https://livepeercdn.studio/hls/cb1d4162c6dm98m9/index.m3u8",
      },
      {
        id: "cam2",
        label: "Cam 2",
        url: "https://livepeercdn.studio/hls/718ck0yohadh2xz4/index.m3u8",
      },
      {
        id: "cam3",
        label: "Cam 3",
        url: "https://livepeercdn.studio/hls/7302nxdhlra8cuhs/index.m3u8",
      },
      {
        id: "cam4",
        label: "Cam 4",
        url: "https://livepeercdn.studio/hls/6adcdx4lumm8lc72/index.m3u8",
      },
      {
        id: "cam5",
        label: "Cam 5",
        url: "https://livepeercdn.studio/hls/e6f3vy770ob17qun/index.m3u8",
      },
      {
        id: "cam6",
        label: "Cam 6",
        url: "https://livepeercdn.studio/hls/bdfdhixqcsbkby1q/index.m3u8",
      },
      {
        id: "cam7",
        label: "Cam 7",
        url: "https://livepeercdn.studio/hls/966e9xqzcmrm7hht/index.m3u8",
      },
      {
        id: "cam8",
        label: "Cam 8",
        url: "https://livepeercdn.studio/hls/34c5ys10px56b29z/index.m3u8",
      },
      {
        id: "cam9",
        label: "Cam 9",
        url: "https://livepeercdn.studio/hls/a358yyuxyttvn0es/index.m3u8",
      },
      {
        id: "cam10",
        label: "Cam 10",
        url: "https://livepeercdn.studio/hls/1bc5m2luniubvfke/index.m3u8",
      },
    ],
    globalOverlays: [
      {
        id: "wm",
        slot: "top-center",
        html: "<div class='text-xs opacity-60'>BlueTubeTV</div>",
      },
    ],
    layouts: ["solo", "split-2", "grid-3"],
  });
}
