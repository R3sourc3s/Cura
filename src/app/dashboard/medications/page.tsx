"use client";

import { useEffect, useState } from "react";
import { medications } from "@/lib/api";
import type { Medication, MAREntry } from "@/types";
import { Pill, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";

const STATUS_CONFIG = {
  given:    { icon: CheckCircle, color: "#34d399", bg: "rgba(52,211,153,0.12)", label: "Given" },
  pending:  { icon: Clock,       color: "#fb923c", bg: "rgba(251,146,60,0.12)",  label: "Pending" },
  refused:  { icon: XCircle,     color: "#f87171", bg: "rgba(239,68,68,0.12)",   label: "Refused" },
  omitted:  { icon: XCircle,     color: "#a78bfa", bg: "rgba(124,58,237,0.12)", label: "Omitted" },
} as const;

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl ${className}`}
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      {children}
    </div>
  );
}

export default function MedicationsPage() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [mar, setMar] = useState<MAREntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [administeringId, setAdministeringId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([medications.list(), medications.marList()])
      .then(([m, r]) => { setMeds(m.results); setMar(r.results); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function administer(id: number) {
    setAdministeringId(id);
    try {
      await medications.updateMAR(id, { status: "given", administered_at: new Date().toISOString() });
      setMar((prev) => prev.map((e) => e.id === id ? { ...e, status: "given" } : e));
    } catch (e) {
      console.error(e);
    } finally {
      setAdministeringId(null);
    }
  }

  const lowStock = meds.filter((m) => m.is_low_stock);
  const todayMAR = mar.filter((e) => {
    const d = new Date(e.scheduled_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Pill size={22} style={{ color: "#60a5fa" }} /> Medications
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            {meds.length} medications · {todayMAR.filter(m => m.status === "pending").length} pending today
          </p>
        </div>
        <button className="px-4 py-2 text-sm font-semibold rounded-xl text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
          + Add Medication
        </button>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">
            <strong>{lowStock.length}</strong> medication{lowStock.length !== 1 ? "s" : ""} low on stock: {lowStock.map(m => m.drug_name).join(", ")}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* MAR — Today */}
        <GlassCard>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <h2 className="font-semibold text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
              Today's MAR
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(251,146,60,0.15)", color: "#fb923c" }}>
              {todayMAR.filter((m) => m.status === "pending").length} pending
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {todayMAR.length === 0 ? (
              <p className="px-5 py-8 text-sm text-center" style={{ color: "rgba(255,255,255,0.3)" }}>No scheduled medications today.</p>
            ) : (
              todayMAR.map((entry) => {
                const cfg = STATUS_CONFIG[entry.status] ?? STATUS_CONFIG.pending;
                const StatusIcon = cfg.icon;
                return (
                  <div key={entry.id} className="flex items-center gap-4 px-5 py-3.5"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: cfg.bg }}>
                      <StatusIcon size={14} style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">Medication #{entry.medication}</div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {new Date(entry.scheduled_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    {entry.status === "pending" ? (
                      <button
                        onClick={() => administer(entry.id)}
                        disabled={administeringId === entry.id}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-all disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}
                      >
                        {administeringId === entry.id ? "…" : "Administer"}
                      </button>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>

        {/* Inventory */}
        <GlassCard>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <h2 className="font-semibold text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>Inventory</h2>
            {lowStock.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
                {lowStock.length} low
              </span>
            )}
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {meds.length === 0 ? (
              <p className="px-5 py-8 text-sm text-center" style={{ color: "rgba(255,255,255,0.3)" }}>No medications.</p>
            ) : (
              meds.map((med) => (
                <div key={med.id} className="flex items-center gap-4 px-5 py-3.5"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-white">{med.drug_name}</div>
                      {med.is_controlled && (
                        <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                          style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}>CD</span>
                      )}
                      {med.is_low_stock && (
                        <AlertTriangle size={12} className="text-red-400" />
                      )}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {med.dose} · {med.route} · {med.frequency}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: med.is_low_stock ? "#f87171" : "rgba(255,255,255,0.7)" }}>
                      {med.stock_count}
                    </div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>units</div>
                  </div>
                  <div className="w-12">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div className="h-full rounded-full"
                        style={{
                          width: `${Math.min((med.stock_count / Math.max(med.reorder_threshold * 4, 1)) * 100, 100)}%`,
                          background: med.is_low_stock ? "#ef4444" : "#34d399",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
