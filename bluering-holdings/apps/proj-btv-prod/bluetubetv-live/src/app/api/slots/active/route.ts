import { NextResponse } from "next/server";
import { readSchedule } from "@/lib/db/slotsStore";

export async function GET() {
  const s = await readSchedule();
  const current = (s.slots[s.activeSlot] || []).find(x => x.active) || null;
  return NextResponse.json({
    gameId: s.gameId,
    slot: s.activeSlot,
    overlayUrl: current?.overlayUrl ?? null,
    slotItemId: current?.id ?? null
  });
}
