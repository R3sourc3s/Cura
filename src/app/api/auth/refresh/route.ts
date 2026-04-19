import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:8000";
const secure = process.env.NODE_ENV === "production";

export async function POST(request: NextRequest) {
  const refresh = request.cookies.get("emp_refresh")?.value;
  if (!refresh) {
    return NextResponse.json({ detail: "No refresh token" }, { status: 401 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/api/v1/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
  } catch {
    return NextResponse.json({ detail: "Backend unavailable" }, { status: 502 });
  }

  if (!upstream.ok) {
    const response = NextResponse.json({ detail: "Session expired" }, { status: 401 });
    response.cookies.set("emp_access", "", { maxAge: 0, path: "/" });
    response.cookies.set("emp_refresh", "", { maxAge: 0, path: "/" });
    return response;
  }

  const { access } = await upstream.json();
  const response = NextResponse.json({ ok: true });
  response.cookies.set("emp_access", access, {
    httpOnly: true, secure, sameSite: "lax", maxAge: 60 * 60, path: "/",
  });
  return response;
}
