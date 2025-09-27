import { NextResponse } from "next/server";
import { readSchedule, recordScan } from "@lib/db/slotsStore";        // ✅ alias
import type { SlotItem, SlotKey } from "@lib/schemas/slots";           // ✅ alias

function toOverlayUrl(item: SlotItem | null, site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000") {
  const base = new URL(site);
  if (!item) { base.pathname = "/overlay/image"; base.search = "img=/overlays/fallback.png"; return base.toString(); }
  if (item.kind === "url")    return new URL(item.url, base).toString();
  if (item.kind === "promo")  { base.pathname="/overlay/image"; base.search=new URLSearchParams({ img:item.promoSrc, w:String(item.width ?? 220) }).toString(); return base.toString(); }
  if (item.kind === "qr-card"){ base.pathname="/overlay/qr-card"; base.search=new URLSearchParams({ img:item.img ?? "", q:item.q ?? "", qr:item.qr ?? "", w:item.w ?? "520" }).toString(); return base.toString(); }
  base.pathname="/overlay/image"; base.search=new URLSearchParams({ img:item.img, w:item.w ?? "360" }).toString(); return base.toString();
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const schedule = await readSchedule();
  const { id } = params;

  let slot = schedule.activeSlot as SlotKey;
  let found: SlotItem | null = null;
  for (const key of Object.keys(schedule.slots) as SlotKey[]) {
    const hit = schedule.slots[key].find(x => x.id === id);
    if (hit) { slot = key; found = hit; break; }
  }

  await recordScan({
    id: crypto.randomUUID(),
    when: Date.now(),
    gameId: schedule.gameId,
    slot,
    itemId: id,
    href: req.headers.get("referer") ?? undefined,
  });

  const dest = toOverlayUrl(found);
  return NextResponse.redirect(dest);
}
