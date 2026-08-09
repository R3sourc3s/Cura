"use client";

import { useEffect, useState } from "react";
import { BarChart3, ChevronDown, ChevronUp, Brain, Pill, Bandage } from "lucide-react";

interface Insights {
  period_days: number;
  mar: { total_entries: number; by_status: { status: string; count: number }[]; missed_or_omitted: number };
  prn: {
    total_administrations: number; controlled_drug_prn: number;
    top_medications: { medication__drug_name: string; count: number }[];
    unassessed_effectiveness: number;
  };
  psychotropic: { active_medications: number; residents_on_psychotropics: number; administrations_in_period: number };
  patches: { applications_in_period: number; by_site: { patch_site: string; count: number }[]; missing_site_record: number };
}

function StatBlock({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(var(--fg-rgb),0.03)" }}>
      <div className="text-lg font-bold" style={{ color }}>{value}</div>
      <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}

/** Medication safety dashboard — PRN, psychotropic and patch-rotation slices, matching the kind of eMAR analytics competitors advertise. */
export default function MedicationInsights() {
  const [data, setData] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch("/api/v1/medications/analytics/insights/?days=30", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return null;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-hover)" }}>
      <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(139,92,246,0.12)" }}>
            <BarChart3 size={13} style={{ color: "#a78bfa" }} />
          </div>
          <span className="text-sm font-semibold text-white">Medication Safety Insights</span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>last {data.period_days} days</span>
        </div>
        {expanded ? <ChevronUp size={14} style={{ color: "var(--text-muted)" }} /> : <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4">
            <StatBlock label="MAR entries" value={data.mar.total_entries} color="var(--c-teal2)" />
            <StatBlock label="Missed / omitted" value={data.mar.missed_or_omitted} color="var(--c-red)" />
            <StatBlock label="PRN administrations" value={data.prn.total_administrations} color="var(--c-green)" />
            <StatBlock label="Controlled-drug PRN" value={data.prn.controlled_drug_prn} color="var(--c-amber)" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl p-3" style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Brain size={12} style={{ color: "#a78bfa" }} />
                <span className="text-xs font-semibold" style={{ color: "#a78bfa" }}>Psychotropic Oversight</span>
              </div>
              <div className="text-xs space-y-1" style={{ color: "var(--text-secondary)" }}>
                <div>{data.psychotropic.active_medications} active medications</div>
                <div>{data.psychotropic.residents_on_psychotropics} residents affected</div>
                <div>{data.psychotropic.administrations_in_period} doses given in period</div>
              </div>
            </div>

            <div className="rounded-xl p-3" style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.15)" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Pill size={12} style={{ color: "var(--c-green)" }} />
                <span className="text-xs font-semibold" style={{ color: "var(--c-green)" }}>Top PRN Medications</span>
              </div>
              {data.prn.top_medications.length === 0 ? (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>No PRN activity in period.</p>
              ) : (
                <div className="text-xs space-y-1" style={{ color: "var(--text-secondary)" }}>
                  {data.prn.top_medications.slice(0, 4).map((m, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="truncate">{m.medication__drug_name}</span>
                      <span style={{ color: "var(--c-green)" }}>{m.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl p-3" style={{ background: "rgba(45,212,191,0.05)", border: "1px solid rgba(45,212,191,0.15)" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Bandage size={12} style={{ color: "var(--c-teal2)" }} />
                <span className="text-xs font-semibold" style={{ color: "var(--c-teal2)" }}>Patch Site Rotation</span>
              </div>
              <div className="text-xs space-y-1" style={{ color: "var(--text-secondary)" }}>
                <div>{data.patches.applications_in_period} applications in period</div>
                {data.patches.by_site.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="truncate">{s.patch_site}</span>
                    <span>{s.count}</span>
                  </div>
                ))}
                {data.patches.missing_site_record > 0 && (
                  <div style={{ color: "var(--c-amber)" }}>{data.patches.missing_site_record} missing site record</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
