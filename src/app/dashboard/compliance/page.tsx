"use client";

import { useEffect, useState } from "react";
import { compliance } from "@/lib/api";
import type { ComplianceAudit } from "@/types";
import { ShieldCheck, TrendingUp, Calendar } from "lucide-react";

const DOMAIN_META: Record<string, { label: string; desc: string; color: string }> = {
  safe:       { label: "Safe",       desc: "People are protected from abuse and avoidable harm", color: "#f87171" },
  effective:  { label: "Effective",  desc: "Care, treatment and support achieves good outcomes",  color: "#60a5fa" },
  caring:     { label: "Caring",     desc: "Staff involve and treat people with compassion",        color: "#f472b6" },
  responsive: { label: "Responsive", desc: "Services meet people's needs",                          color: "#fb923c" },
  well_led:   { label: "Well-Led",   desc: "Leadership, management and governance",                 color: "#a78bfa" },
};

const RATING_CONFIG = {
  outstanding:          { color: "#34d399", bg: "rgba(52,211,153,0.12)",  label: "Outstanding" },
  good:                 { color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  label: "Good" },
  requires_improvement: { color: "#fb923c", bg: "rgba(251,146,60,0.12)",  label: "Requires Improvement" },
  inadequate:           { color: "#f87171", bg: "rgba(239,68,68,0.12)",   label: "Inadequate" },
} as const;

function ScoreGauge({ score, color }: { score: number; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={r} fill="none"
          stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

export default function CompliancePage() {
  const [audits, setAudits] = useState<ComplianceAudit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    compliance.audits()
      .then((d) => setAudits(d.results))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const avg = audits.length ? Math.round(audits.reduce((a, b) => a + b.score, 0) / audits.length) : 0;
  const overallRating = avg >= 85 ? "outstanding" : avg >= 70 ? "good" : avg >= 50 ? "requires_improvement" : "inadequate";
  const overallCfg = RATING_CONFIG[overallRating];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck size={22} style={{ color: "#34d399" }} /> Compliance
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            CQC regulatory compliance overview
          </p>
        </div>
        <button className="px-4 py-2 text-sm font-semibold rounded-xl text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
          + New Audit
        </button>
      </div>

      {/* Overall score card */}
      <div className="p-6 rounded-2xl flex items-center gap-6"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="relative">
          <svg className="-rotate-90 w-24 h-24" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle cx="50" cy="50" r="40" fill="none"
              stroke={overallCfg.color} strokeWidth="8"
              strokeDasharray={`${(avg / 100) * 251} 251`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{avg}%</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} style={{ color: overallCfg.color }} />
            <span className="text-sm font-semibold" style={{ color: overallCfg.color }}>
              Overall: {overallCfg.label}
            </span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">CQC Compliance Score</div>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Across {audits.length} domain{audits.length !== 1 ? "s" : ""} · Last updated {
              audits.length > 0 ? new Date(audits[0].audit_date).toLocaleDateString("en-GB") : "—"
            }
          </p>
        </div>
      </div>

      {/* Domain cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {audits.map((audit) => {
          const meta = DOMAIN_META[audit.domain];
          const ratingCfg = RATING_CONFIG[audit.rating] ?? RATING_CONFIG.good;
          if (!meta) return null;
          return (
            <div key={audit.id} className="p-5 rounded-2xl flex flex-col gap-4 transition-all"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${meta.color}40`)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            >
              <div className="flex items-start gap-4">
                <ScoreGauge score={audit.score} color={meta.color} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-sm font-bold text-white">{meta.label}</div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: ratingCfg.bg, color: ratingCfg.color }}>
                      {ratingCfg.label}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {meta.desc}
                  </p>
                </div>
              </div>

              {/* Score bar */}
              <div>
                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${audit.score}%`, background: meta.color }} />
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center justify-between text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                <div className="flex items-center gap-1.5">
                  <Calendar size={11} />
                  <span>Last: {new Date(audit.audit_date).toLocaleDateString("en-GB")}</span>
                </div>
                {audit.next_audit_date && (
                  <span>Next: {new Date(audit.next_audit_date).toLocaleDateString("en-GB")}</span>
                )}
              </div>

              {audit.notes && (
                <p className="text-xs line-clamp-2 px-3 py-2 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  {audit.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {audits.length === 0 && (
        <div className="text-center py-16 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <ShieldCheck size={32} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.15)" }} />
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No audits recorded. Run the seed command to populate demo data.</p>
        </div>
      )}
    </div>
  );
}
