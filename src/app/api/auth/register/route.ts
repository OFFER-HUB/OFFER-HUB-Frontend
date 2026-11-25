import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/config/api";
import { visitorHeaders } from "@/lib/api/proxy-headers";

export async function POST(request: NextRequest) {
  try {
    const { email, password, username, type = "BOTH", captchaToken } = await request.json();

    // Call API register endpoint
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...visitorHeaders(request),
      },
      body: JSON.stringify({ email, password, username, type, captchaToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Forward the backend error structure as-is
      return NextResponse.json(data, { status: response.status });
    }

    // Return created user
    return NextResponse.json({
      user: data.data,
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Unable to connect to server. Please try again." },
      { status: 500 }
    );
  }
}
