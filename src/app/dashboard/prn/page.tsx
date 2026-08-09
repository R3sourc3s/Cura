"use client";

import { useEffect, useState, useCallback } from "react";
import { Pill, Plus, X, Clock, CheckCircle, AlertTriangle, ChevronDown } from "lucide-react";
import { useToast } from "@/components/Toast";
import VoiceInputButton from "@/components/ui/VoiceInputButton";

interface Resident { id: number; full_name: string; room_number?: string; }

interface PRNProtocol {
  id: number;
  medication: number;
  drug_name?: string;
  indication: string;
  max_dose_per_24h: string;
  min_interval_hours: number;
  effectiveness_criteria: string;
}

interface PRNAdmin {
  id: number;
  medication: number;
  drug_name?: string;
  administered_at: string;
  administered_by_name?: string;
  reason: string;
  dose_given: string;
  effectiveness: "effective" | "partial" | "ineffective" | "unknown";
  effectiveness_notes: string;
}

interface Medication { id: number; drug_name: string; frequency: string; prn_protocol: PRNProtocol | null; resident: number; }

const EFFECT_CFG = {
  effective:   { label: "Effective",    color: "var(--c-green)", bg: "rgba(52,211,153,0.15)" },
  partial:     { label: "Partial",      color: "var(--c-amber)", bg: "rgba(251,191,36,0.15)" },
  ineffective: { label: "Ineffective",  color: "var(--c-red)", bg: "rgba(239,68,68,0.15)" },
  unknown:     { label: "Unknown",      color: "#6b7280", bg: "rgba(107,114,128,0.15)" },
};

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (d < 2) return "just now";
  if (d < 60) return `${d}m ago`;
  if (d < 1440) return `${Math.floor(d/60)}h ago`;
  return `${Math.floor(d/1440)}d ago`;
}

export default function PRNPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [residentId, setResidentId] = useState<number | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [administrations, setAdministrations] = useState<PRNAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    medication: "",
    reason: "",
    dose_given: "",
    effectiveness: "unknown" as PRNAdmin["effectiveness"],
    effectiveness_notes: "",
  });

  useEffect(() => {
    fetch("/api/v1/residents/?is_active=true&page_size=50&ordering=full_name", { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setResidents(d.results ?? d));
  }, []);

  const load = useCallback(() => {
    if (!residentId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/v1/medications/?resident=${residentId}&is_active=true&page_size=50`, { credentials: "include" }).then(r => r.json()),
      fetch(`/api/v1/medications/prn-administrations/?resident=${residentId}&ordering=-administered_at&page_size=50`, { credentials: "include" }).then(r => r.json()),
    ]).then(([meds, admins]) => {
      const medList: Medication[] = meds.results ?? meds;
      setMedications(medList.filter((m: Medication) => m.prn_protocol !== null));
      setAdministrations(admins.results ?? admins);
    }).finally(() => setLoading(false));
  }, [residentId]);

  useEffect(() => { load(); }, [load]);

  const prnMeds = medications;
  const selectedMed = prnMeds.find(m => m.id === parseInt(form.medication));

  async function submit() {
    if (!form.medication || !form.reason || !form.dose_given) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/medications/prn-administrations/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medication: parseInt(form.medication),
          reason: form.reason,
          dose_given: form.dose_given,
          effectiveness: form.effectiveness,
          effectiveness_notes: form.effectiveness_notes,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ medication: "", reason: "", dose_given: "", effectiveness: "unknown", effectiveness_notes: "" });
        load();
        toast("PRN administration recorded.", "success");
      } else { toast("Could not record PRN.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.2)" }}>
            <Pill size={18} style={{ color: "var(--c-green)" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">PRN Medications</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>As-needed medication administration log</p>
          </div>
        </div>
        {residentId && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{ background: "rgba(52,211,153,0.15)", color: "var(--c-green)", border: "1px solid rgba(52,211,153,0.25)" }}>
            <Plus size={14} /> Log Administration
          </button>
        )}
      </div>

      {/* Resident selector */}
      <div className="rounded-2xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <label className="text-xs mb-2 block" style={{ color: "var(--text-muted)" }}>Select Resident</label>
        <div className="relative">
          <select value={residentId ?? ""} onChange={e => setResidentId(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full text-sm px-3 py-2.5 rounded-xl appearance-none outline-none pr-8"
            style={{ background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }}>
            <option value="">Choose a resident…</option>
            {residents.map(r => <option key={r.id} value={r.id} style={{ background: "var(--bg-elevated)" }}>{r.full_name}{r.room_number ? ` · Room ${r.room_number}` : ""}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
        </div>
      </div>

      {residentId && (
        <>
          {/* PRN Protocols */}
          {prnMeds.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Available PRN Medications</div>
              <div className="grid sm:grid-cols-2 gap-3">
                {prnMeds.map(m => {
                  const p = m.prn_protocol!;
                  const recentAdmins = administrations.filter(a => a.medication === m.id);
                  const lastAdmin = recentAdmins[0];
                  const hoursSinceLast = lastAdmin
                    ? (Date.now() - new Date(lastAdmin.administered_at).getTime()) / 3600000
                    : Infinity;
                  const canGive = hoursSinceLast >= p.min_interval_hours;
                  return (
                    <div key={m.id} className="rounded-2xl p-4" style={{ background: "rgba(var(--fg-rgb),0.02)", border: `1px solid ${canGive ? "rgba(52,211,153,0.15)" : "rgba(251,191,36,0.15)"}` }}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold text-white">{m.drug_name}</div>
                          <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{p.indication}</div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1"
                          style={{ background: canGive ? "rgba(52,211,153,0.15)" : "rgba(251,191,36,0.15)", color: canGive ? "var(--c-green)" : "var(--c-amber)" }}>
                          {canGive ? <CheckCircle size={10} /> : <Clock size={10} />}
                          {canGive ? "Can give" : `Wait ${Math.ceil(p.min_interval_hours - hoursSinceLast)}h`}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg px-2 py-1.5" style={{ background: "rgba(var(--fg-rgb),0.04)" }}>
                          <div style={{ color: "rgba(var(--fg-rgb),0.35)" }}>Max dose / 24h</div>
                          <div className="font-medium text-white mt-0.5">{p.max_dose_per_24h}</div>
                        </div>
                        <div className="rounded-lg px-2 py-1.5" style={{ background: "rgba(var(--fg-rgb),0.04)" }}>
                          <div style={{ color: "rgba(var(--fg-rgb),0.35)" }}>Min interval</div>
                          <div className="font-medium text-white mt-0.5">{p.min_interval_hours}h</div>
                        </div>
                      </div>
                      {lastAdmin && (
                        <div className="mt-2 text-xs" style={{ color: "rgba(var(--fg-rgb),0.3)" }}>
                          Last given {timeAgo(lastAdmin.administered_at)} · {recentAdmins.length} times today
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Administration log */}
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div>
          ) : (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(var(--fg-rgb),0.35)" }}>Administration History</div>
              {administrations.length === 0 ? (
                <div className="text-center py-10 rounded-2xl" style={{ background: "rgba(var(--fg-rgb),0.02)", border: "1px solid rgba(var(--fg-rgb),0.06)" }}>
                  <Pill size={24} className="mx-auto mb-2" style={{ color: "rgba(var(--fg-rgb),0.15)" }} />
                  <p className="text-sm" style={{ color: "rgba(var(--fg-rgb),0.3)" }}>No PRN administrations recorded.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {administrations.map(a => {
                    const eff = EFFECT_CFG[a.effectiveness] ?? EFFECT_CFG.unknown;
                    return (
                      <div key={a.id} className="rounded-2xl px-4 py-3 flex items-start gap-3" style={{ background: "rgba(var(--fg-rgb),0.02)", border: "1px solid rgba(var(--fg-rgb),0.07)" }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(52,211,153,0.12)" }}>
                          <Pill size={13} style={{ color: "var(--c-green)" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white">{a.drug_name ?? "Medication"}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: eff.bg, color: eff.color }}>{eff.label}</span>
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: "rgba(var(--fg-rgb),0.45)" }}>{a.reason} · {a.dose_given}</div>
                          {a.effectiveness_notes && <div className="text-xs mt-1" style={{ color: "rgba(var(--fg-rgb),0.35)" }}>{a.effectiveness_notes}</div>}
                          <div className="text-xs mt-1" style={{ color: "rgba(var(--fg-rgb),0.25)" }}>
                            {a.administered_by_name} · {timeAgo(a.administered_at)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Log form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }} onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-2xl p-5 space-y-4" style={{ background: "var(--bg-elevated)", border: "1px solid rgba(var(--fg-rgb),0.1)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Log PRN Administration</span>
              <button onClick={() => setShowForm(false)}><X size={14} style={{ color: "rgba(var(--fg-rgb),0.4)" }} /></button>
            </div>

            <div>
              <label className="text-xs mb-1.5 block" style={{ color: "rgba(var(--fg-rgb),0.4)" }}>Medication *</label>
              <div className="relative">
                <select value={form.medication} onChange={e => setForm(f => ({ ...f, medication: e.target.value }))}
                  className="w-full text-sm px-3 py-2.5 rounded-xl appearance-none outline-none pr-8"
                  style={{ background: "rgba(var(--fg-rgb),0.06)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}>
                  <option value="">Select PRN medication…</option>
                  {prnMeds.map(m => <option key={m.id} value={m.id} style={{ background: "var(--bg-elevated)" }}>{m.drug_name}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(var(--fg-rgb),0.3)" }} />
              </div>
            </div>

            {selectedMed?.prn_protocol && (
              <div className="rounded-xl p-3 text-xs" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)" }}>
                <div style={{ color: "var(--c-green)" }}>Protocol: {selectedMed.prn_protocol.indication}</div>
                <div className="mt-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>Max: {selectedMed.prn_protocol.max_dose_per_24h} · Interval: {selectedMed.prn_protocol.min_interval_hours}h</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "rgba(var(--fg-rgb),0.4)" }}>Dose given *</label>
                <input value={form.dose_given} onChange={e => setForm(f => ({ ...f, dose_given: e.target.value }))}
                  placeholder="e.g. 500mg"
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none"
                  style={{ background: "rgba(var(--fg-rgb),0.06)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }} />
              </div>
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "rgba(var(--fg-rgb),0.4)" }}>Effectiveness</label>
                <div className="relative">
                  <select value={form.effectiveness} onChange={e => setForm(f => ({ ...f, effectiveness: e.target.value as PRNAdmin["effectiveness"] }))}
                    className="w-full text-sm px-3 py-2 rounded-xl appearance-none outline-none pr-8"
                    style={{ background: "rgba(var(--fg-rgb),0.06)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}>
                    {Object.entries(EFFECT_CFG).map(([v, c]) => <option key={v} value={v} style={{ background: "var(--bg-elevated)" }}>{c.label}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(var(--fg-rgb),0.3)" }} />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs block" style={{ color: "rgba(var(--fg-rgb),0.4)" }}>Reason *</label>
                <VoiceInputButton onTranscript={t => setForm(f => ({ ...f, reason: (f.reason ? f.reason + " " : "") + t }))} title="Dictate reason" />
              </div>
              <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                placeholder="Why was the PRN given? (or use the mic to dictate)"
                rows={2}
                className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none"
                style={{ background: "rgba(var(--fg-rgb),0.06)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs block" style={{ color: "rgba(var(--fg-rgb),0.4)" }}>Effectiveness notes</label>
                <VoiceInputButton onTranscript={t => setForm(f => ({ ...f, effectiveness_notes: (f.effectiveness_notes ? f.effectiveness_notes + " " : "") + t }))} title="Dictate notes" />
              </div>
              <input value={form.effectiveness_notes} onChange={e => setForm(f => ({ ...f, effectiveness_notes: e.target.value }))}
                placeholder="How did the resident respond?"
                className="w-full text-sm px-3 py-2 rounded-xl outline-none"
                style={{ background: "rgba(var(--fg-rgb),0.06)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }} />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm" style={{ background: "rgba(var(--fg-rgb),0.05)", color: "rgba(var(--fg-rgb),0.5)" }}>Cancel</button>
              <button onClick={submit} disabled={saving || !form.medication || !form.reason || !form.dose_given}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: "linear-gradient(135deg,#0d9488,#10b981)", color: "#fff" }}>
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
