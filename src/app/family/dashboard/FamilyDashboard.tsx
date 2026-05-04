"use client";

import type { Resident, Medication, CarePlan } from "@/types";
import { Heart, User, Pill, ClipboardList, Phone } from "lucide-react";

const RISK = {
  critical: { bg: "rgba(239,68,68,0.15)", text: "#f87171", dot: "#ef4444" },
  high:     { bg: "rgba(251,146,60,0.15)", text: "#fb923c", dot: "#f97316" },
  medium:   { bg: "rgba(250,204,21,0.12)", text: "#fbbf24", dot: "#eab308" },
  low:      { bg: "rgba(52,211,153,0.12)", text: "#34d399", dot: "#10b981" },
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

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center gap-2 px-5 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {icon}
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

interface Props {
  resident: Resident;
  medications: Medication[];
  carePlans: CarePlan[];
}

export default function FamilyDashboard({ resident, medications, carePlans }: Props) {
  const admissionDate = new Date(resident.admission_date + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="rounded-2xl p-6"
        style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.12), rgba(124,58,237,0.12))", border: "1px solid rgba(236,72,153,0.2)" }}>
        <div className="flex items-start gap-4">
          {resident.photo ? (
            <img src={resident.photo} alt={resident.full_name}
              className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-bold text-white"
              style={{ background: `linear-gradient(135deg, hsl(${(resident.id * 47) % 360},60%,30%), hsl(${((resident.id * 47) + 40) % 360},70%,40%))` }}>
              {resident.first_name[0]}{resident.last_name[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white">{resident.full_name}</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
              Age {resident.age} · Room {resident.room_number}
            </p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
              Admitted {admissionDate}
            </p>
            {resident.conditions && resident.conditions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {resident.conditions.filter((c) => c.is_active).slice(0, 4).map((c) => (
                  <span key={c.id} className="text-xs px-2 py-0.5 rounded-md"
                    style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                    {c.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Risk overview */}
      <Card title="Care Overview" icon={<Heart size={15} style={{ color: "#ec4899" }} />}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>Fall Risk</p>
            <RiskBadge level={resident.fall_risk} />
          </div>
          <div>
            <p className="text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>Pressure Ulcer Risk</p>
            <RiskBadge level={resident.pressure_ulcer_risk} />
          </div>
        </div>
      </Card>

      {/* Medications */}
      <Card title={`Medications (${medications.length})`} icon={<Pill size={15} style={{ color: "#a78bfa" }} />}>
        {medications.length === 0 ? (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>No active medications on record.</p>
        ) : (
          <div className="space-y-3">
            {medications.map((med) => (
              <div key={med.id} className="flex items-start justify-between gap-3 pb-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <p className="text-sm font-medium text-white">{med.drug_name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {med.dose} · {med.route} · {med.frequency}
                  </p>
                  {med.indication && (
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>For: {med.indication}</p>
                  )}
                </div>
                {med.is_controlled && (
                  <span className="text-xs px-2 py-0.5 rounded flex-shrink-0"
                    style={{ background: "rgba(251,146,60,0.12)", color: "#fb923c" }}>Controlled</span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Care Plans */}
      <Card title="Active Care Plans" icon={<ClipboardList size={15} style={{ color: "#34d399" }} />}>
        {carePlans.length === 0 ? (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>No active care plans.</p>
        ) : (
          <div className="space-y-3">
            {carePlans.map((plan) => (
              <div key={plan.id} className="px-4 py-3 rounded-xl"
                style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
                {plan.ai_summary ? (
                  <p className="text-sm text-white leading-relaxed">{plan.ai_summary}</p>
                ) : (
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Care plan active since {new Date(plan.created_at).toLocaleDateString("en-GB")}.
                  </p>
                )}
                {plan.next_review_date && (
                  <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Next review: {new Date(plan.next_review_date + "T00:00:00").toLocaleDateString("en-GB")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Key contacts */}
      {(resident.gp_name || resident.next_of_kin_name) && (
        <Card title="Key Contacts" icon={<Phone size={15} style={{ color: "#60a5fa" }} />}>
          <div className="space-y-3">
            {resident.gp_name && (
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>GP</p>
                  <p className="text-sm text-white">{resident.gp_name}</p>
                </div>
                {resident.gp_phone && (
                  <a href={`tel:${resident.gp_phone}`} className="text-xs px-2.5 py-1 rounded-lg"
                    style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }}>
                    {resident.gp_phone}
                  </a>
                )}
              </div>
            )}
            {resident.next_of_kin_name && (
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Next of Kin</p>
                  <p className="text-sm text-white">{resident.next_of_kin_name}</p>
                </div>
                {resident.next_of_kin_phone && (
                  <a href={`tel:${resident.next_of_kin_phone}`} className="text-xs px-2.5 py-1 rounded-lg"
                    style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }}>
                    {resident.next_of_kin_phone}
                  </a>
                )}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
