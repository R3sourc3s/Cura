import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "emp_session";

function isAuthenticated(request: NextRequest): boolean {
  const cookie = request.cookies.get(SESSION_COOKIE);
  return !!cookie;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/", "/login"];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (!isPublicRoute && !isAuthenticated(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && isAuthenticated(request)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
