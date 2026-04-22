import { API_URL } from "@/lib/config";
import { NextRequest, NextResponse } from "next/server";


const secure = process.env.NODE_ENV === "production";

async function proxy(request: NextRequest, params: Promise<{ path: string[] }>): Promise<NextResponse> {
  const { path } = await params;
  const joined = path.join("/");
  const search = request.nextUrl.search;
  const target = `${API_URL}/api/v1/${joined}/${search}`;

  const accessToken = request.cookies.get("emp_access")?.value;

  const headers = new Headers();
  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);
  const ct = request.headers.get("content-type");
  if (ct) headers.set("content-type", ct);

  let body: BodyInit | null = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    const ab = await request.arrayBuffer();
    body = new Uint8Array(ab) as BodyInit;
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, { method: request.method, headers, body: body ?? undefined });
  } catch (err) {
    console.error(`[proxy] upstream fetch failed: ${target}`, err);
    return NextResponse.json({ detail: "Backend unavailable" }, { status: 502 });
  }

  // Auto-refresh on 401
  if (upstream.status === 401) {
    const refreshToken = request.cookies.get("emp_refresh")?.value;
    if (refreshToken) {
      let refreshRes: Response;
      try {
        refreshRes = await fetch(`${API_URL}/api/v1/auth/refresh/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
        });
      } catch {
        refreshRes = new Response(null, { status: 502 });
      }

      if (refreshRes.ok) {
        const { access: newAccess } = await refreshRes.json();

        // Retry with new token
        headers.set("authorization", `Bearer ${newAccess}`);
        let retryBody: BodyInit | null = null;
        if (body) retryBody = body; // body already read — re-use buffer

        let retried: Response;
        try {
          retried = await fetch(target, { method: request.method, headers, body: retryBody ?? undefined });
        } catch {
          return NextResponse.json({ detail: "Backend unavailable" }, { status: 502 });
        }

        const retryResponse = await buildNextResponse(retried);
        retryResponse.cookies.set("emp_access", newAccess, {
          httpOnly: true, secure, sameSite: "lax", maxAge: 60 * 60, path: "/",
        });
        return retryResponse;
      }
    }

    // Refresh failed — clear cookies and return 401
    const unauth = NextResponse.json({ detail: "Session expired" }, { status: 401 });
    unauth.cookies.set("emp_access", "", { maxAge: 0, path: "/" });
    unauth.cookies.set("emp_refresh", "", { maxAge: 0, path: "/" });
    return unauth;
  }

  return buildNextResponse(upstream);
}

async function buildNextResponse(upstream: Response): Promise<NextResponse> {
  const upstreamHeaders = new Headers();
  upstream.headers.forEach((v, k) => {
    const lower = k.toLowerCase();
    if (!["transfer-encoding", "connection", "content-encoding"].includes(lower)) {
      upstreamHeaders.set(k, v);
    }
  });

  if (upstream.status === 204 || upstream.status === 205) {
    return new NextResponse(null, { status: upstream.status, headers: upstreamHeaders });
  }

  const upstreamBody = await upstream.arrayBuffer();
  return new NextResponse(upstreamBody, { status: upstream.status, headers: upstreamHeaders });
}

export const GET    = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => proxy(req, ctx.params);
export const POST   = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => proxy(req, ctx.params);
export const PUT    = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => proxy(req, ctx.params);
export const PATCH  = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => proxy(req, ctx.params);
export const DELETE = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => proxy(req, ctx.params);
