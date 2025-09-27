import { NextResponse } from "next/server";
import { setActiveSlot } from "../../../../lib/db/slotsStore";
import type { GameSlot } from "../../../../lib/schemas/slots";

export async function POST(req: Request) {
  const { slot } = (await req.json()) as { slot: GameSlot };
  await setActiveSlot(slot);
  return NextResponse.json({ ok: true, slot });
}