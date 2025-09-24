// src/app/go/[id]/route.ts
import { NextResponse } from "next/server";
import { readSchedule, recordScan } from "@/lib/db/slotsStore";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const schedule = await readSchedule();
  const { id } = params;

  // find which slot contains this id
  let slot = schedule.activeSlot;
  let sponsorUrl = "https://sponsor.example.com";

  for (const key of Object.keys(schedule.slots) as (keyof typeof schedule.slots)[]) {
    const found = schedule.slots[key].find(x => x.id === id);
    if (found) {
      slot = key as any;
      sponsorUrl = new URL(found.overlayUrl, req.url).toString();
      break;
    }
  }

  // record the scan
  await recordScan({
    ts: new Date().toISOString(),
    gameId: schedule.gameId,
    slot,
    slotItemId: id,
    campaignId: id,
    ua: req.headers.get("user-agent") ?? undefined,
    ref: req.headers.get("referer") ?? undefined,
  });

  // optional: allow ?to= override
  const url = new URL(req.url);
  if (url.searchParams.get("to")) sponsorUrl = url.searchParams.get("to")!;

  return NextResponse.redirect(sponsorUrl, 302);
}
