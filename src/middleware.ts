import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_CONFIG } from "@/lib/cookies";

const AUTH_ROUTES = ["/login", "/register"];
const PRIVATE_ROUTE_PREFIX = "/app";

export function middleware(request: NextRequest) {
  // DISABLED: Middleware auth check disabled because we moved to localStorage
  // localStorage is not available in middleware (server-side)
  // Pages handle authentication client-side instead
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
  ],
};
