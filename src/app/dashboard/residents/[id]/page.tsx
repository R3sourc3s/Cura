"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { residents as residentsApi } from "@/lib/api";
import type { Resident, Medication, CarePlan, MAREntry } from "@/types";
import {
  ArrowLeft, Edit2, Trash2, User, Phone, Heart, Pill,
  ClipboardList, AlertTriangle, CheckCircle, Clock, XCircle,
  Calendar, Activity, Shield, ChevronRight,
} from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────

const RISK_STYLE = {
  critical: { bg: "rgba(239,68,68,0.15)", text: "#f87171", dot: "#ef4444" },
  high:     { bg: "rgba(251,146,60,0.15)", text: "#fb923c", dot: "#f97316" },
  medium:   { bg: "rgba(250,204,21,0.12)", text: "#fbbf24", dot: "#eab308" },
  low:      { bg: "rgba(52,211,153,0.12)",  text: "#34d399", dot: "#10b981" },
} as const;

const STATUS_CFG = {
  given:   { icon: CheckCircle, color: "#34d399", bg: "rgba(52,211,153,0.12)",  label: "Given" },
  pending: { icon: Clock,       color: "#fb923c", bg: "rgba(251,146,60,0.12)",  label: "Pending" },
  refused: { icon: XCircle,     color: "#f87171", bg: "rgba(239,68,68,0.12)",   label: "Refused" },
  omitted: { icon: XCircle,     color: "#a78bfa", bg: "rgba(124,58,237,0.12)",  label: "Omitted" },
} as const;

const PLAN_STATUS = {
  active:       { color: "#34d399", bg: "rgba(52,211,153,0.12)",  label: "Active" },
  draft:        { color: "#fb923c", bg: "rgba(251,146,60,0.12)",  label: "Draft" },
  under_review: { color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  label: "Under Review" },
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
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      {children}
    </div>
  );
}

function SectionHeading({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={14} style={{ color: "#7c3aed" }} />
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
        {label}
      </span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-start justify-between py-2.5"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
      <span className="text-xs font-medium text-right ml-4" style={{ color: "rgba(255,255,255,0.8)" }}>
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
        color: "rgba(255,255,255,0.9)",
      }}>
      {initials}
    </div>
  );
}

// ── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = "overview" | "medications" | "care-plans" | "mar";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview",    label: "Overview",    icon: User },
  { id: "medications", label: "Medications", icon: Pill },
  { id: "care-plans",  label: "Care Plans",  icon: ClipboardList },
  { id: "mar",         label: "MAR History", icon: Activity },
];

// ── Sub-views ─────────────────────────────────────────────────────────────────

function OverviewTab({ resident }: { resident: Resident }) {
  const riskScore = resident.ai_risk_score;
  const scoreColor = riskScore >= 80 ? "#ef4444" : riskScore >= 60 ? "#f97316" : riskScore >= 40 ? "#eab308" : "#10b981";

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
            <div className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Next of Kin</div>
            <div className="text-sm font-medium text-white">{resident.next_of_kin_name || "—"}</div>
            {resident.next_of_kin_phone && (
              <a href={`tel:${resident.next_of_kin_phone}`}
                className="text-xs mt-0.5 block hover:underline" style={{ color: "#60a5fa" }}>
                {resident.next_of_kin_phone}
              </a>
            )}
          </div>
          <div className="pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>GP / Medical</div>
            <div className="text-sm font-medium text-white">{resident.gp_name || "—"}</div>
            {resident.gp_phone && (
              <a href={`tel:${resident.gp_phone}`}
                className="text-xs mt-0.5 block hover:underline" style={{ color: "#60a5fa" }}>
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
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Fall Risk</span>
            <RiskBadge level={resident.fall_risk} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Pressure Ulcer Risk</span>
            <RiskBadge level={resident.pressure_ulcer_risk} />
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>AI Risk Score</span>
              <span className="text-lg font-bold" style={{ color: scoreColor }}>{riskScore}/100</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${riskScore}%`, background: `linear-gradient(90deg, ${scoreColor}88, ${scoreColor})` }} />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Conditions */}
      <GlassCard>
        <SectionHeading icon={Heart} label="Diagnoses & Conditions" />
        {(resident.conditions ?? []).length === 0 ? (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No conditions recorded.</p>
        ) : (
          <div className="space-y-2">
            {resident.conditions!.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <div className="text-sm font-medium text-white">{c.name}</div>
                  {c.diagnosed_date && (
                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                      Diagnosed {new Date(c.diagnosed_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                    </div>
                  )}
                </div>
                {c.icd_code && (
                  <span className="text-xs px-1.5 py-0.5 rounded font-mono ml-3"
                    style={{ background: "rgba(124,58,237,0.12)", color: "#a78bfa" }}>
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
    <div className="text-center py-12 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <Pill size={28} className="mx-auto mb-2" style={{ color: "rgba(255,255,255,0.15)" }} />
      <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No active medications.</p>
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
                    style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}>CD</span>
                )}
                {med.is_low_stock && (
                  <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}>
                    <AlertTriangle size={10} /> Low stock
                  </span>
                )}
              </div>
              <div className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
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
              <div className="text-lg font-bold" style={{ color: med.is_low_stock ? "#f87171" : "#34d399" }}>
                {med.stock_count}
              </div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>units</div>
              <div className="w-16 mt-2">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="h-full rounded-full"
                    style={{
                      width: `${Math.min((med.stock_count / Math.max(med.reorder_threshold * 4, 1)) * 100, 100)}%`,
                      background: med.is_low_stock ? "#ef4444" : "#34d399",
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
    <div className="text-center py-12 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <ClipboardList size={28} className="mx-auto mb-2" style={{ color: "rgba(255,255,255,0.15)" }} />
      <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No care plans recorded.</p>
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
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {plan.created_by_name && `Created by ${plan.created_by_name} · `}
                    {plan.next_review_date && `Review: ${new Date(plan.next_review_date).toLocaleDateString("en-GB")}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.3)", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
              </div>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {plan.ai_summary && (
                  <div className="mt-3 px-3 py-2.5 rounded-xl text-xs leading-relaxed"
                    style={{ background: "rgba(124,58,237,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(124,58,237,0.15)" }}>
                    {plan.ai_summary}
                  </div>
                )}
                {(plan.sections ?? []).map((sec) => {
                  const sRisk = RISK_STYLE[sec.risk_level as keyof typeof RISK_STYLE] ?? RISK_STYLE.low;
                  return (
                    <div key={sec.id} className="rounded-xl px-4 py-3"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-white">{sec.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                          style={{ background: sRisk.bg, color: sRisk.text }}>{sec.risk_level}</span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
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
    <div className="text-center py-12 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <Activity size={28} className="mx-auto mb-2" style={{ color: "rgba(255,255,255,0.15)" }} />
      <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No MAR entries found.</p>
    </div>
  );

  return (
    <div className="rounded-2xl overflow-hidden overflow-x-auto" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      <table className="w-full min-w-[560px]">
        <thead>
          <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["Medication", "Scheduled", "Status", "Administered by", "Notes"].map((h) => (
              <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-3"
                style={{ color: "rgba(255,255,255,0.35)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody style={{ background: "rgba(5,9,20,0.6)" }}>
          {allMAR.slice(0, 50).map((entry) => {
            const cfg = STATUS_CFG[entry.status] ?? STATUS_CFG.pending;
            const Icon = cfg.icon;
            return (
              <tr key={entry.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-white">{entry.drugName}</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{entry.dose}</div>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {new Date(entry.scheduled_at).toLocaleDateString("en-GB")}{" "}
                  <span style={{ color: "rgba(255,255,255,0.35)" }}>
                    {new Date(entry.scheduled_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium"
                    style={{ background: cfg.bg, color: cfg.color }}>
                    <Icon size={10} />{cfg.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {entry.administered_by_name ?? "—"}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ResidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
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
      {/* Back */}
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm transition-all"
        style={{ color: "rgba(255,255,255,0.4)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
        <ArrowLeft size={16} /> Back to Residents
      </button>

      {/* Header card */}
      <div className="rounded-2xl p-4 sm:p-6"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Avatar resident={resident} size={80} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white">{resident.full_name}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: resident.is_active ? "rgba(52,211,153,0.12)" : "rgba(107,114,128,0.12)", color: resident.is_active ? "#34d399" : "#9ca3af" }}>
                {resident.is_active ? "Active" : "Discharged"}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              <span>Room {resident.room_number}</span>
              {resident.nhs_number && <span>NHS: {resident.nhs_number}</span>}
              <span>Age {resident.age}</span>
              <span>Admitted {new Date(resident.admission_date).toLocaleDateString("en-GB")}</span>
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <RiskBadge level={resident.fall_risk} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>fall risk</span>
              <span className="mx-1" style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
              <RiskBadge level={resident.pressure_ulcer_risk} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>pressure ulcer</span>
            </div>
          </div>
          <div className="flex sm:flex-col gap-2 flex-shrink-0">
            <button
              onClick={() => router.push(`/dashboard/residents/${resident.id}/edit`)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white transition-all"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
              <Edit2 size={14} /> Edit
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all"
              style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-1 p-1 rounded-xl min-w-max sm:min-w-0" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {TABS.map(({ id: tid, label, icon: Icon }) => (
            <button key={tid} onClick={() => setTab(tid)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all sm:flex-1 justify-center whitespace-nowrap"
              style={{
                background: tab === tid ? "rgba(124,58,237,0.2)" : "transparent",
                color: tab === tid ? "#a78bfa" : "rgba(255,255,255,0.4)",
                border: tab === tid ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
              }}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === "overview"    && <OverviewTab resident={resident} />}
      {tab === "medications" && <MedicationsTab residentId={resident.id} />}
      {tab === "care-plans"  && <CarePlansTab residentId={resident.id} />}
      {tab === "mar"         && <MARTab residentId={resident.id} />}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm"
            style={{ background: "#0f1629", border: "1px solid rgba(239,68,68,0.3)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(239,68,68,0.12)" }}>
              <Trash2 size={20} className="text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-1">Delete Resident?</h3>
            <p className="text-sm text-center mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
              This will permanently remove <strong className="text-white">{resident.full_name}</strong> and all associated records.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white transition-all disabled:opacity-50"
                style={{ background: "#dc2626" }}>
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
