"use client";

import { useState } from "react";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? "Something went wrong.");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#faf7f0" }}>
      <div className="w-full max-w-md">
        {/* Logo + back */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#2d5a3d" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2C4.686 2 2 4.686 2 8s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 2.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 7.75A4.5 4.5 0 013.75 10c0-1.5 2.25-2.325 4.25-2.325S12.25 8.5 12.25 10A4.5 4.5 0 018 12.25z" fill="white"/>
              </svg>
            </div>
            <span className="lp-serif text-xl font-bold" style={{ color: "#1c1a14" }}>Cura</span>
          </div>
          <Link href="/login" className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: "#7a7468" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#2d5a3d")}
            onMouseLeave={e => (e.currentTarget.style.color = "#7a7468")}>
            <ArrowLeft size={14} /> Back to login
          </Link>
        </div>

        <div className="rounded-2xl p-10" style={{ background: "#ffffff", border: "1px solid #dfd8cc", boxShadow: "0 4px 24px rgba(28,26,20,0.08)" }}>
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: "rgba(45,90,61,0.1)" }}>
                <CheckCircle size={26} style={{ color: "#2d5a3d" }} />
              </div>
              <h1 className="lp-serif text-2xl font-bold mb-3" style={{ color: "#1c1a14" }}>Check your email</h1>
              <p className="text-sm leading-relaxed mb-8" style={{ color: "#7a7468" }}>
                If <span className="font-medium" style={{ color: "#4a4438" }}>{email}</span> is registered,
                you&apos;ll receive a reset link shortly. Check your spam folder if it doesn&apos;t arrive.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
                style={{ background: "rgba(45,90,61,0.1)", border: "1px solid rgba(45,90,61,0.25)", color: "#2d5a3d" }}>
                Return to login
              </Link>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: "rgba(45,90,61,0.1)" }}>
                <Mail size={22} style={{ color: "#2d5a3d" }} />
              </div>
              <h1 className="lp-serif text-2xl font-bold mb-2" style={{ color: "#1c1a14" }}>Forgot your password?</h1>
              <p className="text-sm mb-8 leading-relaxed" style={{ color: "#7a7468" }}>
                Enter your account email address and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#4a4438" }}>Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: "#faf7f0", border: "1px solid #dfd8cc", color: "#1c1a14" }}
                    placeholder="you@carehome.co.uk"
                    required
                    autoFocus
                    onFocus={e => (e.target.style.borderColor = "rgba(45,90,61,0.5)")}
                    onBlur={e => (e.target.style.borderColor = "#dfd8cc")}
                  />
                </div>

                {error && (
                  <div className="text-sm rounded-lg p-3" style={{ color: "#b91c1c", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "#2d5a3d" }}
                  onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#235030"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#2d5a3d"; }}>
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
