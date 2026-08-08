"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { residents as residentsApi, ai as aiApi, vitals as vitalsApi } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import type { Resident, Medication, CarePlan, MAREntry, VitalSign } from "@/types";
import {
  Edit2, Trash2, User, Phone, Heart, Pill,
  ClipboardList, AlertTriangle, CheckCircle, Clock, XCircle,
  Activity, Shield, ChevronRight, Sparkles, Plus, Thermometer,
  NotebookPen, CalendarDays, X, FolderOpen,
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LinkedDocuments from "@/components/documents/LinkedDocuments";

// ── helpers ──────────────────────────────────────────────────────────────────

const RISK_STYLE = {
  critical: { bg: "rgba(239,68,68,0.15)", text: "var(--c-red)", dot: "#ef4444" },
  high:     { bg: "rgba(251,146,60,0.15)", text: "var(--c-orange)", dot: "#f97316" },
  medium:   { bg: "rgba(250,204,21,0.12)", text: "var(--c-amber)", dot: "#eab308" },
  low:      { bg: "rgba(52,211,153,0.12)",  text: "var(--c-green)", dot: "#10b981" },
} as const;

const STATUS_CFG = {
  given:   { icon: CheckCircle, color: "var(--c-green)", bg: "rgba(52,211,153,0.12)",  label: "Given" },
  pending: { icon: Clock,       color: "var(--c-orange)", bg: "rgba(251,146,60,0.12)",  label: "Pending" },
  refused: { icon: XCircle,     color: "var(--c-red)", bg: "rgba(239,68,68,0.12)",   label: "Refused" },
  omitted: { icon: XCircle,     color: "var(--c-teal)", bg: "rgba(13, 148, 136,0.12)",  label: "Omitted" },
} as const;

const PLAN_STATUS = {
  active:       { color: "var(--c-green)", bg: "rgba(52,211,153,0.12)",  label: "Active" },
  draft:        { color: "var(--c-orange)", bg: "rgba(251,146,60,0.12)",  label: "Draft" },
  under_review: { color: "var(--c-teal2)", bg: "rgba(45, 212, 191,0.12)",  label: "Under Review" },
  archived:     { color: "#6b7280", bg: "rgba(107,114,128,0.12)", label: "Archived" },
} as const;

function RiskBadge({ level }: { level: string }) {
  const s = RISK_STYLE[level as keyof typeof RISK_STYLE] ?? RISK_STYLE.low;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium capitalize"
      style={{ background: s.bg, color: s.text }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {level}
    </span>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`}
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-strong)" }}>
      {children}
    </div>
  );
}

function SectionHeading({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={14} style={{ color: "#0d9488" }} />
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-start justify-between py-2.5"
      style={{ borderBottom: "1px solid var(--border)" }}>
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
      <span className="text-xs font-medium text-right ml-4" style={{ color: "var(--text-primary)" }}>
        {value ?? "—"}
      </span>
    </div>
  );
}

function Avatar({ resident, size = 80 }: { resident: Resident; size?: number }) {
  if (resident.photo) {
    return (
      <img src={resident.photo} alt={resident.full_name}
        className="rounded-2xl object-cover flex-shrink-0"
        style={{ width: size, height: size }} />
    );
  }
  const initials = [resident.first_name[0], resident.last_name[0]].join("").toUpperCase();
  const hue = (resident.id * 47) % 360;
  return (
    <div className="rounded-2xl flex items-center justify-center flex-shrink-0 font-bold"
      style={{
        width: size, height: size, fontSize: size * 0.32,
        background: `linear-gradient(135deg, hsl(${hue},60%,35%), hsl(${(hue + 40) % 360},70%,45%))`,
        color: "var(--text-primary)",
      }}>
      {initials}
    </div>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────────

function Sparkline({ values, color = "#0d9488", height = 32 }: { values: number[]; color?: string; height?: number }) {
  if (values.length < 2) return <div className="text-xs" style={{ color: "var(--text-muted)" }}>—</div>;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 80;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => `${i * step},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={height} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(values.length - 1) * step} cy={height - ((values[values.length - 1] - min) / range) * (height - 4) - 2} r="2.5" fill={color} />
    </svg>
  );
}

// ── Vitals Tab ────────────────────────────────────────────────────────────────

const VITAL_FIELDS: { key: keyof VitalSign; label: string; unit: string; color: string; normal?: string }[] = [
  { key: "bp_systolic",       label: "Systolic BP",  unit: "mmHg", color: "var(--c-red)", normal: "90–120" },
  { key: "bp_diastolic",      label: "Diastolic BP", unit: "mmHg", color: "var(--c-orange)", normal: "60–80" },
  { key: "pulse",             label: "Pulse",        unit: "bpm",  color: "var(--c-green)", normal: "60–100" },
  { key: "temperature",       label: "Temperature",  unit: "°C",   color: "var(--c-amber)", normal: "36.1–37.2" },
  { key: "oxygen_saturation", label: "SpO₂",         unit: "%",    color: "var(--c-teal2)", normal: "95–100" },
  { key: "weight",            label: "Weight",       unit: "kg",   color: "var(--c-teal)" },
  { key: "blood_glucose",     label: "Glucose",      unit: "mmol/L", color: "#f472b6", normal: "4–7" },
];

function VitalsTab({ residentId, canEdit }: { residentId: number; canEdit: boolean }) {
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({ recorded_at: new Date().toISOString().slice(0, 16) });

  useEffect(() => {
    vitalsApi.list(residentId)
      .then(setVitals)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [residentId]);

  async function handleSave() {
    setSaving(true);
    try {
      const payload: Record<string, string | number> = {
        resident: residentId,
        recorded_at: form.recorded_at,
      };
      VITAL_FIELDS.forEach(({ key }) => {
        const v = form[key as string];
        if (v !== "" && v !== undefined) payload[key as string] = Number(v);
      });
      if (form.notes) payload.notes = form.notes;
      const created = await vitalsApi.create(payload as Partial<VitalSign>);
      setVitals(prev => [created, ...prev]);
      setShowForm(false);
      setForm({ recorded_at: new Date().toISOString().slice(0, 16) });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div>;

  const latest = vitals[0];

  return (
    <div className="space-y-4">
      {/* Sparkline summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {VITAL_FIELDS.map(({ key, label, unit, color, normal }) => {
          const vals = vitals.map(v => Number(v[key])).filter(n => !isNaN(n) && n > 0);
          const latestVal = latest ? Number(latest[key]) : null;
          return (
            <GlassCard key={key as string} className="!p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{label}</div>
                  {normal && <div className="text-xs" style={{ color: "var(--text-muted)" }}>Normal: {normal}</div>}
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xl font-bold" style={{ color: latestVal ? color : "var(--text-muted)" }}>
                    {latestVal ? latestVal : "—"}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{unit}</div>
                </div>
                <Sparkline values={vals.slice(0, 10).reverse()} color={color} />
              </div>
            </GlassCard>
          );
        })}
        {canEdit && (
          <button onClick={() => setShowForm(true)}
            className="rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all"
            style={{ background: "rgba(13, 148, 136,0.05)", border: "1px dashed rgba(13, 148, 136,0.3)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(13, 148, 136,0.1)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(13, 148, 136,0.05)")}>
            <Plus size={20} style={{ color: "#0d9488" }} />
            <span className="text-xs font-medium" style={{ color: "var(--c-teal)" }}>Log Vitals</span>
          </button>
        )}
      </div>

      {/* History table */}
      {vitals.length > 0 && (
        <GlassCard className="!p-0 overflow-hidden">
          <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>History</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-2.5" style={{ color: "var(--text-muted)" }}>Date</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-2.5" style={{ color: "var(--text-muted)" }}>BP</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-2.5" style={{ color: "var(--text-muted)" }}>Pulse</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-2.5" style={{ color: "var(--text-muted)" }}>Temp</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-2.5" style={{ color: "var(--text-muted)" }}>SpO₂</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-2.5" style={{ color: "var(--text-muted)" }}>Weight</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-2.5" style={{ color: "var(--text-muted)" }}>Glucose</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-2.5" style={{ color: "var(--text-muted)" }}>By</th>
                </tr>
              </thead>
              <tbody>
                {vitals.slice(0, 20).map(v => (
                  <tr key={v.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="px-4 py-2.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                      {new Date(v.recorded_at).toLocaleDateString("en-GB")}{" "}
                      <span style={{ color: "var(--text-muted)" }}>{new Date(v.recorded_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-mono" style={{ color: "var(--text-primary)" }}>
                      {v.bp_systolic && v.bp_diastolic ? `${v.bp_systolic}/${v.bp_diastolic}` : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-mono" style={{ color: "var(--text-primary)" }}>{v.pulse ?? "—"}</td>
                    <td className="px-4 py-2.5 text-xs font-mono" style={{ color: "var(--text-primary)" }}>{v.temperature ? `${v.temperature}°C` : "—"}</td>
                    <td className="px-4 py-2.5 text-xs font-mono" style={{ color: "var(--text-primary)" }}>{v.oxygen_saturation ? `${v.oxygen_saturation}%` : "—"}</td>
                    <td className="px-4 py-2.5 text-xs font-mono" style={{ color: "var(--text-primary)" }}>{v.weight ? `${v.weight} kg` : "—"}</td>
                    <td className="px-4 py-2.5 text-xs font-mono" style={{ color: "var(--text-primary)" }}>{v.blood_glucose ? `${v.blood_glucose}` : "—"}</td>
                    <td className="px-4 py-2.5 text-xs" style={{ color: "var(--text-muted)" }}>{v.recorded_by_name ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {vitals.length === 0 && !showForm && (
        <div className="text-center py-12 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <Thermometer size={28} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No vitals recorded yet.</p>
        </div>
      )}

      {/* Log form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-lg"
            style={{ background: "var(--bg-elevated)", border: "1px solid rgba(13, 148, 136,0.25)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Log Vitals</h3>
              <button onClick={() => setShowForm(false)} style={{ color: "var(--text-muted)" }}><XCircle size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="col-span-2">
                <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Date & Time *</label>
                <input type="datetime-local" value={form.recorded_at ?? ""}
                  onChange={e => setForm(f => ({ ...f, recorded_at: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none"
                  style={{ background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }} />
              </div>
              {VITAL_FIELDS.map(({ key, label, unit }) => (
                <div key={key as string}>
                  <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>{label} <span style={{ color: "var(--text-muted)" }}>({unit})</span></label>
                  <input type="number" step="any" placeholder="—"
                    value={form[key as string] ?? ""}
                    onChange={e => setForm(f => ({ ...f, [key as string]: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none"
                    style={{ background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }} />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Notes</label>
                <textarea rows={2} placeholder="Any observations…"
                  value={form.notes ?? ""}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none"
                  style={{ background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
                style={{ background: "var(--border)", color: "var(--text-primary)", border: "1px solid var(--border-strong)" }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || !form.recorded_at}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
                style={{ background: "#0d9488" }}>
                {saving ? "Saving…" : "Save Vitals"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = "overview" | "medications" | "care-plans" | "mar" | "vitals" | "care-notes" | "appointments" | "documents";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview",     label: "Overview",     icon: User },
  { id: "medications",  label: "Medications",  icon: Pill },
  { id: "care-plans",   label: "Care Plans",   icon: ClipboardList },
  { id: "care-notes",   label: "Care Notes",   icon: NotebookPen },
  { id: "appointments", label: "Appointments", icon: CalendarDays },
  { id: "documents",    label: "Documents",    icon: FolderOpen },
  { id: "mar",          label: "MAR History",  icon: Activity },
  { id: "vitals",       label: "Vitals",       icon: Thermometer },
];

// ── Sub-views ─────────────────────────────────────────────────────────────────

function OverviewTab({ resident, onRiskScoreUpdate, canRecalculate }: { resident: Resident; onRiskScoreUpdate: (score: number) => void; canRecalculate: boolean }) {
  const [riskScore, setRiskScore] = useState(resident.ai_risk_score);
  const [scoringLoading, setScoringLoading] = useState(false);
  const [scoringReason, setScoringReason] = useState("");
  const scoreColor = riskScore >= 80 ? "#ef4444" : riskScore >= 60 ? "#f97316" : riskScore >= 40 ? "#eab308" : "#10b981";

  async function recalculateRisk() {
    setScoringLoading(true);
    try {
      const result = await aiApi.riskScore(resident.id);
      setRiskScore(result.risk_score);
      setScoringReason(result.reasoning);
      onRiskScoreUpdate(result.risk_score);
    } catch (e) {
      console.error(e);
    } finally {
      setScoringLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Personal Info */}
      <GlassCard>
        <SectionHeading icon={User} label="Personal Information" />
        <InfoRow label="Date of Birth" value={resident.date_of_birth ? new Date(resident.date_of_birth).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null} />
        <InfoRow label="Age" value={`${resident.age} years`} />
        <InfoRow label="NHS Number" value={resident.nhs_number} />
        <InfoRow label="Room" value={resident.room_number} />
        <InfoRow label="Admitted" value={resident.admission_date ? new Date(resident.admission_date).toLocaleDateString("en-GB") : null} />
        {resident.discharge_date && (
          <InfoRow label="Discharged" value={new Date(resident.discharge_date).toLocaleDateString("en-GB")} />
        )}
        <InfoRow label="Status" value={resident.is_active ? "Active Resident" : "Discharged"} />
      </GlassCard>

      {/* Contacts */}
      <GlassCard>
        <SectionHeading icon={Phone} label="Key Contacts" />
        <div className="space-y-3">
          <div>
            <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Next of Kin</div>
            <div className="text-sm font-medium text-white">{resident.next_of_kin_name || "—"}</div>
            {resident.next_of_kin_phone && (
              <a href={`tel:${resident.next_of_kin_phone}`}
                className="text-xs mt-0.5 block hover:underline" style={{ color: "var(--c-teal2)" }}>
                {resident.next_of_kin_phone}
              </a>
            )}
          </div>
          <div className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>GP / Medical</div>
            <div className="text-sm font-medium text-white">{resident.gp_name || "—"}</div>
            {resident.gp_phone && (
              <a href={`tel:${resident.gp_phone}`}
                className="text-xs mt-0.5 block hover:underline" style={{ color: "var(--c-teal2)" }}>
                {resident.gp_phone}
              </a>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Risk Assessment */}
      <GlassCard>
        <SectionHeading icon={Shield} label="Risk Assessment" />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Fall Risk</span>
            <RiskBadge level={resident.fall_risk} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Pressure Ulcer Risk</span>
            <RiskBadge level={resident.pressure_ulcer_risk} />
          </div>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>AI Risk Score</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold" style={{ color: scoreColor }}>{riskScore}/100</span>
                {canRecalculate && (
                  <button onClick={recalculateRisk} disabled={scoringLoading}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg disabled:opacity-40"
                    style={{ background: "rgba(13, 148, 136,0.12)", color: "var(--c-teal)", border: "1px solid rgba(13, 148, 136,0.2)" }}>
                    <Sparkles size={10} />{scoringLoading ? "…" : "Recalculate"}
                  </button>
                )}
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${riskScore}%`, background: `linear-gradient(90deg, ${scoreColor}88, ${scoreColor})` }} />
            </div>
            {scoringReason && (
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>{scoringReason}</p>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Conditions */}
      <GlassCard>
        <SectionHeading icon={Heart} label="Diagnoses & Conditions" />
        {(resident.conditions ?? []).length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No conditions recorded.</p>
        ) : (
          <div className="space-y-2">
            {resident.conditions!.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2"
                style={{ borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div className="text-sm font-medium text-white">{c.name}</div>
                  {c.diagnosed_date && (
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      Diagnosed {new Date(c.diagnosed_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                    </div>
                  )}
                </div>
                {c.icd_code && (
                  <span className="text-xs px-1.5 py-0.5 rounded font-mono ml-3"
                    style={{ background: "rgba(13, 148, 136,0.12)", color: "var(--c-teal)" }}>
                    {c.icd_code}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function MedicationsTab({ residentId }: { residentId: number }) {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    residentsApi.medications(residentId)
      .then((d) => setMeds(d.results))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [residentId]);

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div>;

  if (meds.length === 0) return (
    <div className="text-center py-12 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <Pill size={28} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>No active medications.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {meds.map((med) => (
        <GlassCard key={med.id}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-white">{med.drug_name}</span>
                {med.is_controlled && (
                  <span className="text-xs px-1.5 py-0.5 rounded font-semibold"
                    style={{ background: "rgba(13, 148, 136,0.15)", color: "var(--c-teal)" }}>CD</span>
                )}
                {med.is_low_stock && (
                  <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(239,68,68,0.12)", color: "var(--c-red)" }}>
                    <AlertTriangle size={10} /> Low stock
                  </span>
                )}
              </div>
              <div className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                {med.dose} · {med.route} · {med.frequency.toUpperCase()}
                {med.indication ? ` · ${med.indication}` : ""}
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                <InfoRow label="Prescribed by" value={med.prescribed_by} />
                <InfoRow label="Started" value={new Date(med.start_date).toLocaleDateString("en-GB")} />
                <InfoRow label="Stock" value={`${med.stock_count} units`} />
                {med.end_date && <InfoRow label="Ends" value={new Date(med.end_date).toLocaleDateString("en-GB")} />}
              </div>
            </div>
            <div className="ml-4 text-right">
              <div className="text-lg font-bold" style={{ color: med.is_low_stock ? "var(--c-red)" : "var(--c-green)" }}>
                {med.stock_count}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>units</div>
              <div className="w-16 mt-2">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-card-hover)" }}>
                  <div className="h-full rounded-full"
                    style={{
                      width: `${Math.min((med.stock_count / Math.max(med.reorder_threshold * 4, 1)) * 100, 100)}%`,
                      background: med.is_low_stock ? "#ef4444" : "var(--c-green)",
                    }} />
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function CarePlansTab({ residentId }: { residentId: number }) {
  const [plans, setPlans] = useState<CarePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    residentsApi.carePlans(residentId)
      .then((d) => setPlans(d.results))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [residentId]);

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div>;
  if (plans.length === 0) return (
    <div className="text-center py-12 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <ClipboardList size={28} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>No care plans recorded.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {plans.map((plan) => {
        const cfg = PLAN_STATUS[plan.status] ?? PLAN_STATUS.draft;
        const isOpen = open === plan.id;
        return (
          <GlassCard key={plan.id} className="!p-0">
            <button className="w-full flex items-center justify-between px-5 py-4 text-left"
              onClick={() => setOpen(isOpen ? null : plan.id)}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ background: cfg.bg, color: cfg.color }}>v{plan.version}</div>
                <div>
                  <div className="text-sm font-semibold text-white">Care Plan v{plan.version}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {plan.created_by_name && `Created by ${plan.created_by_name} · `}
                    {plan.next_review_date && `Review: ${new Date(plan.next_review_date).toLocaleDateString("en-GB")}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                <ChevronRight size={14} style={{ color: "var(--text-muted)", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
              </div>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
                {plan.ai_summary && (
                  <div className="mt-3 px-3 py-2.5 rounded-xl text-xs leading-relaxed"
                    style={{ background: "rgba(13, 148, 136,0.08)", color: "rgba(var(--fg-rgb),0.6)", border: "1px solid rgba(13, 148, 136,0.15)" }}>
                    {plan.ai_summary}
                  </div>
                )}
                {(plan.sections ?? []).map((sec) => {
                  const sRisk = RISK_STYLE[sec.risk_level as keyof typeof RISK_STYLE] ?? RISK_STYLE.low;
                  return (
                    <div key={sec.id} className="rounded-xl px-4 py-3"
                      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-white">{sec.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                          style={{ background: sRisk.bg, color: sRisk.text }}>{sec.risk_level}</span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                        {sec.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        );
      })}
    </div>
  );
}

function MARTab({ residentId }: { residentId: number }) {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    residentsApi.medications(residentId)
      .then((d) => setMeds(d.results))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [residentId]);

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div>;

  const allMAR = meds.flatMap((m) =>
    (m.recent_mar ?? []).map((e) => ({ ...e, drugName: m.drug_name, dose: m.dose }))
  ).sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());

  if (allMAR.length === 0) return (
    <div className="text-center py-12 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <Activity size={28} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>No MAR entries found.</p>
    </div>
  );

  return (
    <div className="rounded-2xl overflow-hidden overflow-x-auto" style={{ border: "1px solid var(--border)" }}>
      <table className="w-full min-w-[560px]">
        <thead>
          <tr style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
            {["Medication", "Scheduled", "Status", "Administered by", "Notes"].map((h) => (
              <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-3"
                style={{ color: "var(--text-muted)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody style={{ background: "var(--bg-primary)" }}>
          {allMAR.slice(0, 50).map((entry) => {
            const cfg = STATUS_CFG[entry.status] ?? STATUS_CFG.pending;
            const Icon = cfg.icon;
            return (
              <tr key={entry.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-white">{entry.drugName}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{entry.dose}</div>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                  {new Date(entry.scheduled_at).toLocaleDateString("en-GB")}{" "}
                  <span style={{ color: "var(--text-muted)" }}>
                    {new Date(entry.scheduled_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium"
                    style={{ background: cfg.bg, color: cfg.color }}>
                    <Icon size={10} />{cfg.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                  {entry.administered_by_name ?? "—"}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                  {entry.notes || "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Care Notes Tab ────────────────────────────────────────────────────────────

const SHIFT_LABEL: Record<string, string> = { day:"Day", evening:"Evening", night:"Night" };
const NOTE_CAT_LABEL: Record<string, string> = { personal_care:"Personal Care", nutrition:"Nutrition", mobility:"Mobility", mood:"Mood", sleep:"Sleep", health:"Health", social:"Social", general:"General" };
const MOOD_EMOJI: Record<string, string> = { happy:"😊", calm:"😌", anxious:"😟", confused:"😕", distressed:"😢", agitated:"😤", unresponsive:"😶" };
const NOTE_SHIFT_COLOR: Record<string, string> = { day:"var(--c-amber)", evening:"var(--c-teal2)", night:"var(--c-teal)" };

function CareNotesTab({ residentId }: { residentId: number }) {
  const [notes, setNotes] = useState<Array<{id:number;shift:string;category:string;mood?:string;content:string;recorded_at:string;author_name?:string}>>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ shift:"day", category:"general", mood:"", content:"" });
  const inputSt = { background:"var(--input-bg)", border:"1px solid var(--border-strong)", color:"var(--text-primary)" };

  useEffect(() => {
    fetch(`/api/v1/care-notes/?resident=${residentId}&ordering=-recorded_at&page_size=30`, { credentials:"include" })
      .then(r => r.ok ? r.json() : { results:[] })
      .then(d => setNotes(d.results ?? d))
      .catch(console.error).finally(() => setLoading(false));
  }, [residentId]);

  async function handleSave() {
    if (!form.content) return;
    setSaving(true);
    try {
      const body = { resident: residentId, shift: form.shift, category: form.category, mood: form.mood || null, content: form.content };
      const res = await fetch("/api/v1/care-notes/", { method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
      if (res.ok) { const n = await res.json(); setNotes(p => [n, ...p]); setShowForm(false); setForm({ shift:"day", category:"general", mood:"", content:"" }); }
    } finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div>;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white" style={{ background:"linear-gradient(135deg,#0d9488,#10b981)" }}><Plus size={14} /> Add Note</button>
      </div>
      {notes.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ background:"var(--bg-card)", border:"1px solid var(--border)" }}>
          <NotebookPen size={28} className="mx-auto mb-2" style={{ color:"var(--text-muted)" }} />
          <p className="text-sm" style={{ color:"var(--text-muted)" }}>No care notes recorded.</p>
        </div>
      ) : notes.map(note => (
        <div key={note.id} className="rounded-2xl p-4" style={{ background:"var(--bg-card)", border:"1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ background:`${NOTE_SHIFT_COLOR[note.shift]}22`, color:NOTE_SHIFT_COLOR[note.shift] }}>{SHIFT_LABEL[note.shift] ?? note.shift}</span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ background:"var(--border)", color:"var(--text-muted)" }}>{NOTE_CAT_LABEL[note.category] ?? note.category}</span>
            {note.mood && <span className="text-xs">{MOOD_EMOJI[note.mood] ?? ""} {note.mood}</span>}
            <span className="text-xs ml-auto" style={{ color:"var(--text-muted)" }}>{new Date(note.recorded_at).toLocaleDateString("en-GB")} · {note.author_name ?? "—"}</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color:"var(--text-primary)" }}>{note.content}</p>
        </div>
      ))}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background:"var(--bg-elevated)", border:"1px solid rgba(13, 148, 136,0.25)" }}>
            <div className="flex items-center justify-between mb-5"><h3 className="text-base font-bold text-white">Add Care Note</h3><button onClick={()=>setShowForm(false)} style={{color:"var(--text-muted)"}}><X size={18}/></button></div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Shift</label>
                <select value={form.shift} onChange={e=>setForm(f=>({...f,shift:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputSt}>
                  <option value="day">Day</option><option value="evening">Evening</option><option value="night">Night</option>
                </select></div>
                <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Category</label>
                <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputSt}>
                  {Object.entries(NOTE_CAT_LABEL).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select></div>
              </div>
              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Mood</label>
              <select value={form.mood} onChange={e=>setForm(f=>({...f,mood:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputSt}>
                <option value="">Not recorded</option>
                {Object.entries(MOOD_EMOJI).map(([k,v])=><option key={k} value={k}>{v} {k}</option>)}
              </select></div>
              <div><label className="block text-xs mb-1" style={{color:"rgba(var(--fg-rgb),0.5)"}}>Note *</label>
              <textarea rows={4} value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={inputSt} placeholder="Enter care note…"/></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowForm(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{background:"rgba(var(--fg-rgb),0.06)",color:"rgba(var(--fg-rgb),0.7)",border:"1px solid rgba(var(--fg-rgb),0.08)"}}>Cancel</button>
              <button onClick={handleSave} disabled={saving||!form.content} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{background:"linear-gradient(135deg,#0d9488,#10b981)"}}>{saving?"Saving…":"Save Note"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Appointments Tab ──────────────────────────────────────────────────────────

const APPT_TYPE_LABEL: Record<string,string> = { gp:"GP", hospital:"Hospital", specialist:"Specialist", dentist:"Dentist", optician:"Optician", physio:"Physiotherapy", other:"Other" };
const APPT_STATUS_CFG: Record<string,{color:string;bg:string}> = {
  scheduled:  { color:"var(--c-teal2)", bg:"rgba(45, 212, 191,0.12)" },
  completed:  { color:"var(--c-green)", bg:"rgba(52,211,153,0.12)" },
  cancelled:  { color:"var(--c-red)", bg:"rgba(239,68,68,0.12)" },
  dna:        { color:"var(--c-amber)", bg:"rgba(251,191,36,0.12)" },
};

function AppointmentsTab({ residentId }: { residentId: number }) {
  const [appointments, setAppointments] = useState<Array<{id:number;appointment_type:string;provider_name:string;location:string;scheduled_at:string;status:string;notes:string;outcome:string}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/appointments/?resident=${residentId}&ordering=scheduled_at&page_size=30`, { credentials:"include" })
      .then(r => r.ok ? r.json() : { results:[] })
      .then(d => setAppointments(d.results ?? d))
      .catch(console.error).finally(() => setLoading(false));
  }, [residentId]);

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div>;

  const now = new Date().toISOString();
  const upcoming = appointments.filter(a => a.scheduled_at >= now && a.status === "scheduled");
  const past = appointments.filter(a => a.scheduled_at < now || a.status !== "scheduled");

  if (appointments.length === 0) return (
    <div className="text-center py-12 rounded-2xl" style={{ background:"rgba(var(--fg-rgb),0.02)", border:"1px solid rgba(var(--fg-rgb),0.06)" }}>
      <CalendarDays size={28} className="mx-auto mb-2" style={{ color:"rgba(var(--fg-rgb),0.15)" }} />
      <p className="text-sm" style={{ color:"rgba(var(--fg-rgb),0.3)" }}>No appointments recorded.</p>
    </div>
  );

  const ApptCard = ({ a }: { a: typeof appointments[0] }) => {
    const cfg = APPT_STATUS_CFG[a.status] ?? APPT_STATUS_CFG.scheduled;
    const dt = new Date(a.scheduled_at);
    return (
      <div className="rounded-2xl p-4" style={{ background:"rgba(var(--fg-rgb),0.02)", border:"1px solid rgba(var(--fg-rgb),0.07)" }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-white">{APPT_TYPE_LABEL[a.appointment_type] ?? a.appointment_type}</span>
              {a.provider_name && <span className="text-xs" style={{ color:"rgba(var(--fg-rgb),0.5)" }}>with {a.provider_name}</span>}
            </div>
            <div className="text-xs mt-1" style={{ color:"rgba(var(--fg-rgb),0.4)" }}>
              {dt.toLocaleDateString("en-GB")} at {dt.toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" })}
              {a.location && ` · ${a.location}`}
            </div>
            {a.outcome && <p className="text-xs mt-1.5" style={{ color:"rgba(var(--fg-rgb),0.5)" }}>{a.outcome}</p>}
          </div>
          <span className="text-xs px-2 py-0.5 rounded-lg flex-shrink-0 capitalize" style={{ background:cfg.bg, color:cfg.color }}>{a.status}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {upcoming.length > 0 && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:"rgba(var(--fg-rgb),0.35)" }}>Upcoming</div>
          <div className="space-y-2">{upcoming.map(a => <ApptCard key={a.id} a={a} />)}</div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:"rgba(var(--fg-rgb),0.35)" }}>Past</div>
          <div className="space-y-2">{past.map(a => <ApptCard key={a.id} a={a} />)}</div>
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ResidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { can } = useUser();
  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    residentsApi.get(Number(id))
      .then(setResident)
      .catch(() => router.replace("/dashboard/residents"))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleDelete() {
    if (!resident) return;
    setDeleting(true);
    try {
      await residentsApi.delete(resident.id);
      router.replace("/dashboard/residents");
    } catch (e) {
      console.error(e);
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!resident) return null;

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <Breadcrumbs crumbs={[
        { label: "Residents", href: "/dashboard/residents" },
        { label: resident.full_name },
      ]} />

      {/* Header card */}
      <div className="rounded-2xl p-4 sm:p-6"
        style={{ background: "rgba(var(--fg-rgb),0.03)", border: "1px solid rgba(var(--fg-rgb),0.08)" }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Avatar resident={resident} size={80} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white">{resident.full_name}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: resident.is_active ? "rgba(52,211,153,0.12)" : "rgba(107,114,128,0.12)", color: resident.is_active ? "var(--c-green)" : "#9ca3af" }}>
                {resident.is_active ? "Active" : "Discharged"}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm" style={{ color: "rgba(var(--fg-rgb),0.45)" }}>
              <span>Room {resident.room_number}</span>
              {resident.nhs_number && <span>NHS: {resident.nhs_number}</span>}
              <span>Age {resident.age}</span>
              <span>Admitted {new Date(resident.admission_date).toLocaleDateString("en-GB")}</span>
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <RiskBadge level={resident.fall_risk} />
              <span className="text-xs" style={{ color: "rgba(var(--fg-rgb),0.25)" }}>fall risk</span>
              <span className="mx-1" style={{ color: "rgba(var(--fg-rgb),0.15)" }}>·</span>
              <RiskBadge level={resident.pressure_ulcer_risk} />
              <span className="text-xs" style={{ color: "rgba(var(--fg-rgb),0.25)" }}>pressure ulcer</span>
            </div>
          </div>
          <div className="flex sm:flex-col gap-2 flex-shrink-0">
            <button
              onClick={() => router.push(`/dashboard/residents/${resident.id}/timeline`)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all"
              style={{ background:"rgba(13, 148, 136,0.1)", color:"var(--c-teal)", border:"1px solid rgba(13, 148, 136,0.2)" }}>
              <Activity size={14} /> Timeline
            </button>
            {can("residents.edit") && (
              <button
                onClick={() => router.push(`/dashboard/residents/${resident.id}/edit`)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white transition-all"
                style={{ background: "#0d9488" }}>
                <Edit2 size={14} /> Edit
              </button>
            )}
            {can("residents.delete") && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all"
                style={{ background: "rgba(239,68,68,0.1)", color: "var(--c-red)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-1 p-1 rounded-xl min-w-max sm:min-w-0" style={{ background: "rgba(var(--fg-rgb),0.03)", border: "1px solid rgba(var(--fg-rgb),0.06)" }}>
          {TABS.map(({ id: tid, label, icon: Icon }) => (
            <button key={tid} onClick={() => setTab(tid)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all sm:flex-1 justify-center whitespace-nowrap"
              style={{
                background: tab === tid ? "rgba(13, 148, 136,0.2)" : "transparent",
                color: tab === tid ? "var(--c-teal)" : "rgba(var(--fg-rgb),0.4)",
                border: tab === tid ? "1px solid rgba(13, 148, 136,0.3)" : "1px solid transparent",
              }}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === "overview"      && <OverviewTab resident={resident} onRiskScoreUpdate={(score) => setResident((r) => r ? { ...r, ai_risk_score: score } : r)} canRecalculate={can("ai.risk_score")} />}
      {tab === "medications"   && <MedicationsTab residentId={resident.id} />}
      {tab === "care-plans"    && <CarePlansTab residentId={resident.id} />}
      {tab === "care-notes"    && <CareNotesTab residentId={resident.id} />}
      {tab === "appointments"  && <AppointmentsTab residentId={resident.id} />}
      {tab === "documents"     && <LinkedDocuments residentId={resident.id} emptyHint="Upload one in the Document Vault and link it to this resident." />}
      {tab === "mar"           && <MARTab residentId={resident.id} />}
      {tab === "vitals"        && <VitalsTab residentId={resident.id} canEdit={can("residents.edit")} />}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Resident?"
        message={`This will permanently remove ${resident.full_name} and all associated records. This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting…" : "Yes, Delete"}
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
