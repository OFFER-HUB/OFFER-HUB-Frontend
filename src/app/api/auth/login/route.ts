import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/config/api";

export async function POST(request: NextRequest) {
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
      return NextResponse.json(
        { error: data.message || "Invalid email or password" },
        { status: response.status }
      );
    }

    // Return user data from Orchestrator
    const { user, token, refreshToken } = data.data;

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username ?? user.email.split("@")[0],
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        type: user.type,
        balance: user.balance,
        wallet: user.wallet,
      },
      token,
      // Forward the backend refresh token if present so the client can use it
      // for the next 401 -> refresh -> retry cycle (see src/services/http-client.ts).
      refreshToken: refreshToken ?? null,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Unable to connect to server. Please try again." },
      { status: 500 }
    );
  }
}
