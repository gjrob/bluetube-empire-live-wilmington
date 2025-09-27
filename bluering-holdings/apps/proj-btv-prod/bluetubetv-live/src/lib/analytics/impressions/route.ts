import { NextResponse } from "next/server";
import { addImpression, type Impression } from "./store";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Case 1: array of events
    if (Array.isArray(body?.events)) {
      const events = body.events as Impression[];
      for (const e of events) {
        if (e.itemId && typeof e.visibleSec === "number") {
          addImpression(e);
        }
      }
      console.log("[impressions] received", events.length);
      return NextResponse.json({ ok: true, received: events.length });
    }

    // Case 2: single impression
    const impression = body as Partial<Impression>;
    if (!impression?.itemId || typeof impression.visibleSec !== "number") {
      return NextResponse.json(
        { error: "itemId and visibleSec required" },
        { status: 400 }
      );
    }
    addImpression(impression as Impression);
    return NextResponse.json({ ok: true, received: 1 });
  } catch (e) {
    console.error("[impressions] error", e);
    return new NextResponse("Bad Request", { status: 400 });
  }
}

