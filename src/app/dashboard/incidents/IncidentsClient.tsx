"use client";

import { useState } from "react";
import { incidents as incidentsApi } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/Toast";
import type { Incident, Resident } from "@/types";
import {
  AlertTriangle, Plus, X, Save,
  CheckCircle, Eye,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

const SEVERITY = {
  critical: { bg: "rgba(239,68,68,0.15)",  text: "var(--c-red)",  dot: "#ef4444" },
  high:     { bg: "rgba(251,146,60,0.15)",  text: "var(--c-orange)",  dot: "#f97316" },
  medium:   { bg: "rgba(250,204,21,0.12)",  text: "var(--c-amber)",  dot: "#eab308" },
  low:      { bg: "rgba(52,211,153,0.12)",  text: "var(--c-green)",  dot: "#10b981" },
} as const;

const STATUS = {
  open:         { color: "var(--c-red)", bg: "rgba(239,68,68,0.12)",   label: "Open" },
  under_review: { color: "var(--c-amber)", bg: "rgba(250,204,21,0.12)",  label: "Under Review" },
  closed:       { color: "var(--c-green)", bg: "rgba(52,211,153,0.12)",  label: "Closed" },
} as const;

const TYPE_LABELS: Record<string, string> = {
  fall: "Fall", medication_error: "Medication Error", near_miss: "Near Miss",
  behaviour: "Behaviour", injury: "Injury", other: "Other",
};

const inputCls = "w-full px-3 py-2.5 text-sm rounded-xl outline-none";
const inputStyle = { background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" };

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function SeverityBadge({ level }: { level: string }) {
  const s = SEVERITY[level as keyof typeof SEVERITY] ?? SEVERITY.low;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium capitalize"
      style={{ background: s.bg, color: s.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {level}
    </span>
  );
}

function CreateIncidentModal({
  residents, onClose, onCreated,
}: {
  residents: Resident[];
  onClose: () => void;
  onCreated: (i: Incident) => void;
}) {
  const [form, setForm] = useState({
    resident: "",
    incident_type: "fall",
    severity: "low",
    incident_date: new Date().toISOString().slice(0, 16),
    location: "",
    description: "",
    immediate_action: "",
    injury_sustained: false,
    injury_description: "",
    witnesses: "",
    reported_to_gp: false,
    reported_to_family: false,
    reported_to_cqc: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(k: string, v: string | boolean) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const payload: Partial<Incident> = {
        ...form,
        resident: form.resident ? Number(form.resident) : null,
      } as Partial<Incident>;
      const created = await incidentsApi.create(payload);
      onCreated(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create incident");
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}>
      <div className="h-full w-full max-w-xl flex flex-col overflow-hidden"
        style={{ background: "var(--bg-elevated)", borderLeft: "1px solid var(--border-strong)" }}>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
              <AlertTriangle size={14} className="text-white" />
            </div>
            <h2 className="text-base font-bold text-white">Report Incident</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--input-bg)" }}>
            <X size={16} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm text-red-300"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>{error}</div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Incident Type" required>
              <select className={inputCls} style={inputStyle} value={form.incident_type}
                onChange={(e) => set("incident_type", e.target.value)}>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Severity" required>
              <select className={inputCls} style={inputStyle} value={form.severity}
                onChange={(e) => set("severity", e.target.value)}>
                {["low", "medium", "high", "critical"].map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Date & Time" required>
            <input type="datetime-local" className={inputCls} style={inputStyle}
              value={form.incident_date} onChange={(e) => set("incident_date", e.target.value)} required />
          </Field>

          <Field label="Resident Involved">
            <select className={inputCls} style={inputStyle} value={form.resident}
              onChange={(e) => set("resident", e.target.value)}>
              <option value="">— none / unknown —</option>
              {residents.map((r) => <option key={r.id} value={r.id}>{r.full_name} (Room {r.room_number})</option>)}
            </select>
          </Field>

          <Field label="Location">
            <input className={inputCls} style={inputStyle} value={form.location}
              onChange={(e) => set("location", e.target.value)} placeholder="e.g. Corridor, Room 7A" />
          </Field>

          <Field label="Description" required>
            <textarea className={inputCls} style={inputStyle} rows={4} value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe what happened…" required />
          </Field>

          <Field label="Immediate Action Taken">
            <textarea className={inputCls} style={inputStyle} rows={3} value={form.immediate_action}
              onChange={(e) => set("immediate_action", e.target.value)}
              placeholder="What was done immediately after the incident?" />
          </Field>

          <Field label="Witnesses">
            <input className={inputCls} style={inputStyle} value={form.witnesses}
              onChange={(e) => set("witnesses", e.target.value)} placeholder="Names of witnesses" />
          </Field>

          <div className="space-y-2">
            <label className="block text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Injury Sustained
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-5 rounded-full flex items-center px-0.5"
                style={{ background: form.injury_sustained ? "#ef4444" : "rgba(var(--fg-rgb),0.12)" }}>
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.injury_sustained ? "translate-x-5" : "translate-x-0"}`} />
              </div>
              <input type="checkbox" className="hidden" checked={form.injury_sustained}
                onChange={(e) => set("injury_sustained", e.target.checked)} />
              <span className="text-sm text-white">Injury was sustained</span>
            </label>
            {form.injury_sustained && (
              <textarea className={inputCls} style={inputStyle} rows={2} value={form.injury_description}
                onChange={(e) => set("injury_description", e.target.value)}
                placeholder="Describe the injury…" />
            )}
          </div>

          <div className="space-y-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Notifications</p>
            {(["reported_to_gp", "reported_to_family", "reported_to_cqc"] as const).map((key) => {
              const labels = { reported_to_gp: "GP notified", reported_to_family: "Family notified", reported_to_cqc: "CQC notified" };
              return (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <div className="w-10 h-5 rounded-full flex items-center px-0.5"
                    style={{ background: form[key] ? "#0d9488" : "rgba(var(--fg-rgb),0.12)" }}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form[key] ? "translate-x-5" : "translate-x-0"}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={form[key]}
                    onChange={(e) => set(key, e.target.checked)} />
                  <span className="text-sm text-white">{labels[key]}</span>
                </label>
              );
            })}
          </div>
        </form>

        <div className="px-6 py-4 flex gap-3 flex-shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
            style={{ background: "var(--input-bg)", color: "var(--text-secondary)", border: "1px solid var(--border-strong)" }}>
            Cancel
          </button>
          <button onClick={(e) => { e.preventDefault(); handleSubmit(e as unknown as React.FormEvent); }}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
            <Save size={14} />{saving ? "Submitting…" : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}

function IncidentDetail({ incident, onClose, onUpdate }: {
  incident: Incident;
  onClose: () => void;
  onUpdate: (i: Incident) => void;
}) {
  const { can } = useUser();
  const { toast } = useToast();
  const [followUpText, setFollowUpText] = useState("");
  const [addingFollowUp, setAddingFollowUp] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  async function submitFollowUp() {
    if (!followUpText.trim()) return;
    setAddingFollowUp(true);
    try {
      await incidentsApi.addFollowUp(incident.id, followUpText.trim());
      const updated = await incidentsApi.get(incident.id);
      onUpdate(updated);
      setFollowUpText("");
      toast("Follow-up added.");
    } catch { toast("Failed to add follow-up.", "error"); }
    finally { setAddingFollowUp(false); }
  }

  async function changeStatus(status: Incident["status"]) {
    setUpdatingStatus(true);
    try {
      const updated = await incidentsApi.update(incident.id, { status });
      onUpdate(updated);
      toast(`Status updated to ${status.replace("_", " ")}.`);
    } catch { toast("Failed to update status.", "error"); }
    finally { setUpdatingStatus(false); }
  }

  const st = STATUS[incident.status as keyof typeof STATUS] ?? STATUS.open;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}>
      <div className="h-full w-full max-w-xl flex flex-col overflow-hidden"
        style={{ background: "var(--bg-elevated)", borderLeft: "1px solid var(--border-strong)" }}>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <h2 className="text-base font-bold text-white">{TYPE_LABELS[incident.incident_type]}</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {new Date(incident.incident_date).toLocaleString("en-GB")}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--input-bg)" }}>
            <X size={16} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="flex gap-2 flex-wrap">
            <SeverityBadge level={incident.severity} />
            <span className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: st.bg, color: st.color }}>{st.label}</span>
            {incident.injury_sustained && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: "rgba(239,68,68,0.12)", color: "var(--c-red)" }}>Injury</span>
            )}
          </div>

          {incident.resident_name && (
            <div className="px-4 py-3 rounded-xl text-sm text-white"
              style={{ background: "rgba(13, 148, 136,0.1)", border: "1px solid rgba(13, 148, 136,0.2)" }}>
              Resident: <strong>{incident.resident_name}</strong>
            </div>
          )}

          <div className="space-y-3">
            {[
              { label: "Description", value: incident.description },
              incident.immediate_action && { label: "Immediate Action", value: incident.immediate_action },
              incident.location && { label: "Location", value: incident.location },
              incident.witnesses && { label: "Witnesses", value: incident.witnesses },
              incident.injury_sustained && incident.injury_description && { label: "Injury", value: incident.injury_description },
            ].filter(Boolean).map((item: unknown) => {
              const { label, value } = item as { label: string; value: string };
              return (
                <div key={label}>
                  <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
                  <p className="text-sm text-white whitespace-pre-wrap">{value}</p>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 flex-wrap">
            {incident.reported_to_gp && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(52,211,153,0.1)", color: "var(--c-green)" }}>GP Notified</span>}
            {incident.reported_to_family && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(52,211,153,0.1)", color: "var(--c-green)" }}>Family Notified</span>}
            {incident.reported_to_cqc && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(52,211,153,0.1)", color: "var(--c-green)" }}>CQC Notified</span>}
          </div>

          {can("incidents.manage") && incident.status !== "closed" && (
            <div className="flex gap-2">
              {incident.status === "open" && (
                <button onClick={() => changeStatus("under_review")} disabled={updatingStatus}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl disabled:opacity-50"
                  style={{ background: "rgba(250,204,21,0.1)", color: "var(--c-amber)", border: "1px solid rgba(250,204,21,0.2)" }}>
                  Mark Under Review
                </button>
              )}
              <button onClick={() => changeStatus("closed")} disabled={updatingStatus}
                className="flex-1 py-2 text-xs font-semibold rounded-xl disabled:opacity-50"
                style={{ background: "rgba(52,211,153,0.1)", color: "var(--c-green)", border: "1px solid rgba(52,211,153,0.2)" }}>
                <CheckCircle size={12} className="inline mr-1" />Close Incident
              </button>
            </div>
          )}

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <h3 className="text-sm font-semibold text-white mb-3">Follow-ups ({incident.follow_ups?.length ?? 0})</h3>
            {(incident.follow_ups ?? []).map((fu) => (
              <div key={fu.id} className="flex gap-3 mb-3">
                <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{ background: "rgba(13, 148, 136,0.2)", color: "var(--c-teal)" }}>
                  {(fu.actioned_by_name?.[0] ?? "?").toUpperCase()}
                </div>
                <div className="flex-1 px-3 py-2 rounded-xl text-sm text-white"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <p className="mb-1">{fu.note}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {fu.actioned_by_name} · {new Date(fu.created_at).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-3">
              <input value={followUpText} onChange={(e) => setFollowUpText(e.target.value)}
                className={`flex-1 ${inputCls}`} style={inputStyle}
                placeholder="Add a follow-up note…"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitFollowUp(); } }} />
              <button onClick={submitFollowUp} disabled={addingFollowUp || !followUpText.trim()}
                className="px-3 py-2 text-sm font-semibold rounded-xl text-white disabled:opacity-40"
                style={{ background: "#0d9488" }}>
                {addingFollowUp ? "…" : "Add"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Props {
  initialIncidents: Incident[];
  initialTotal: number;
  residents: Resident[];
}

export default function IncidentsClient({ initialIncidents, initialTotal, residents }: Props) {
  const { can } = useUser();
  const { toast } = useToast();
  const [list, setList] = useState<Incident[]>(initialIncidents);
  const [total] = useState(initialTotal);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");

  function handleCreated(i: Incident) {
    setList((prev) => [i, ...prev]);
    setShowCreate(false);
    toast("Incident reported.");
  }

  function handleUpdated(i: Incident) {
    setList((prev) => prev.map((x) => x.id === i.id ? i : x));
    setSelected(i);
  }

  const filtered = list.filter((i) =>
    (!filterSeverity || i.severity === filterSeverity) &&
    (!filterStatus || i.status === filterStatus) &&
    (!filterType || i.incident_type === filterType)
  );

  const openCount = list.filter((i) => i.status === "open").length;
  const criticalCount = list.filter((i) => i.severity === "critical").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle size={22} style={{ color: "#ef4444" }} /> Incidents
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {openCount} open · {criticalCount} critical
          </p>
        </div>
        {can("incidents.create") && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold rounded-xl text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
            <Plus size={15} /> <span className="hidden sm:inline">Report Incident</span><span className="sm:hidden">Report</span>
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: total, color: "var(--c-teal)" },
          { label: "Open", value: openCount, color: "var(--c-red)" },
          { label: "Critical", value: criticalCount, color: "#ef4444" },
          { label: "Closed", value: list.filter((i) => i.status === "closed").length, color: "var(--c-green)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="px-4 py-3 rounded-2xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "All Severity", key: "sev", value: filterSeverity, set: setFilterSeverity, opts: ["low","medium","high","critical"] },
          { label: "All Status", key: "st", value: filterStatus, set: setFilterStatus, opts: ["open","under_review","closed"] },
          { label: "All Types", key: "ty", value: filterType, set: setFilterType, opts: Object.keys(TYPE_LABELS) },
        ].map(({ label, key, value, set, opts }) => (
          <select key={key} value={value} onChange={(e) => set(e.target.value)}
            className="text-sm px-3 py-2 rounded-xl outline-none cursor-pointer"
            style={{ background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: value ? "white" : "var(--text-muted)" }}>
            <option value="">{label}</option>
            {opts.map((o) => <option key={o} value={o}>{TYPE_LABELS[o] ?? o.replace("_", " ")}</option>)}
          </select>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
              {["Type", "Resident", "Severity", "Status", "Date", "Reported By", ""].map((h) => (
                <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-3"
                  style={{ color: "var(--text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody style={{ background: "var(--bg-primary)" }}>
            {filtered.length === 0 ? (
              <tr><td colSpan={7}><EmptyState icon={AlertTriangle} title="No incidents found" description="All incident reports will appear here." action={{ label: "Log Incident", onClick: () => setShowCreate(true) }} /></td></tr>
            ) : filtered.map((inc) => {
              const st = STATUS[inc.status as keyof typeof STATUS] ?? STATUS.open;
              return (
                <tr key={inc.id} className="transition-all" style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(var(--fg-rgb),0.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-white">{TYPE_LABELS[inc.incident_type]}</span>
                    {inc.injury_sustained && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.12)", color: "var(--c-red)" }}>Injury</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                    {inc.resident_name ?? <span style={{ color: "var(--text-muted)" }}>—</span>}
                  </td>
                  <td className="px-4 py-3"><SeverityBadge level={inc.severity} /></td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                    {new Date(inc.incident_date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                    {inc.reported_by_name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(inc)}
                      className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg"
                      style={{ background: "rgba(13, 148, 136,0.12)", color: "var(--c-teal)", border: "1px solid rgba(13, 148, 136,0.2)" }}>
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateIncidentModal
          residents={residents}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
      {selected && (
        <IncidentDetail
          incident={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdated}
        />
      )}
    </div>
  );
}
