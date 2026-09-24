import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Failed to process request" },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: data.data?.message });
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to server. Please try again." },
      { status: 500 }
    );
  }
}
