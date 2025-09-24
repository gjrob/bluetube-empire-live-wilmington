// Server component (no "use client")
import type { Metadata } from "next";

export const dynamic = "force-dynamic"; // always render with current query
export const metadata: Metadata = { title: "Rockstar Overlay" };

type Props = { searchParams?: Record<string, string | string[]> };

function qp(v?: string | string[], fallback = "") {
  return Array.isArray(v) ? v[0] ?? fallback : v ?? fallback;
}

export default function RockstarOverlayPage({ searchParams = {} }: Props) {
  const text   = encodeURIComponent(qp(searchParams.text, "ROCK★STAR"));
  const openAt = encodeURIComponent(qp(searchParams.openAt, "800"));   // ms delay before curtain opens
  const speed  = encodeURIComponent(qp(searchParams.speed,  "1800"));  // ms animation duration
  const theme  = encodeURIComponent(qp(searchParams.theme,  "gold"));

  const iframeSrc = `/overlays/rockstar.html?text=${text}&openAt=${openAt}&speed=${speed}&theme=${theme}`;

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center">
      {/* Server-rendered src == client src -> no hydration warning */}
      <iframe
        src={iframeSrc}
        title="Rockstar Overlay"
        className="w-full h-full border-0"
        allow="autoplay"
      />
    </div>
  );
}
