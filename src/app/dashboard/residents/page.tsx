"use client";

import { useEffect, useState, useCallback } from "react";
import { residents } from "@/lib/api";
import type { Resident } from "@/types";
import { Search, Filter, Users, AlertTriangle } from "lucide-react";

const RISK = {
  critical: { bg: "rgba(239,68,68,0.15)", text: "#f87171", dot: "#ef4444" },
  high: { bg: "rgba(251,146,60,0.15)", text: "#fb923c", dot: "#f97316" },
  medium: { bg: "rgba(250,204,21,0.12)", text: "#fbbf24", dot: "#eab308" },
  low: { bg: "rgba(52,211,153,0.12)", text: "#34d399", dot: "#10b981" },
} as const;

function RiskBadge({ level }: { level: string }) {
  const s = RISK[level as keyof typeof RISK] ?? RISK.low;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium capitalize"
      style={{ background: s.bg, color: s.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {level}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "#ef4444" : score >= 60 ? "#f97316" : score >= 40 ? "#eab308" : "#10b981";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold" style={{ color }}>{score}</span>
    </div>
  );
}

export default function ResidentsPage() {
  const [list, setList] = useState<Resident[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { is_active: "true" };
      if (search) params.search = search;
      if (riskFilter) params.fall_risk = riskFilter;
      const data = await residents.list(params);
      setList(data.results);
      setTotal(data.count);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, riskFilter]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users size={22} style={{ color: "#7c3aed" }} /> Residents
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            {total} active resident{total !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          className="px-4 py-2 text-sm font-semibold rounded-xl text-white transition-all"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
        >
          + Add Resident
        </button>
      </div>

      {/* Filters */}
      <div
        className="flex items-center gap-3 p-4 rounded-2xl"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.25)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, NHS, room…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: "rgba(255,255,255,0.35)" }} />
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-sm px-3 py-2 rounded-xl outline-none cursor-pointer"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: riskFilter ? "white" : "rgba(255,255,255,0.35)" }}
          >
            <option value="">All risk levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Resident", "Room", "Age", "Fall Risk", "AI Score", "Conditions", ""].map((h) => (
                <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-3"
                  style={{ color: "rgba(255,255,255,0.35)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ background: "rgba(5,9,20,0.6)" }}>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto" />
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                  No residents found.
                </td>
              </tr>
            ) : (
              list.map((r) => (
                <tr
                  key={r.id}
                  className="transition-all"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}
                      >
                        {r.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{r.full_name}</div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                          {r.nhs_number || "No NHS no."}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono" style={{ color: "rgba(255,255,255,0.6)" }}>{r.room_number}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{r.age}</span>
                  </td>
                  <td className="px-4 py-3">
                    <RiskBadge level={r.fall_risk} />
                  </td>
                  <td className="px-4 py-3">
                    <ScoreBar score={r.ai_risk_score} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(r.conditions ?? []).slice(0, 2).map((c, i) => (
                        <span key={i} className="text-xs px-1.5 py-0.5 rounded-md"
                          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)" }}>
                          {c.name}
                        </span>
                      ))}
                      {(r.conditions?.length ?? 0) > 2 && (
                        <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>
                          +{(r.conditions?.length ?? 0) - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                      style={{ background: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}>
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* High risk alert */}
      {list.filter((r) => r.fall_risk === "critical").length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">
            {list.filter((r) => r.fall_risk === "critical").length} resident(s) at critical risk — immediate review required.
          </p>
        </div>
      )}
    </div>
  );
}
