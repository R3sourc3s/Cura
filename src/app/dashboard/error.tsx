"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertTriangle size={24} style={{ color: "#f87171" }} />
        </div>
        <h2 className="text-lg font-bold text-white mb-1">Page error</h2>
        <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>
          {error.message || "Something went wrong loading this page."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <button onClick={reset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    </div>
  );
}
