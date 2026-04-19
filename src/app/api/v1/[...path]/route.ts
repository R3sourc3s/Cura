import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

async function proxy(request: NextRequest, params: Promise<{ path: string[] }>): Promise<NextResponse> {
  const { path } = await params;
  const joined = path.join("/");
  const search = request.nextUrl.search;
  const target = `${API_URL}/api/v1/${joined}/${search}`;

  const headers = new Headers();
  const auth = request.headers.get("authorization");
  const ct = request.headers.get("content-type");
  if (auth) headers.set("authorization", auth);
  if (ct) headers.set("content-type", ct);

  let body: BodyInit | null = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    const ab = await request.arrayBuffer();
    body = new Uint8Array(ab) as BodyInit;
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: body ?? undefined,
    });
  } catch (err) {
    console.error(`[proxy] upstream fetch failed: ${target}`, err);
    return NextResponse.json({ detail: "Backend unavailable" }, { status: 502 });
  }

  const upstreamHeaders = new Headers();
  upstream.headers.forEach((v, k) => {
    const lower = k.toLowerCase();
    if (!["transfer-encoding", "connection", "content-encoding"].includes(lower)) {
      upstreamHeaders.set(k, v);
    }
  });

  // 204/205 must not carry a body
  if (upstream.status === 204 || upstream.status === 205) {
    return new NextResponse(null, { status: upstream.status, headers: upstreamHeaders });
  }

  const upstreamBody = await upstream.arrayBuffer();
  return new NextResponse(upstreamBody, {
    status: upstream.status,
    headers: upstreamHeaders,
  });
}

export const GET = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => proxy(req, ctx.params);
export const POST = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => proxy(req, ctx.params);
export const PUT = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => proxy(req, ctx.params);
export const PATCH = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => proxy(req, ctx.params);
export const DELETE = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => proxy(req, ctx.params);
