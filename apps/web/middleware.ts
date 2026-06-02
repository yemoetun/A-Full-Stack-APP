import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware can't read localStorage, so we skip server-side auth guarding.
// Auth is handled client-side in each page/layout.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
