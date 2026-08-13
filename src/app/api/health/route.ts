import { NextResponse } from "next/server";

// Liveness probe for the frontend container — confirms the Next.js server
// itself is up. Deliberately doesn't proxy to the backend's /api/health/;
// that's a separate service with its own healthcheck, and conflating the two
// would make this container report unhealthy for a problem in a different one.
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
