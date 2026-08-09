"use client";

import { useEffect, useState } from "react";
import { Building2, Users, Bed, ShieldCheck, AlertTriangle, UserCheck2 } from "lucide-react";
import type { GroupOversight } from "@/types";

export default function GroupOversightPage() {
  const [data, setData] = useState<GroupOversight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/v1/staff/group-oversight/", { credentials: "include" })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-16"><div className="w-6 h-6 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" /></div>;
  }

  if (error || !data) {
    return (
      <div className="text-center py-16 rounded-2xl max-w-lg mx-auto" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <Building2 size={28} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Group Oversight isn&apos;t available — your account may not belong to a multi-home group yet.
        </p>
      </div>
    );
  }

  const { group, care_homes, totals } = data;

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.2)" }}>
          <Building2 size={16} style={{ color: "#818cf8" }} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Group Oversight</h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{group.name} · {totals.care_home_count} care homes</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Care Homes", value: totals.care_home_count, icon: Building2, color: "#818cf8" },
          { label: "Residents", value: totals.resident_count, icon: Users, color: "var(--c-teal)" },
          { label: "Beds", value: totals.bed_count, icon: Bed, color: "var(--c-green)" },
          { label: "Incidents (30d)", value: totals.incidents_last_30_days, icon: AlertTriangle, color: totals.incidents_last_30_days > 0 ? "var(--c-red)" : "var(--text-muted)" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-4 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-hover)" }}>
            <Icon size={14} className="mx-auto mb-1.5" style={{ color }} />
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
              {["Care Home", "Occupancy", "Residents", "High Risk", "Staff", "Compliance", "Incidents (30d)"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-xs" style={{ color: "var(--text-secondary)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {care_homes.map((home, i) => (
              <tr key={home.id} style={{ borderBottom: i < care_homes.length - 1 ? "1px solid var(--border)" : "none", background: i % 2 === 0 ? "transparent" : "rgba(var(--fg-rgb),0.02)" }}>
                <td className="px-4 py-3 font-medium text-white">{home.name}</td>
                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                  {home.occupancy_pct != null ? `${home.occupancy_pct}%` : "—"} <span style={{ color: "var(--text-muted)" }}>({home.resident_count}/{home.bed_count})</span>
                </td>
                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{home.resident_count}</td>
                <td className="px-4 py-3">
                  {home.high_risk_residents > 0 ? (
                    <span className="flex items-center gap-1" style={{ color: "var(--c-red)" }}>
                      <AlertTriangle size={11} /> {home.high_risk_residents}
                    </span>
                  ) : <span style={{ color: "var(--text-muted)" }}>0</span>}
                </td>
                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                  <span className="flex items-center gap-1"><UserCheck2 size={11} style={{ color: "var(--c-green)" }} /> {home.staff_count}</span>
                </td>
                <td className="px-4 py-3">
                  {home.avg_compliance_score != null ? (
                    <span className="flex items-center gap-1" style={{ color: home.avg_compliance_score >= 70 ? "var(--c-green)" : "var(--c-orange)" }}>
                      <ShieldCheck size={11} /> {home.avg_compliance_score}%
                    </span>
                  ) : <span style={{ color: "var(--text-muted)" }}>No audits</span>}
                </td>
                <td className="px-4 py-3" style={{ color: home.incidents_last_30_days > 0 ? "var(--c-red)" : "var(--text-muted)" }}>
                  {home.incidents_last_30_days}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs" style={{ color: "rgba(var(--fg-rgb),0.35)" }}>
        Last updated {new Date(data.generated_at).toLocaleString("en-GB")}
      </p>
    </div>
  );
}
