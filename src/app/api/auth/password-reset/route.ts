import { API_URL } from "@/lib/config";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/api/v1/auth/password-reset/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ detail: "Unable to reach the server. Please try again." }, { status: 502 });
  }

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
