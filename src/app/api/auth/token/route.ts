import { NextRequest, NextResponse } from "next/server";
import {
  buildSecureCookie,
  buildDeleteCookie,
  parseCookies,
  COOKIE_CONFIG,
} from "@/lib/cookies";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { token, refreshToken } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });

    response.headers.append(
      "Set-Cookie",
      buildSecureCookie(COOKIE_CONFIG.AUTH_TOKEN, token)
    );

    if (refreshToken) {
      response.headers.append(
        "Set-Cookie",
        buildSecureCookie(
          COOKIE_CONFIG.REFRESH_TOKEN,
          refreshToken,
          COOKIE_CONFIG.REFRESH_EXPIRY_DAYS
        )
      );
    }

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const cookieHeader = request.headers.get("cookie");
  const cookies = parseCookies(cookieHeader);

  const hasToken = Boolean(cookies[COOKIE_CONFIG.AUTH_TOKEN]);
  const hasRefreshToken = Boolean(cookies[COOKIE_CONFIG.REFRESH_TOKEN]);

  return NextResponse.json({
    authenticated: hasToken,
    hasRefreshToken,
  });
}

export async function DELETE(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  response.headers.append("Set-Cookie", buildDeleteCookie(COOKIE_CONFIG.AUTH_TOKEN));
  response.headers.append("Set-Cookie", buildDeleteCookie(COOKIE_CONFIG.REFRESH_TOKEN));
  return response;
}
