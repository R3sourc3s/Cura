"use client";

import { useRef, useState } from "react";
import { compliance } from "@/lib/api";
import type { ComplianceAudit, AuditAction } from "@/types";
import { useToast } from "@/components/Toast";
import {
  ShieldCheck, TrendingUp, Calendar, Plus, X, Save,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Clock,
} from "lucide-react";

const DOMAIN_META: Record<string, { label: string; desc: string; color: string }> = {
  safe:       { label: "Safe",       desc: "People are protected from abuse and avoidable harm", color: "#f87171" },
  effective:  { label: "Effective",  desc: "Care, treatment and support achieves good outcomes",  color: "#60a5fa" },
  caring:     { label: "Caring",     desc: "Staff involve and treat people with compassion",       color: "#f472b6" },
  responsive: { label: "Responsive", desc: "Services meet people's needs",                         color: "#fb923c" },
  well_led:   { label: "Well-Led",   desc: "Leadership, management and governance",                color: "#a78bfa" },
};

const RATING_CONFIG = {
  outstanding:          { color: "#34d399", bg: "rgba(52,211,153,0.12)",  label: "Outstanding" },
  good:                 { color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  label: "Good" },
  requires_improvement: { color: "#fb923c", bg: "rgba(251,146,60,0.12)",  label: "Requires Improvement" },
  inadequate:           { color: "#f87171", bg: "rgba(239,68,68,0.12)",   label: "Inadequate" },
} as const;

const ACTION_PRIORITY = {
  low:      { color: "#34d399", bg: "rgba(52,211,153,0.12)"  },
  medium:   { color: "#fbbf24", bg: "rgba(250,204,21,0.12)"  },
  high:     { color: "#fb923c", bg: "rgba(251,146,60,0.12)"  },
  critical: { color: "#f87171", bg: "rgba(239,68,68,0.12)"   },
} as const;

const ACTION_STATUS = {
  open:        { icon: AlertTriangle, color: "#fb923c", label: "Open" },
  in_progress: { icon: Clock,         color: "#60a5fa", label: "In Progress" },
  complete:    { icon: CheckCircle,   color: "#34d399", label: "Complete" },
} as const;

const inputCls = "w-full px-3 py-2.5 text-sm rounded-xl outline-none";
const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" };

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function ScoreGauge({ score, color }: { score: number; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

function ratingFromScore(score: number): ComplianceAudit["rating"] {
  if (score >= 90) return "outstanding";
  if (score >= 70) return "good";
  if (score >= 50) return "requires_improvement";
  return "inadequate";
}

function NewAuditModal({ onClose, onCreated }: { onClose: () => void; onCreated: (a: ComplianceAudit) => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({
    domain: "safe" as ComplianceAudit["domain"],
    score: "75",
    audit_date: new Date().toISOString().split("T")[0],
    next_audit_date: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const score = Number(form.score);
      const audit = await compliance.createAudit({
        domain: form.domain,
        score,
        rating: ratingFromScore(score),
        audit_date: form.audit_date,
        next_audit_date: form.next_audit_date || undefined,
        notes: form.notes,
      } as Parameters<typeof compliance.createAudit>[0]);
      onCreated(audit);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create audit");
    } finally {
      setSaving(false);
    }
  }

  const scoreNum = Number(form.score);
  const rating = ratingFromScore(scoreNum);
  const ratingCfg = RATING_CONFIG[rating];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-md rounded-2xl flex flex-col overflow-hidden"
        style={{ background: "#0d1526", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #34d399, #059669)" }}>
              <ShieldCheck size={14} className="text-white" />
            </div>
            <h2 className="text-base font-bold text-white">New CQC Audit</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <X size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm text-red-300"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}
          <Field label="CQC Domain" required>
            <select className={inputCls} style={inputStyle} value={form.domain}
              onChange={(e) => set("domain", e.target.value)} required>
              {Object.entries(DOMAIN_META).map(([v, { label }]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
          </Field>
          <Field label={`Score (0–100) — ${ratingCfg.label}`} required>
            <div className="space-y-2">
              <input type="range" min="0" max="100" value={form.score}
                onChange={(e) => set("score", e.target.value)}
                className="w-full accent-purple-500" />
              <div className="flex items-center justify-between">
                <input type="number" min="0" max="100" className={`${inputCls} w-20`} style={inputStyle}
                  value={form.score} onChange={(e) => set("score", e.target.value)} />
                <span className="text-sm font-semibold px-3 py-1 rounded-lg"
                  style={{ background: ratingCfg.bg, color: ratingCfg.color }}>
                  {ratingCfg.label}
                </span>
              </div>
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Audit Date" required>
              <input type="date" className={inputCls} style={inputStyle} value={form.audit_date}
                onChange={(e) => set("audit_date", e.target.value)} required />
            </Field>
            <Field label="Next Audit Date">
              <input type="date" className={inputCls} style={inputStyle} value={form.next_audit_date}
                onChange={(e) => set("next_audit_date", e.target.value)} />
            </Field>
          </div>
          <Field label="Notes">
            <textarea className={inputCls} style={inputStyle} value={form.notes} rows={3}
              onChange={(e) => set("notes", e.target.value)} placeholder="Audit findings, observations…" />
          </Field>
        </form>

        <div className="px-6 py-4 flex gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
            Cancel
          </button>
          <button onClick={() => formRef.current?.requestSubmit()} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
            <Save size={14} />{saving ? "Saving…" : "Record Audit"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddActionModal({ auditId, onClose, onAdded }: { auditId: number; onClose: () => void; onAdded: (a: AuditAction) => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({
    description: "",
    priority: "medium" as AuditAction["priority"],
    due_date: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const action = await compliance.createAction({
        audit: auditId,
        description: form.description,
        priority: form.priority,
        due_date: form.due_date,
        status: "open",
      } as Parameters<typeof compliance.createAction>[0]);
      onAdded(action);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create action");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-sm rounded-2xl flex flex-col overflow-hidden"
        style={{ background: "#0d1526", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-sm font-bold text-white">Add Remediation Action</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <X size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>
        <form ref={formRef} onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Field label="Action Description" required>
            <textarea className={inputCls} style={inputStyle} value={form.description} rows={3}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required
              placeholder="Describe the remediation action…" />
          </Field>
          <Field label="Priority" required>
            <div className="flex gap-2">
              {(["low", "medium", "high", "critical"] as const).map((p) => {
                const cfg = ACTION_PRIORITY[p];
                return (
                  <button type="button" key={p} onClick={() => setForm((f) => ({ ...f, priority: p }))}
                    className="flex-1 text-xs py-1.5 rounded-lg font-medium capitalize transition-all"
                    style={{
                      background: form.priority === p ? cfg.bg : "rgba(255,255,255,0.04)",
                      color: form.priority === p ? cfg.color : "rgba(255,255,255,0.35)",
                    }}>
                    {p}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Due Date" required>
            <input type="date" className={inputCls} style={inputStyle} value={form.due_date}
              onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} required />
          </Field>
        </form>
        <div className="px-5 py-4 flex gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button type="button" onClick={onClose}
            className="flex-1 py-2 text-xs font-semibold rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>
            Cancel
          </button>
          <button onClick={() => formRef.current?.requestSubmit()} disabled={saving}
            className="flex-1 py-2 text-xs font-semibold rounded-xl text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
            {saving ? "Adding…" : "Add Action"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ComplianceClient({ initialAudits }: { initialAudits: ComplianceAudit[] }) {
  const { toast } = useToast();
  const [audits, setAudits] = useState<ComplianceAudit[]>(initialAudits);
  const [showNew, setShowNew] = useState(false);
  const [expandedAudit, setExpandedAudit] = useState<number | null>(null);
  const [addActionAuditId, setAddActionAuditId] = useState<number | null>(null);
  const [updatingAction, setUpdatingAction] = useState<number | null>(null);

  async function cycleActionStatus(action: AuditAction, auditId: number) {
    const next: AuditAction["status"] =
      action.status === "open" ? "in_progress" : action.status === "in_progress" ? "complete" : "open";
    setUpdatingAction(action.id);
    try {
      const updated = await compliance.updateAction(action.id, { status: next });
      setAudits((prev) => prev.map((a) => a.id !== auditId ? a : {
        ...a,
        actions: (a.actions ?? []).map((ac) => ac.id === action.id ? updated : ac),
      }));
      toast(`Action marked ${next.replace("_", " ")}.`);
    } catch (e) { toast("Failed to update action.", "error"); }
    finally { setUpdatingAction(null); }
  }

  const avg = audits.length ? Math.round(audits.reduce((a, b) => a + b.score, 0) / audits.length) : 0;
  const overallRating = avg >= 85 ? "outstanding" : avg >= 70 ? "good" : avg >= 50 ? "requires_improvement" : "inadequate";
  const overallCfg = RATING_CONFIG[overallRating];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck size={22} style={{ color: "#34d399" }} /> Compliance
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            CQC regulatory compliance overview
          </p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold rounded-xl text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
          <Plus size={14} /> <span className="hidden sm:inline">New Audit</span><span className="sm:hidden">New</span>
        </button>
      </div>

      <div className="p-5 sm:p-6 rounded-2xl flex items-center gap-6"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="relative flex-shrink-0">
          <svg className="-rotate-90 w-20 h-20 sm:w-24 sm:h-24" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle cx="50" cy="50" r="40" fill="none" stroke={overallCfg.color} strokeWidth="8"
              strokeDasharray={`${(avg / 100) * 251} 251`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl sm:text-2xl font-bold text-white">{avg}%</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} style={{ color: overallCfg.color }} />
            <span className="text-sm font-semibold" style={{ color: overallCfg.color }}>
              {overallCfg.label}
            </span>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-white mb-1">CQC Compliance Score</div>
          <p className="text-xs sm:text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            {audits.length} domain{audits.length !== 1 ? "s" : ""} · Last updated{" "}
            {audits.length > 0 ? new Date(audits[0].audit_date).toLocaleDateString("en-GB") : "—"}
          </p>
        </div>
      </div>

      {audits.length === 0 ? (
        <div className="text-center py-16 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <ShieldCheck size={32} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.15)" }} />
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No audits recorded.</p>
          <button onClick={() => setShowNew(true)}
            className="mt-4 px-4 py-2 text-sm font-semibold rounded-xl text-white inline-flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
            <Plus size={14} /> Record First Audit
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {audits.map((audit) => {
            const meta = DOMAIN_META[audit.domain];
            const ratingCfg = RATING_CONFIG[audit.rating] ?? RATING_CONFIG.good;
            const actions = audit.actions ?? [];
            const openActions = actions.filter((a) => a.status !== "complete");
            const isExpanded = expandedAudit === audit.id;
            if (!meta) return null;
            return (
              <div key={audit.id} className="rounded-2xl overflow-hidden transition-all"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <ScoreGauge score={audit.score} color={meta.color} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-bold text-white">{meta.label}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: ratingCfg.bg, color: ratingCfg.color }}>
                          {ratingCfg.label}
                        </span>
                        {openActions.length > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(251,146,60,0.15)", color: "#fb923c" }}>
                            {openActions.length} action{openActions.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>{meta.desc}</p>
                      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full" style={{ width: `${audit.score}%`, background: meta.color }} />
                      </div>
                    </div>
                  </div>

                  {audit.notes && (
                    <p className="text-xs mt-3 px-3 py-2 rounded-lg"
                      style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      {audit.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                      <span className="flex items-center gap-1"><Calendar size={10} />
                        {new Date(audit.audit_date).toLocaleDateString("en-GB")}
                      </span>
                      {audit.next_audit_date && (
                        <span>Next: {new Date(audit.next_audit_date).toLocaleDateString("en-GB")}</span>
                      )}
                    </div>
                    <button onClick={() => setExpandedAudit(isExpanded ? null : audit.id)}
                      className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all"
                      style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>
                      Actions ({actions.length})
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center justify-between pt-4 mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
                        Remediation Actions
                      </span>
                      <button onClick={() => setAddActionAuditId(audit.id)}
                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg"
                        style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}>
                        <Plus size={11} /> Add Action
                      </button>
                    </div>
                    {actions.length === 0 ? (
                      <p className="text-xs text-center py-4" style={{ color: "rgba(255,255,255,0.25)" }}>
                        No remediation actions yet.
                      </p>
                    ) : (
                      actions.map((action) => {
                        const priority = ACTION_PRIORITY[action.priority] ?? ACTION_PRIORITY.medium;
                        const status = ACTION_STATUS[action.status] ?? ACTION_STATUS.open;
                        const StatusIcon = status.icon;
                        return (
                          <div key={action.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl"
                            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <button onClick={() => cycleActionStatus(action, audit.id)}
                              disabled={updatingAction === action.id}
                              className="mt-0.5 flex-shrink-0 transition-opacity disabled:opacity-40">
                              <StatusIcon size={14} style={{ color: status.color }} />
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-white">{action.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-1.5 py-0.5 rounded capitalize"
                                  style={{ background: priority.bg, color: priority.color }}>
                                  {action.priority}
                                </span>
                                <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                                  Due: {new Date(action.due_date).toLocaleDateString("en-GB")}
                                </span>
                                <span className="text-xs font-medium" style={{ color: status.color }}>
                                  {status.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showNew && (
        <NewAuditModal
          onClose={() => setShowNew(false)}
          onCreated={(audit) => { setAudits((prev) => [audit, ...prev]); setShowNew(false); toast("Audit recorded."); }}
        />
      )}

      {addActionAuditId !== null && (
        <AddActionModal
          auditId={addActionAuditId}
          onClose={() => setAddActionAuditId(null)}
          onAdded={(action) => {
            setAudits((prev) => prev.map((a) =>
              a.id !== addActionAuditId ? a : { ...a, actions: [...(a.actions ?? []), action] }
            ));
            setAddActionAuditId(null);
            toast("Action added.");
          }}
        />
      )}
    </div>
  );
}
