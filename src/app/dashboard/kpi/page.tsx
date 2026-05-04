"use client";

import { useEffect, useState, useCallback } from "react";
import { BarChart2, RefreshCw, Users, AlertTriangle, Pill, UserCheck, ClipboardList, TrendingUp } from "lucide-react";

interface KPI {
  residents: {
    total: number; active: number; occupancy_pct: number;
    admitted_last_30: number; discharged_last_30: number;
    risk_breakdown: { critical: number; high: number; medium: number; low: number };
    avg_ai_risk_score: number;
  };
  incidents: {
    last_30_days: number; last_90_days: number; open: number;
    critical_last_30: number;
    by_type: { incident_type: string; count: number }[];
  };
  medications: { low_stock_count: number };
  staff: { total: number; by_role: { role: string; count: number }[]; pending_leave: number };
  care: { overdue_reviews: number; critical_handovers_last_30: number };
}

function OccupancyRing({ pct }: { pct: number }) {
  const r = 36; const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 90 ? "#34d399" : pct >= 70 ? "#fbbf24" : "#f87171";
  return (
    <svg width="96" height="96" className="mx-auto">
      <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
      <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 48 48)" style={{ transition: "stroke-dasharray 0.6s ease" }} />
      <text x="48" y="53" textAnchor="middle" fill={color} fontSize="16" fontWeight="bold">{pct}%</text>
    </svg>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs w-6 text-right font-mono" style={{ color: "rgba(255,255,255,0.5)" }}>{value}</span>
    </div>
  );
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin", manager: "Manager", nurse: "Nurse", carer: "Carer", hr: "HR",
};

const INCIDENT_TYPE_LABELS: Record<string, string> = {
  fall: "Falls", medication_error: "Med Errors", near_miss: "Near Misses",
  behaviour: "Behaviour", injury: "Injuries", other: "Other",
};

export default function KPIPage() {
  const [data, setData] = useState<KPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/v1/residents/analytics/kpi/", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) { setData(d); setLastUpdated(new Date()); } })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 300_000);
    return () => clearInterval(t);
  }, [load]);

  if (loading && !data) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
    </div>
  );

  if (!data) return null;

  const { residents, incidents, medications, staff, care } = data;
  const riskTotal = residents.risk_breakdown.critical + residents.risk_breakdown.high +
    residents.risk_breakdown.medium + residents.risk_breakdown.low || 1;

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <BarChart2 size={16} style={{ color: "#a78bfa" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Analytics & KPIs</h1>
            {lastUpdated && <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Updated {lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p>}
          </div>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl disabled:opacity-50"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Occupancy */}
        <div className="rounded-2xl p-5 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>Occupancy</p>
          <OccupancyRing pct={residents.occupancy_pct} />
          <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>{residents.active} of {residents.total} beds</p>
        </div>

        {[
          { icon: AlertTriangle, label: "Open Incidents", value: incidents.open, sub: `${incidents.last_30_days} this month`, color: incidents.open > 5 ? "#f87171" : "#fbbf24" },
          { icon: Pill, label: "Low Stock Meds", value: medications.low_stock_count, sub: "need reordering", color: medications.low_stock_count > 0 ? "#f87171" : "#34d399" },
          { icon: ClipboardList, label: "Overdue Reviews", value: care.overdue_reviews, sub: "care plans", color: care.overdue_reviews > 0 ? "#fb923c" : "#34d399" },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
              <Icon size={14} style={{ color }} />
            </div>
            <p className="text-4xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Risk Breakdown */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>Resident Risk Breakdown</p>
        <div className="flex h-8 rounded-xl overflow-hidden gap-0.5">
          {[
            { key: "critical" as const, color: "#ef4444", label: "Critical" },
            { key: "high" as const, color: "#f97316", label: "High" },
            { key: "medium" as const, color: "#eab308", label: "Medium" },
            { key: "low" as const, color: "#10b981", label: "Low" },
          ].map(({ key, color, label }) => {
            const count = residents.risk_breakdown[key];
            const pct = (count / riskTotal) * 100;
            return pct > 0 ? (
              <div key={key} style={{ width: `${pct}%`, background: color, minWidth: count > 0 ? 8 : 0 }}
                className="flex items-center justify-center text-xs font-bold text-white transition-all"
                title={`${label}: ${count}`}>
                {pct > 8 ? count : ""}
              </div>
            ) : null;
          })}
        </div>
        <div className="flex gap-6 mt-3">
          {[
            { key: "critical" as const, color: "#ef4444", label: "Critical" },
            { key: "high" as const, color: "#f97316", label: "High" },
            { key: "medium" as const, color: "#eab308", label: "Medium" },
            { key: "low" as const, color: "#10b981", label: "Low" },
          ].map(({ key, color, label }) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{label}: <strong style={{ color: "rgba(255,255,255,0.8)" }}>{residents.risk_breakdown[key]}</strong></span>
            </div>
          ))}
          <div className="ml-auto text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Avg AI risk: <strong style={{ color: "#a78bfa" }}>{residents.avg_ai_risk_score}/100</strong></div>
        </div>
      </div>

      {/* Bottom 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Staff */}
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2 mb-4">
            <UserCheck size={14} style={{ color: "#7c3aed" }} />
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Staff Overview</p>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{staff.total}</p>
          <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>active staff members</p>
          <div className="space-y-2.5">
            {staff.by_role.map(({ role, count }) => (
              <div key={role}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>{ROLE_LABELS[role] ?? role}</span>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>{count}</span>
                </div>
                <MiniBar value={count} max={staff.total} color="#7c3aed" />
              </div>
            ))}
          </div>
          {staff.pending_leave > 0 && (
            <div className="mt-3 px-3 py-2 rounded-xl text-xs" style={{ background: "rgba(251,146,60,0.1)", color: "#fb923c" }}>
              {staff.pending_leave} pending leave request{staff.pending_leave > 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Care Quality */}
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} style={{ color: "#7c3aed" }} />
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Care Quality</p>
          </div>
          <div className="space-y-4">
            {[
              { label: "Overdue Care Plan Reviews", value: care.overdue_reviews, color: care.overdue_reviews > 0 ? "#f87171" : "#34d399", good: care.overdue_reviews === 0 },
              { label: "Critical Handovers (30d)", value: care.critical_handovers_last_30, color: care.critical_handovers_last_30 > 3 ? "#f87171" : "#fbbf24", good: false },
              { label: "Residents Admitted (30d)", value: residents.admitted_last_30, color: "#60a5fa", good: false },
              { label: "Residents Discharged (30d)", value: residents.discharged_last_30, color: "#a78bfa", good: false },
            ].map(({ label, value, color, good }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
                <span className="text-sm font-bold" style={{ color: good ? "#34d399" : color }}>{value}</span>
              </div>
            ))}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Avg AI Risk Score</span>
                <span style={{ color: "#a78bfa" }}>{residents.avg_ai_risk_score}/100</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full" style={{ width: `${residents.avg_ai_risk_score}%`, background: "linear-gradient(90deg, #7c3aed, #3b82f6)" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Incidents */}
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={14} style={{ color: "#7c3aed" }} />
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Incidents</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Last 30 days", value: incidents.last_30_days, color: "#fbbf24" },
              { label: "Last 90 days", value: incidents.last_90_days, color: "#a78bfa" },
              { label: "Currently Open", value: incidents.open, color: "#f87171" },
              { label: "Critical (30d)", value: incidents.critical_last_30, color: "#ef4444" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-lg font-bold" style={{ color }}>{value}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>By Type (90d)</p>
          <div className="space-y-2">
            {incidents.by_type.slice(0, 5).map(({ incident_type, count }) => (
              <div key={incident_type}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>{INCIDENT_TYPE_LABELS[incident_type] ?? incident_type}</span>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>{count}</span>
                </div>
                <MiniBar value={count} max={incidents.last_90_days || 1} color="#f97316" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
