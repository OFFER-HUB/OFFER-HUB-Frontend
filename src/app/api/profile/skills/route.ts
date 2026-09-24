import { NextResponse } from "next/server";

export async function GET() {
  // Stub — replace with real DB call when backend is ready
  return NextResponse.json([]);
}

export async function POST() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}