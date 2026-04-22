import { API_URL } from "@/lib/config";
import { NextResponse } from "next/server";


const secure = process.env.NODE_ENV === "production";

export async function POST(request: Request) {
  const body = await request.json();

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/api/v1/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ detail: "Unable to reach the server. Please try again or contact support." }, { status: 502 });
  }

  if (!upstream.ok) {
    const error = await upstream.json().catch(() => ({ detail: "Login failed" }));
    return NextResponse.json(error, { status: upstream.status });
  }

  const { access, refresh } = await upstream.json();
  const response = NextResponse.json({ ok: true });
  response.cookies.set("emp_access", access, {
    httpOnly: true, secure, sameSite: "lax", maxAge: 60 * 60, path: "/",
  });
  response.cookies.set("emp_refresh", refresh, {
    httpOnly: true, secure, sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/",
  });
  return response;
}
