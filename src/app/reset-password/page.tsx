"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

function ResetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();
  const uid = params.get("uid") ?? "";
  const token = params.get("token") ?? "";

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!uid || !token) setError("Invalid or missing reset link. Please request a new one.");
  }, [uid, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, token, new_password: form.password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail ?? "Reset failed.");
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = { background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" };
  const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "rgba(13, 148, 136,0.5)");
  const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "var(--border)");

  return (
    <>
      {done ? (
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(13, 148, 136,0.1)" }}>
            <CheckCircle size={26} style={{ color: "#0d9488" }} />
          </div>
          <h1 className="lp-serif text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Password updated!</h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Your password has been updated. Redirecting you to login…
          </p>
        </div>
      ) : !uid || !token ? (
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(239,68,68,0.1)" }}>
            <AlertTriangle size={26} style={{ color: "#dc2626" }} />
          </div>
          <h1 className="lp-serif text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Invalid link</h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
            This reset link is invalid or has expired. Please request a new one.
          </p>
          <Link href="/forgot-password" className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
            style={{ background: "rgba(13, 148, 136,0.1)", border: "1px solid rgba(13, 148, 136,0.25)", color: "#0d9488" }}>
            Request new link
          </Link>
        </div>
      ) : (
        <>
          <h1 className="lp-serif text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Set a new password</h1>
          <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>Choose a strong password — at least 8 characters.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>New password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
                  style={inputStyle} placeholder="At least 8 characters" required autoFocus
                  onFocus={inputFocus} onBlur={inputBlur} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: "var(--text-muted)" }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Confirm new password</label>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
                  style={inputStyle} placeholder="Repeat your password" required
                  onFocus={inputFocus} onBlur={inputBlur} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: "var(--text-muted)" }}>
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm rounded-lg p-3" style={{ color: "#b91c1c", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "#0d9488" }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#0f766e"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#0d9488"; }}>
              {loading ? "Resetting…" : "Reset password"}
            </button>
          </form>
        </>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg-secondary)" }}>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#0d9488" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2C4.686 2 2 4.686 2 8s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 2.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 7.75A4.5 4.5 0 013.75 10c0-1.5 2.25-2.325 4.25-2.325S12.25 8.5 12.25 10A4.5 4.5 0 018 12.25z" fill="white"/>
              </svg>
            </div>
            <span className="lp-serif text-xl font-bold" style={{ color: "var(--text-primary)" }}>Cura</span>
          </div>
          <ThemeToggle />
        </div>

        <div className="rounded-2xl p-10" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "0 4px 24px rgba(15,23,42,0.08)" }}>
          <Suspense fallback={
            <div className="h-48 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#0d9488", borderTopColor: "transparent" }} />
            </div>
          }>
            <ResetPasswordContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
