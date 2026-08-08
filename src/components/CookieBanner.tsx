"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

type Consent = "all" | "essential" | null;

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cookie_consent") as Consent;
    if (!stored) setVisible(true);
  }, []);

  const accept = (level: "all" | "essential") => {
    localStorage.setItem("cookie_consent", level);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div
        className="max-w-3xl mx-auto rounded-2xl p-5 sm:p-6 shadow-xl"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          boxShadow: "0 8px 40px rgba(15,23,42,0.16)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="font-semibold text-sm mb-1.5" style={{ color: "var(--text-primary)" }}>
              We use cookies
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              We use essential cookies to keep Cura running and optional analytics cookies to understand how visitors use our site — no personal data is shared with third parties.{" "}
              <a href="/privacy" className="underline underline-offset-2" style={{ color: "#0d9488" }}>
                Privacy policy
              </a>
            </p>
          </div>
          <button
            onClick={() => accept("essential")}
            className="flex-shrink-0 p-1 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
            aria-label="Dismiss — essential cookies only"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <button
            onClick={() => accept("essential")}
            className="lp-btn-secondary text-sm px-5 py-2.5 rounded-lg"
          >
            Essential only
          </button>
          <button
            onClick={() => accept("all")}
            className="lp-btn-primary text-sm px-5 py-2.5 rounded-lg"
          >
            Accept all cookies
          </button>
        </div>
      </div>
    </div>
  );
}
