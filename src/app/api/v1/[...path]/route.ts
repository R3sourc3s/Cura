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

  const body =
    request.method !== "GET" && request.method !== "HEAD"
      ? await request.arrayBuffer()
      : undefined;

  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: body ?? undefined,
  });

  const upstreamHeaders = new Headers();
  upstream.headers.forEach((v, k) => {
    if (!["transfer-encoding", "connection"].includes(k.toLowerCase())) {
      upstreamHeaders.set(k, v);
    }
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: upstreamHeaders,
  });
}

export const GET = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => proxy(req, ctx.params);
export const POST = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => proxy(req, ctx.params);
export const PUT = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => proxy(req, ctx.params);
export const PATCH = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => proxy(req, ctx.params);
export const DELETE = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => proxy(req, ctx.params);
