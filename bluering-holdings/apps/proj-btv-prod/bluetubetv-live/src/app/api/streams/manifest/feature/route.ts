import { NextResponse } from "next/server";

type Featured = { url: string; label?: string } | null;

// dev-only in-memory state; swap for Redis/DB later
let featured: Featured = null;

export async function GET() {
  return NextResponse.json({ featured });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = String(body?.url ?? "");
    const label = body?.label ? String(body.label) : undefined;
    if (!url) return new NextResponse("Missing url", { status: 400 });
    featured = { url, label };
    return NextResponse.json({ ok: true, featured });
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }
}

export async function DELETE() {
  featured = null;
  return NextResponse.json({ ok: true });
}
