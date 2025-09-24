import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ ok: true, provider: process.env.AUTH_PROVIDER ?? "none" });
}
