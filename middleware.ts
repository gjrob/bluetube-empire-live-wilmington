import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  // send all live.bluetubetv.live traffic to bluetubetv.live
  if (url.hostname === "live.bluetubetv.live") {
    url.hostname = "bluetubetv.live";
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}
