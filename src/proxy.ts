import { API_URL } from "@/lib/config";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("emp_access")?.value;
  const refreshToken = request.cookies.get("emp_refresh")?.value;

  // Redirect authenticated users away from /login
  if (pathname === "/login" && accessToken) {
    const role = await getRole(accessToken);
    return NextResponse.redirect(new URL(role === "family" ? "/family/dashboard" : "/dashboard", request.url));
  }

  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/family");
  if (!isProtected) return NextResponse.next();

  if (!accessToken) {
    if (refreshToken) {
      const refreshed = await tryRefresh(request, refreshToken);
      if (refreshed) return refreshed;
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Keep family users out of /dashboard and staff out of /family
  const role = await getRole(accessToken);
  if (pathname.startsWith("/dashboard") && role === "family") {
    return NextResponse.redirect(new URL("/family/dashboard", request.url));
  }
  if (pathname.startsWith("/family") && role !== "family") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

async function getRole(token: string): Promise<string> {
  try {
    const res = await fetch(`${API_URL}/api/v1/auth/me/`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return "";
    const user = await res.json();
    return user.role ?? "";
  } catch {
    return "";
  }
}

async function tryRefresh(
  request: NextRequest,
  refreshToken: string,
): Promise<NextResponse | null> {
  const secure = process.env.NODE_ENV === "production";

  try {
    const res = await fetch(`${API_URL}/api/v1/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) return null;

    const { access } = await res.json();
    const response = NextResponse.next();
    response.cookies.set("emp_access", access, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge: 60 * 60,
      path: "/",
    });
    return response;
  } catch {
    return null;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
