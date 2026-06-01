import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/config/api";
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
    const backendResponse = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      throw new Error(
        backendData.error?.message || backendData.message || "Token refresh failed"
      );
    }

    const data = backendData.data || backendData;
    const token = data.token;
    const newRefreshToken = data.refreshToken || refreshToken;

    if (!token) {
      throw new Error("Backend did not return a refreshed token");
    }

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