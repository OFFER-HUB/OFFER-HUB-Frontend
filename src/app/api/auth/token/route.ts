import { NextResponse } from "next/server";
import { buildDeleteCookie, COOKIE_CONFIG } from "@/lib/cookies";

/**
 * Removed as part of issue #209 (`Fix: Connect NextAuth session with
 * backend JWT for authenticated API calls`):
 *
 * - `POST` (write tokens to cookies)
 * - `GET` (read auth status)
 *
 * The auth handshake now stores the backend JWT in `localStorage` (via
 * `useAuthStore`) rather than httpOnly cookies, so there is no cookie-side
 * write path to maintain. Only `DELETE` remains so the logout flow can
 * clear any legacy cookie state issued by older clients.
 */
export async function DELETE(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  response.headers.append("Set-Cookie", buildDeleteCookie(COOKIE_CONFIG.AUTH_TOKEN));
  response.headers.append("Set-Cookie", buildDeleteCookie(COOKIE_CONFIG.REFRESH_TOKEN));
  return response;
}
