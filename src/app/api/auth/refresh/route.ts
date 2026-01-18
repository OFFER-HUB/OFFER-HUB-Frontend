import { NextRequest, NextResponse } from "next/server";
import {
  buildSecureCookie,
  buildDeleteCookie,
  parseCookies,
  COOKIE_CONFIG,
} from "@/lib/cookies";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const cookieHeader = request.headers.get("cookie");
  const cookies = parseCookies(cookieHeader);
  const refreshToken = cookies[COOKIE_CONFIG.REFRESH_TOKEN];

  if (!refreshToken) {
    return NextResponse.json(
      { error: "No refresh token found" },
      { status: 401 }
    );
  }

  try {
    // TODO: Replace with actual backend API call
    // const backendResponse = await fetch(`${process.env.API_URL}/auth/refresh`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ refreshToken }),
    // });
    //
    // if (!backendResponse.ok) {
    //   throw new Error("Token refresh failed");
    // }
    //
    // const { token, refreshToken: newRefreshToken } = await backendResponse.json();

    // For now, simulate token refresh (remove in production)
    const token = `refreshed-token-${Date.now()}`;
    const newRefreshToken = `new-refresh-token-${Date.now()}`;

    const response = NextResponse.json({ success: true });

    response.headers.append(
      "Set-Cookie",
      buildSecureCookie(COOKIE_CONFIG.AUTH_TOKEN, token)
    );

    response.headers.append(
      "Set-Cookie",
      buildSecureCookie(
        COOKIE_CONFIG.REFRESH_TOKEN,
        newRefreshToken,
        COOKIE_CONFIG.REFRESH_EXPIRY_DAYS
      )
    );

    return response;
  } catch {
    const response = NextResponse.json(
      { error: "Token refresh failed" },
      { status: 401 }
    );

    response.headers.append("Set-Cookie", buildDeleteCookie(COOKIE_CONFIG.AUTH_TOKEN));
    response.headers.append("Set-Cookie", buildDeleteCookie(COOKIE_CONFIG.REFRESH_TOKEN));

    return response;
  }
}
