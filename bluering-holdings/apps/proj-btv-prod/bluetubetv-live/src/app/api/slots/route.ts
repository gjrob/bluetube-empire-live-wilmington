import { NextResponse } from "next/server";
import { readSchedule, writeSchedule } from "@/lib/db/slotsStore";

export async function GET() {
  return NextResponse.json(await readSchedule());
}
export async function PUT(req: Request) {
  const body = await req.json();
  await writeSchedule(body);
  return NextResponse.json({ ok: true });
}
