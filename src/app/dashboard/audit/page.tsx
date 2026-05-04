"use client";

import { useEffect, useState, useCallback } from "react";
import { Shield, Search, Filter, ChevronDown, RefreshCw, Plus, Edit2, Trash2 } from "lucide-react";

interface AuditEntry {
  id: number;
  user: number | null;
  user_name: string;
  action: "create" | "update" | "delete";
  model_name: string;
  object_id: string;
  object_repr: string;
  changes: Record<string, unknown>;
  timestamp: string;
}

const ACTION_CFG = {
  create: { label: "Created", color: "#34d399", bg: "rgba(52,211,153,0.12)", icon: Plus },
  update: { label: "Updated", color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  icon: Edit2 },
  delete: { label: "Deleted", color: "#f87171", bg: "rgba(239,68,68,0.12)",   icon: Trash2 },
} as const;

const MODEL_LABELS: Record<string, string> = {
  Incident: "Incident",
  LeaveRequest: "Leave Request",
  Resident: "Resident",
  Medication: "Medication",
  HandoverNote: "Handover",
  CarePlan: "Care Plan",
};

const MODELS = Object.keys(MODEL_LABELS);

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterModel, setFilterModel] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (filterAction) qs.set("action", filterAction);
    if (filterModel) qs.set("model", filterModel);
    fetch(`/api/v1/audit-log/?${qs}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: AuditEntry[]) => setEntries(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterAction, filterModel]);

  useEffect(() => { load(); }, [load]);

  const filtered = entries.filter(e => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.user_name.toLowerCase().includes(q) ||
      e.object_repr.toLowerCase().includes(q) ||
      e.model_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <Shield size={16} style={{ color: "#a78bfa" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Audit Trail</h1>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Full history of all system changes</p>
          </div>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl transition-all disabled:opacity-50"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.25)" }} />
          <input type="text" placeholder="Search by user, record…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-sm pl-9 pr-4 py-2 rounded-xl outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }} />
        </div>

        <div className="relative">
          <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.25)" }} />
          <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
            className="text-sm pl-8 pr-8 py-2 rounded-xl outline-none appearance-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
            <option value="">All Actions</option>
            <option value="create">Created</option>
            <option value="update">Updated</option>
            <option value="delete">Deleted</option>
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.3)" }} />
        </div>

        <div className="relative">
          <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.25)" }} />
          <select value={filterModel} onChange={e => setFilterModel(e.target.value)}
            className="text-sm pl-8 pr-8 py-2 rounded-xl outline-none appearance-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
            <option value="">All Models</option>
            {MODELS.map(m => <option key={m} value={m}>{MODEL_LABELS[m]}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.3)" }} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="grid" style={{
          gridTemplateColumns: "1fr 90px 120px auto 160px",
          background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          {["Record", "Action", "Model", "Changed by", "When"].map(h => (
            <div key={h} className="text-xs font-semibold uppercase tracking-wider px-4 py-3" style={{ color: "rgba(255,255,255,0.35)" }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12" style={{ background: "rgba(5,9,20,0.6)" }}>
            <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12" style={{ background: "rgba(5,9,20,0.6)", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
            No audit records found
          </div>
        ) : (
          <div style={{ background: "rgba(5,9,20,0.6)" }}>
            {filtered.map(entry => {
              const cfg = ACTION_CFG[entry.action] ?? ACTION_CFG.update;
              const Icon = cfg.icon;
              const hasChanges = Object.keys(entry.changes).length > 0;
              const isOpen = expanded === entry.id;
              return (
                <div key={entry.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="grid items-center"
                    style={{ gridTemplateColumns: "1fr 90px 120px auto 160px", cursor: hasChanges ? "pointer" : "default", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    onClick={() => hasChanges && setExpanded(isOpen ? null : entry.id)}
                    role={hasChanges ? "button" : undefined}
                    onMouseEnter={e => hasChanges && (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <div className="px-4 py-3">
                      <div className="text-sm text-white font-medium truncate">{entry.object_repr}</div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>#{entry.object_id}</div>
                    </div>
                    <div className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        <Icon size={10} />{cfg.label}
                      </span>
                    </div>
                    <div className="px-4 py-3 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {MODEL_LABELS[entry.model_name] ?? entry.model_name}
                    </div>
                    <div className="px-4 py-3 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                      {entry.user_name || "System"}
                    </div>
                    <div className="px-4 py-3 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {new Date(entry.timestamp).toLocaleDateString("en-GB")}{" "}
                      <span style={{ color: "rgba(255,255,255,0.25)" }}>
                        {new Date(entry.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                  {isOpen && hasChanges && (
                    <div className="px-4 pb-3" style={{ background: "rgba(255,255,255,0.01)" }}>
                      <pre className="text-xs rounded-xl px-3 py-2.5 overflow-x-auto"
                        style={{ background: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
                        {JSON.stringify(entry.changes, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.2)" }}>
        Showing {filtered.length} of {entries.length} records
      </p>
    </div>
  );
}
