// src/app/overlay/active/route.ts
import { NextResponse } from "next/server";
import { getCurrentItemFor } from "@/lib/db/slotsStore"; // uses your channel-aware store

type SlotItem =
  | ({ kind: "url"; url: string } & Record<string, any>)
  | ({ kind: "promo"; promoSrc: string; width?: number } & Record<string, any>)
  | ({ kind: "qr-card"; img?: string; q?: string; qr?: string; w?: string; anchor?: string; x?: string; y?: string; animate?: string; holdMs?: number } & Record<string, any>)
  | ({ kind: "image"; img: string; w?: string; anchor?: string; x?: string; y?: string; animate?: string; holdMs?: number; href?: string } & Record<string, any>);

function toOverlayUrl(item: SlotItem | null, site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000") {
  const base = new URL(site);

  if (!item) {
    base.pathname = "/overlay/image";
    base.search = "img=/overlays/fallback.png&w=320&anchor=bottom-right&x=24px&y=24px&animate=slide-up&holdMs=9999999";
    return base.toString();
  }

  if (item.kind === "url") {
    // absolute → return as-is; relative → join to site
    try { return new URL(item.url).toString(); }
    catch { return new URL(item.url, base).toString(); }
  }

  if (item.kind === "promo") {
    base.pathname = "/overlay/image";
    base.search = new URLSearchParams({
      img: item.promoSrc,
      w: String(item.width ?? 220),
      anchor: "bottom-right", x: "24px", y: "24px",
      animate: "slide-up", holdMs: String(9_999_999),
    }).toString();
    return base.toString();
  }

  if (item.kind === "qr-card") {
    base.pathname = "/overlay/qr-card";
    base.search = new URLSearchParams({
      img: item.img ?? "",
      q: item.q ?? "",
      qr: item.qr ?? "",
      w: item.w ?? "520",
      anchor: item.anchor ?? "bottom-right",
      x: item.x ?? "24px",
      y: item.y ?? "24px",
      animate: item.animate ?? "slide-up",
      holdMs: String(item.holdMs ?? 9_999_999),
    }).toString();
    return base.toString();
  }

  // kind === "image"
  base.pathname = "/overlay/image";
  base.search = new URLSearchParams({
    img: (item as any).img,
    w: (item as any).w ?? "360",
    anchor: (item as any).anchor ?? "bottom-right",
    x: (item as any).x ?? "24px",
    y: (item as any).y ?? "24px",
    animate: (item as any).animate ?? "slide-up",
    holdMs: String((item as any).holdMs ?? 9_999_999),
    href: (item as any).href ?? "",
  }).toString();
  return base.toString();
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const channel = (url.searchParams.get("channel") || "CH1").toUpperCase();

  const item = await getCurrentItemFor(channel);
  const dest = toOverlayUrl(item);

  return NextResponse.redirect(dest);
}
