import { NextResponse } from "next/server";
// Update the import path to the correct relative location
import { readSchedule } from "../../../../lib/db/slotsStore";


export async function GET() {
  const s = await readSchedule();

  const list = (s.slots?.[s.activeSlot] ?? []) as Array<{ active?: boolean } & Record<string, any>>;

  const idx = Number.isFinite(s.activeIndex) ? s.activeIndex : 0;
  const picked =
    (list[idx]?.active ? list[idx] : undefined) ??
    list.find((x) => x?.active) ??
    null;

  return NextResponse.json(
    { item: picked },
    { headers: { "Cache-Control": "no-store" } }
  );
}
