import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/config/api";

export async function POST (request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Call API login endpoint
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      // The API answers with { error: { code, message, details } }. Forward it
      // untouched so the page can branch on the code (e.g. LOGIN_VIA_OAUTH_REQUIRED)
      // instead of collapsing every failure into "invalid password".
      return NextResponse.json(
        {
          error: data.error ?? {
            code: "UNAUTHORIZED",
            message: data.message || "Invalid email or password",
          },
        },
        { status: response.status }
      );
    }

    // Return user data from Orchestrator
    const { user, token } = data.data;

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        // `email` is nullable on User, so guard the split rather than throwing.
        username: user.username ?? user.email?.split("@")[0] ?? user.id,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        type: user.type,
        balance: user.balance,
        wallet: user.wallet,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Unable to connect to server. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}
