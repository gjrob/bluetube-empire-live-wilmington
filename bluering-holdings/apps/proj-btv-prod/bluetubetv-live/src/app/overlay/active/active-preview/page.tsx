// bluetubetv-live/src/app/overlay/active/page.tsx
import { readSchedule } from "@lib/db/slotsStore";

// src/lib/schemas/slots.ts

// quarters
export type SlotKey = "Q1" | "Q2" | "HALF" | "Q3" | "Q4";
export type GameSlot = SlotKey;

// optional sponsor metadata
export type Sponsor = { id: string; name: string; url?: string; logo?: string };

// every creative carries id/active (+ optional metadata)
export type SlotBase = {
  id: string;
  active: boolean;
  label?: string;
  sponsor?: Sponsor;
  weight?: number;
};
// creative union
export type SlotItem =
  | (SlotBase & {
      kind: "image";
      img: string;
      w?: string;
      anchor?: string;
      x?: string;
      y?: string;
      animate?: string;
      holdMs?: number;
      href?: string;
    })
  | (SlotBase & {
      kind: "qr-card";
      img?: string;
      q?: string;      // data to encode
      qr?: string;     // direct QR image URL (overrides q)
      label?: string;
      cta?: string;
      href?: string;
      w?: string;
      anchor?: string;
      x?: string;
      y?: string;
      animate?: string;
      holdMs?: number;
    })
  | (SlotBase & {
      kind: "promo";        // simple image promo
      promoSrc: string;
      width?: number;
    })
  | (SlotBase & {
      kind: "url";          // full overlay URL passthrough
      url: string;          // absolute or relative
    });

// schedule doc
export type SlotSchedule = {
  gameId: string;
  updatedAt: string;
  activeSlot: SlotKey;
  activeIndex: number;
  slots: Record<SlotKey, SlotItem[]>;
};

// analytics (if you use them)
export type ImpressionEvent = {
  id: string;
  when: number;
  gameId?: string;
  slot?: SlotKey;
  itemId?: string;
};
export type ScanEvent = {
  id: string;
  when: number;
  gameId?: string;
  slot?: SlotKey;
  itemId?: string;
  href?: string;
};
export const dynamic = "force-dynamic";

export default async function ActiveOverlayPage() {
  const s = await readSchedule();
  const item: SlotItem | null = (s.slots[s.activeSlot] || []).find((x: SlotItem) => x.active) || null;

  const overlayUrl = toOverlayUrl(item);

  if (!overlayUrl) {
    return <div style={{ color: "white", padding: "1rem" }}>No active overlay</div>;
  }

  return (
    <iframe
      src={overlayUrl}
      title="Active Overlay"
      className="w-screen h-screen border-0 pointer-events-none"
      allow="autoplay"
    />
  );
}
function toOverlayUrl(item: SlotItem | null, site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000") {
  const base = new URL(site);
  if (!item) { base.pathname = "/overlay/image"; base.search = "img=/overlays/fallback.png"; return base.toString(); }

  if (item.kind === "url") {
    // absolute → return as-is; relative → join to site
    try { return new URL(item.url).toString(); }
    catch { return new URL(item.url, base).toString(); }
  }

  if (item.kind === "promo") {
    base.pathname = "/overlay/image";
    base.search = new URLSearchParams({
      img: item.promoSrc, w: String(item.width ?? 220),
      anchor: "bottom-right", x: "24px", y: "24px",
      animate: "slide-up", holdMs: String(9_999_999),
    }).toString();
    return base.toString();
  }

  if (item.kind === "qr-card") {
    base.pathname = "/overlay/qr-card";
    base.search = new URLSearchParams({
      img: item.img ?? "", q: item.q ?? "", qr: item.qr ?? "",
      label: item.label ?? "", cta: item.cta ?? "", href: item.href ?? "",
      w: String(item.w ?? "520"), anchor: item.anchor ?? "bottom-right",
      x: item.x ?? "24px", y: item.y ?? "24px",
      animate: item.animate ?? "slide-up", holdMs: String(item.holdMs ?? 9_999_999),
    }).toString();
    return base.toString();
  }

  // kind === "image"
  base.pathname = "/overlay/image";
  base.search = new URLSearchParams({
    img: item.img, w: String(item.w ?? 360),
    anchor: item.anchor ?? "bottom-right", x: item.x ?? "24px", y: item.y ?? "24px",
    animate: item.animate ?? "slide-up", holdMs: String(item.holdMs ?? 9_999_999),
    href: item.href ?? "",
  }).toString();
  return base.toString();
}
