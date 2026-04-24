import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // MOCK ADMIN LOGIN: For development, allow admin login with admin@offerhub.com
    if (email === "admin@offerhub.com" && password === "admin123") {
      return NextResponse.json({
        user: {
          id: "admin-1",
          email: "admin@offerhub.com",
          username: "admin",
          type: "ADMIN",
          balance: { available: "0", reserved: "0" },
          wallet: null,
        },
        token: "mock-admin-token",
      });
    }

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
      { error: "Unable to connect to server. Please try again." },
      { status: 500 }
    );
  }
}
