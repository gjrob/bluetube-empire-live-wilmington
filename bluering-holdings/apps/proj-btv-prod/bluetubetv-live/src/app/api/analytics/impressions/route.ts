import { NextResponse } from "next/server";
import { BigQuery } from "@google-cloud/bigquery";

const bq = new BigQuery({
  // no config needed if running on Cloud Run with runtime-sa
});

const DATASET = "analytics";
const TABLE = "impressions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const events = Array.isArray(body?.events) ? body.events : [];

    if (!events.length) {
      return NextResponse.json({ ok: true, received: 0 });
    }

    // normalize rows
    const rows = events.map((e: any) => ({
      streamId: e.streamId ?? null,
      itemId: e.itemId ?? null,
      slot: e.slot ?? null,
      layout: e.layout ?? null,
      visibleSec: Number(e.visibleSec ?? 0),
      startedAt: e.startedAt ? new Date(e.startedAt).toISOString() : new Date().toISOString(),
      endedAt: e.endedAt ? new Date(e.endedAt).toISOString() : new Date().toISOString(),
      viewerId: e.viewerId ?? null,
    }));

    await bq.dataset(DATASET).table(TABLE).insert(rows, {
      ignoreUnknownValues: true,
      skipInvalidRows: true,
    });

    return NextResponse.json({ ok: true, received: rows.length });
  } catch (err: any) {
    console.error("BQ insert failed", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
