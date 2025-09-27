import { NextResponse } from "next/server";
import { recordImpression, readSchedule } from "@lib/db/slotsStore";  // ✅ alias
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const s = await readSchedule();
  const { itemId } = body;
  await recordImpression({
    id: randomUUID(),
    when: Date.now(),
    gameId: s.gameId,
    slot: s.activeSlot,
    itemId,
  });

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
