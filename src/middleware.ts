import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/marketplace", "/faq", "/help"];
const AUTH_ROUTES = ["/login", "/register"];
const PRIVATE_ROUTE_PREFIX = "/app";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user has auth token in cookies (set by Zustand persist)
  const authStorage = request.cookies.get("auth-storage");
  let isAuthenticated = false;

  if (authStorage?.value) {
    try {
      const decoded = decodeURIComponent(authStorage.value);
      const parsed = JSON.parse(decoded);
      // Zustand persist stores state in "state" property
      isAuthenticated = parsed.state?.isAuthenticated === true;
    } catch {
      isAuthenticated = false;
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/app/dashboard", request.url));
  }

  // Protect private routes
  if (pathname.startsWith(PRIVATE_ROUTE_PREFIX) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
  ],
};
