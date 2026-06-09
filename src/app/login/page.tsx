"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.username, form.password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#faf7f0" }}>
      <div className="w-full max-w-md">
        {/* Logo + back home */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#2d5a3d" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2C4.686 2 2 4.686 2 8s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 2.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 7.75A4.5 4.5 0 013.75 10c0-1.5 2.25-2.325 4.25-2.325S12.25 8.5 12.25 10A4.5 4.5 0 018 12.25z" fill="white"/>
              </svg>
            </div>
            <span className="lp-serif text-xl font-bold" style={{ color: "#1c1a14" }}>Cura</span>
          </div>
          <Link href="/" className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: "#7a7468" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#2d5a3d")}
            onMouseLeave={e => (e.currentTarget.style.color = "#7a7468")}>
            <ArrowLeft size={14} /> Home
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-10" style={{ background: "#ffffff", border: "1px solid #dfd8cc", boxShadow: "0 4px 24px rgba(28,26,20,0.08)" }}>
          <h1 className="lp-serif text-2xl font-bold mb-1" style={{ color: "#1c1a14" }}>Welcome back</h1>
          <p className="text-sm mb-8" style={{ color: "#7a7468" }}>Sign in to your Cura account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#4a4438" }}>Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: "#faf7f0", border: "1px solid #dfd8cc", color: "#1c1a14" }}
                placeholder="Enter your username"
                required
                onFocus={e => (e.target.style.borderColor = "rgba(45,90,61,0.5)")}
                onBlur={e => (e.target.style.borderColor = "#dfd8cc")}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium" style={{ color: "#4a4438" }}>Password</label>
                <Link href="/forgot-password" className="text-xs transition-colors" style={{ color: "#2d5a3d" }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "#faf7f0", border: "1px solid #dfd8cc", color: "#1c1a14" }}
                  placeholder="Enter your password"
                  required
                  onFocus={e => (e.target.style.borderColor = "rgba(45,90,61,0.5)")}
                  onBlur={e => (e.target.style.borderColor = "#dfd8cc")}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#a89f94" }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
              style={{ background: "#2d5a3d" }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#235030"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#2d5a3d"; }}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm mt-8" style={{ color: "#7a7468" }}>
            No account?{" "}
            <a href="mailto:hello@curacareplatform.co.uk" style={{ color: "#2d5a3d" }}>
              Contact your administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
