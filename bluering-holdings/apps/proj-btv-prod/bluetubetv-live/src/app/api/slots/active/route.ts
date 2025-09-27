import { NextResponse } from "next/server";
// Update the import path to the correct relative location
import { getCurrentItemFor, readSchedule } from "../../../../lib/db/slotsStore";


export async function GET(req: Request) {
  const s = await readSchedule();

  const list = (s.slots?.[s.activeSlot] ?? []) as Array<{ active?: boolean } & Record<string, any>>;

  const idx = Number.isFinite(s.activeIndex) ? s.activeIndex : 0;
  const picked =
    (list[idx]?.active ? list[idx] : undefined) ??
    list.find((x) => x?.active) ??
    null;
  const u = new URL(req.url);
  const channel = (u.searchParams.get("channel") || "CH1").toUpperCase();
  const item = await getCurrentItemFor(channel);
  return NextResponse.json({ itemId: item?.id, item }, { headers: { "Cache-Control": "no-store" } });
}
