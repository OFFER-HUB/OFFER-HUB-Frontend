import { NextRequest, NextResponse } from "next/server";

const ORCHESTRATOR_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Call Orchestrator login endpoint
    const response = await fetch(`${ORCHESTRATOR_URL}/auth/login`, {
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
    const { user, token } = data.data;

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.email.split("@")[0],
        type: user.type,
        balance: user.balance,
        wallet: user.wallet,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Connection error. Is the Orchestrator running?" },
      { status: 500 }
    );
  }
}
