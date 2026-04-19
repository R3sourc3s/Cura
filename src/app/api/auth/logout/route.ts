import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("emp_access", "", { maxAge: 0, path: "/" });
  response.cookies.set("emp_refresh", "", { maxAge: 0, path: "/" });
  return response;
}
