"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body style={{ background: "#050914", margin: 0 }}>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertTriangle size={28} style={{ color: "#f87171" }} />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
              {error.message || "An unexpected error occurred. Please try again."}
            </p>
            <button onClick={reset}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #14b8a6)" }}>
              <RefreshCw size={14} /> Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
