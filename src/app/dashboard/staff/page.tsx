"use client";

import { useEffect, useState } from "react";
import { staff } from "@/lib/api";
import type { Shift, LeaveRequest } from "@/types";
import { UserCheck, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";

const SHIFT_CONFIG = {
  day:     { color: "#fbbf24", bg: "rgba(250,204,21,0.12)", label: "Day" },
  evening: { color: "#fb923c", bg: "rgba(251,146,60,0.12)",  label: "Evening" },
  night:   { color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  label: "Night" },
} as const;

const LEAVE_STATUS = {
  pending:  { color: "#fbbf24", bg: "rgba(250,204,21,0.12)"  },
  approved: { color: "#34d399", bg: "rgba(52,211,153,0.12)"  },
  rejected: { color: "#f87171", bg: "rgba(239,68,68,0.12)"   },
} as const;

function GlassCard({ title, children, badge }: { title: string; children: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <h2 className="font-semibold text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>{title}</h2>
        {badge}
      </div>
      <div>{children}</div>
    </div>
  );
}

function today() { return new Date().toISOString().slice(0, 10); }
function tomorrow() { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); }

export default function StaffPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [leave, setLeave] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([staff.shifts(), staff.leave()])
      .then(([s, l]) => { setShifts(s.results); setLeave(l.results); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function updateLeave(id: number, status: "approved" | "rejected") {
    setUpdating(id);
    try {
      await staff.updateLeave(id, { status });
      setLeave((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    } catch (e) { console.error(e); }
    finally { setUpdating(null); }
  }

  const todaysShifts = shifts.filter((s) => s.date === today() || s.date === tomorrow());
  const pendingLeave = leave.filter((l) => l.status === "pending");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserCheck size={22} style={{ color: "#34d399" }} /> Staff
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            {todaysShifts.length} shifts today & tomorrow · {pendingLeave.length} leave request{pendingLeave.length !== 1 ? "s" : ""} pending
          </p>
        </div>
        <button className="px-4 py-2 text-sm font-semibold rounded-xl text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
          + Add Shift
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Shifts */}
        <GlassCard
          title="Upcoming Shifts"
          badge={
            <div className="flex items-center gap-1.5">
              <Calendar size={12} style={{ color: "rgba(255,255,255,0.35)" }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Today & Tomorrow</span>
            </div>
          }
        >
          {todaysShifts.length === 0 ? (
            <p className="px-5 py-8 text-sm text-center" style={{ color: "rgba(255,255,255,0.3)" }}>No shifts scheduled.</p>
          ) : (
            todaysShifts.map((s) => {
              const cfg = SHIFT_CONFIG[s.shift_type] ?? SHIFT_CONFIG.day;
              const isToday = s.date === today();
              return (
                <div key={s.id} className="flex items-center gap-4 px-5 py-3.5"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: cfg.bg }}>
                    <Clock size={14} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-white">
                        {s.staff_member_name || `Staff #${s.staff_member}`}
                      </div>
                      {s.is_agency && (
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>Agency</span>
                      )}
                    </div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {s.start_time}–{s.end_time} · {isToday ? "Today" : "Tomorrow"}
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                </div>
              );
            })
          )}
        </GlassCard>

        {/* Leave Requests */}
        <GlassCard
          title="Leave Requests"
          badge={
            pendingLeave.length > 0 ? (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(250,204,21,0.15)", color: "#fbbf24" }}>
                {pendingLeave.length} pending
              </span>
            ) : undefined
          }
        >
          {leave.length === 0 ? (
            <p className="px-5 py-8 text-sm text-center" style={{ color: "rgba(255,255,255,0.3)" }}>No leave requests.</p>
          ) : (
            leave.map((req) => {
              const cfg = LEAVE_STATUS[req.status] ?? LEAVE_STATUS.pending;
              return (
                <div key={req.id} className="flex items-center gap-4 px-5 py-3.5"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">
                      {req.staff_member_name || `Staff #${req.staff_member}`}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                      <span className="capitalize">{req.leave_type}</span> · {req.start_date} – {req.end_date}
                    </div>
                  </div>
                  {req.status === "pending" ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => updateLeave(req.id, "approved")}
                        disabled={updating === req.id}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                        style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.25)" }}
                      >
                        <CheckCircle size={13} style={{ color: "#34d399" }} />
                      </button>
                      <button
                        onClick={() => updateLeave(req.id, "rejected")}
                        disabled={updating === req.id}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                        style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}
                      >
                        <XCircle size={13} style={{ color: "#f87171" }} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
                      style={{ background: cfg.bg, color: cfg.color }}>{req.status}</span>
                  )}
                </div>
              );
            })
          )}
        </GlassCard>
      </div>

      {/* Full shift list */}
      {shifts.length > todaysShifts.length && (
        <div className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="px-5 py-4 border-b" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}>
            <h2 className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>All Shifts</h2>
          </div>
          <table className="w-full" style={{ background: "rgba(5,9,20,0.6)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["Staff Member", "Date", "Type", "Hours", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3"
                    style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shifts.slice(0, 20).map((s) => {
                const cfg = SHIFT_CONFIG[s.shift_type] ?? SHIFT_CONFIG.day;
                return (
                  <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="px-5 py-3 text-sm text-white">
                      {s.staff_member_name || `Staff #${s.staff_member}`}
                    </td>
                    <td className="px-5 py-3 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {new Date(s.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    </td>
                    <td className="px-5 py-3 text-xs font-mono" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {s.start_time}–{s.end_time}
                    </td>
                    <td className="px-5 py-3">
                      {s.is_agency && (
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}>Agency</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
