import { NextResponse } from "next/server";
import { recordImpression, readSchedule } from "@/lib/db/slotsStore";

export async function POST(req: Request) {
  const { slotItemId } = await req.json();
  const s = await readSchedule();
  await recordImpression({
    ts: new Date().toISOString(),
    gameId: s.gameId,
    slot: s.activeSlot,
    slotItemId,
    viewerHash: undefined,
  });
  return NextResponse.json({ ok: true });
}
