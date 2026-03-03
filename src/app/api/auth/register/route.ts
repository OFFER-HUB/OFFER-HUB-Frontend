import { NextRequest, NextResponse } from "next/server";

const ORCHESTRATOR_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export async function POST(request: NextRequest) {
  try {
    const { email, password, type = "BOTH" } = await request.json();

    // Call Orchestrator register endpoint
    const response = await fetch(`${ORCHESTRATOR_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, type }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Registration failed" },
        { status: response.status }
      );
    }

    // Return created user
    return NextResponse.json({
      user: data.data,
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Connection error. Is the Orchestrator running?" },
      { status: 500 }
    );
  }
}
