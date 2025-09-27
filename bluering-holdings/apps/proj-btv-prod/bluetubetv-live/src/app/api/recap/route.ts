import { NextResponse } from "next/server";
import { getMetrics, readSchedule } from "../../../lib/db/slotsStore";

const csv = (cells: (string | number)[]) =>
  cells.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",") + "\n";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const gameId = u.searchParams.get("gameId") ?? undefined;
  const s = await readSchedule();
  const m = await getMetrics(gameId ?? s.gameId);

  let body = csv(["type","when","gameId","slot","itemId","ua/ref"]);
  for (const x of m.impressions) body += csv(["impression", x.when, x.gameId ?? "", x.slot ?? "", x.itemId ?? "", ""]);
  for (const x of m.scans)       body += csv(["scan",       x.when, x.gameId ?? "", x.slot ?? "", x.itemId ?? "", ""]);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="btv-recap-${gameId ?? s.gameId}.csv"`,
    },
  });
}
