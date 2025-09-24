import { NextResponse } from "next/server";

// TODO: gate with real auth/JWT; for now accept and log/append.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const events = Array.isArray(body?.events) ? body.events : [];
    // In production, insert into your DB / BigQuery
    // Example shape:
    // { streamId, itemId, slot, layout, visibleSec, startedAt, endedAt }
    console.log("[impressions] received", events.length);
    return NextResponse.json({ ok: true, received: events.length });
  } catch (e) {
    return new NextResponse("Bad Request", { status: 400 });
  }
}
// quick summary endpoint
export async function GET() {
  const byItem: Record<string, number> = {};
  for (const e of memoryStore) {
    byItem[e.itemId] = (byItem[e.itemId] ?? 0) + e.visibleSec;
  }
  return NextResponse.json({ total: memoryStore.length, byItem });
}

