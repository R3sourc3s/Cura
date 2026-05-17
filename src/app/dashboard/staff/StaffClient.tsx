"use client";

import { useRef, useState } from "react";
import { auth as authApi, staff } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/Toast";
import type { Shift, LeaveRequest, Training, User } from "@/types";
import {
  UserCheck, Calendar, Clock, CheckCircle, XCircle,
  Plus, X, Save, GraduationCap, ChevronDown, ChevronUp, BookOpen,
} from "lucide-react";

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

const TRAINING_STATUS = {
  pending:   { color: "#fbbf24", bg: "rgba(250,204,21,0.12)",   label: "Pending" },
  completed: { color: "#34d399", bg: "rgba(52,211,153,0.12)",   label: "Completed" },
  expired:   { color: "#f87171", bg: "rgba(239,68,68,0.12)",    label: "Expired" },
} as const;

const inputCls = "w-full px-3 py-2.5 text-sm rounded-xl outline-none";
const inputStyle = { background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "white" };

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

function GlassCard({ title, children, badge, action }: { title: string; children: React.ReactNode; badge?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-hover)" }}>
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{title}</h2>
        <div className="flex items-center gap-2">{badge}{action}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function today() { return new Date().toISOString().slice(0, 10); }
function dateInDays(n: number) { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
function fmtTime(t: string) { return t?.slice(0, 5) ?? t; }
function fmtDateHeader(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const t = today();
  const tmr = dateInDays(1);
  if (dateStr === t) return "Today";
  if (dateStr === tmr) return "Tomorrow";
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
}
function initials(name: string) {
  const parts = name.replace(/\s*\(.*?\)/, "").trim().split(" ");
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

function AddShiftModal({ users, onClose, onAdded }: { users: User[]; onClose: () => void; onAdded: (s: Shift) => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({
    staff_member: "",
    shift_type: "day" as Shift["shift_type"],
    date: today(),
    start_time: "08:00",
    end_time: "16:00",
    is_agency: false,
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(k: string, v: string | boolean) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const shift = await staff.createShift({
        ...form,
        staff_member: Number(form.staff_member),
      } as Parameters<typeof staff.createShift>[0]);
      onAdded(shift);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create shift");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-md rounded-2xl flex flex-col overflow-hidden"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-strong)" }}>
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #34d399, #059669)" }}>
              <Clock size={14} className="text-white" />
            </div>
            <h2 className="text-base font-bold text-white">Add Shift</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--input-bg)" }}>
            <X size={16} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm text-red-300"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}
          <Field label="Staff Member" required>
            <select className={inputCls} style={inputStyle} value={form.staff_member}
              onChange={(e) => set("staff_member", e.target.value)} required>
              <option value="">— select staff member —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.full_name || u.username} ({u.role})</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date" required>
              <input type="date" className={inputCls} style={inputStyle} value={form.date}
                onChange={(e) => set("date", e.target.value)} required />
            </Field>
            <Field label="Shift Type" required>
              <select className={inputCls} style={inputStyle} value={form.shift_type}
                onChange={(e) => set("shift_type", e.target.value)}>
                <option value="day">Day</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </Field>
            <Field label="Start Time" required>
              <input type="time" className={inputCls} style={inputStyle} value={form.start_time}
                onChange={(e) => set("start_time", e.target.value)} required />
            </Field>
            <Field label="End Time" required>
              <input type="time" className={inputCls} style={inputStyle} value={form.end_time}
                onChange={(e) => set("end_time", e.target.value)} required />
            </Field>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-5 rounded-full flex items-center px-0.5 transition-colors"
              style={{ background: form.is_agency ? "#7c3aed" : "rgba(255,255,255,0.12)" }}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_agency ? "translate-x-5" : "translate-x-0"}`} />
            </div>
            <input type="checkbox" className="hidden" checked={form.is_agency}
              onChange={(e) => set("is_agency", e.target.checked)} />
            <span className="text-sm font-medium text-white">Agency Staff</span>
          </label>
        </form>

        <div className="px-6 py-4 flex gap-3" style={{ borderTop: "1px solid var(--border)" }}>
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
            style={{ background: "var(--input-bg)", color: "var(--text-secondary)", border: "1px solid var(--bg-card-hover)" }}>
            Cancel
          </button>
          <button onClick={() => formRef.current?.requestSubmit()} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
            <Save size={14} />{saving ? "Adding…" : "Add Shift"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LeaveModal({ onClose, onAdded }: { onClose: () => void; onAdded: (l: LeaveRequest) => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({
    leave_type: "annual" as LeaveRequest["leave_type"],
    start_date: today(),
    end_date: today(),
    reason: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const req = await staff.createLeave(form as Parameters<typeof staff.createLeave>[0]);
      onAdded(req);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-md rounded-2xl flex flex-col overflow-hidden"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-strong)" }}>
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-base font-bold text-white">Request Leave</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--input-bg)" }}>
            <X size={16} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>
        <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Field label="Leave Type" required>
            <select className={inputCls} style={inputStyle} value={form.leave_type}
              onChange={(e) => setForm((f) => ({ ...f, leave_type: e.target.value as LeaveRequest["leave_type"] }))}>
              <option value="annual">Annual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="training">Training</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date" required>
              <input type="date" className={inputCls} style={inputStyle} value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} required />
            </Field>
            <Field label="End Date" required>
              <input type="date" className={inputCls} style={inputStyle} value={form.end_date}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} required />
            </Field>
          </div>
          <Field label="Reason">
            <textarea className={inputCls} style={inputStyle} value={form.reason} rows={3}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Optional reason…" />
          </Field>
        </form>
        <div className="px-6 py-4 flex gap-3" style={{ borderTop: "1px solid var(--border)" }}>
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
            style={{ background: "var(--input-bg)", color: "var(--text-secondary)", border: "1px solid var(--bg-card-hover)" }}>
            Cancel
          </button>
          <button onClick={() => formRef.current?.requestSubmit()} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
            <Save size={14} />{saving ? "Submitting…" : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddTrainingModal({ users, onClose, onAdded }: { users: User[]; onClose: () => void; onAdded: (t: Training) => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({
    staff_member: "",
    course_name: "",
    status: "pending" as Training["status"],
    completed_date: "",
    expiry_date: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload: Partial<Training> = {
        staff_member: Number(form.staff_member),
        course_name: form.course_name,
        status: form.status,
        completed_date: form.completed_date || null,
        expiry_date: form.expiry_date || null,
      };
      const record = await staff.createTraining(payload);
      onAdded(record);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add record");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-md rounded-2xl flex flex-col overflow-hidden"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-strong)" }}>
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)" }}>
              <BookOpen size={14} className="text-white" />
            </div>
            <h2 className="text-base font-bold text-white">Add Training Record</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--input-bg)" }}>
            <X size={16} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>
        <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm text-red-300"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}
          <Field label="Staff Member" required>
            <select className={inputCls} style={inputStyle} value={form.staff_member}
              onChange={(e) => set("staff_member", e.target.value)} required>
              <option value="">— select staff member —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.full_name || u.username} ({u.role})</option>
              ))}
            </select>
          </Field>
          <Field label="Course Name" required>
            <input className={inputCls} style={inputStyle} value={form.course_name}
              onChange={(e) => set("course_name", e.target.value)} required
              placeholder="e.g. Manual Handling, Fire Safety…" />
          </Field>
          <Field label="Status" required>
            <select className={inputCls} style={inputStyle} value={form.status}
              onChange={(e) => set("status", e.target.value as Training["status"])}>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Completed Date">
              <input type="date" className={inputCls} style={inputStyle} value={form.completed_date}
                onChange={(e) => set("completed_date", e.target.value)} />
            </Field>
            <Field label="Expiry Date">
              <input type="date" className={inputCls} style={inputStyle} value={form.expiry_date}
                onChange={(e) => set("expiry_date", e.target.value)} />
            </Field>
          </div>
        </form>
        <div className="px-6 py-4 flex gap-3" style={{ borderTop: "1px solid var(--border)" }}>
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
            style={{ background: "var(--input-bg)", color: "var(--text-secondary)", border: "1px solid var(--bg-card-hover)" }}>
            Cancel
          </button>
          <button onClick={() => formRef.current?.requestSubmit()} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
            <Save size={14} />{saving ? "Saving…" : "Add Record"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  initialShifts: Shift[];
  initialLeave: LeaveRequest[];
  initialTraining: Training[];
  initialUsers: User[];
}

export default function StaffClient({ initialShifts, initialLeave, initialTraining, initialUsers }: Props) {
  const { toast } = useToast();
  const { can } = useUser();
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [leave, setLeave] = useState<LeaveRequest[]>(initialLeave);
  const [training, setTraining] = useState<Training[]>(initialTraining);
  const [users] = useState<User[]>(initialUsers);
  const [updating, setUpdating] = useState<number | null>(null);
  const [showShift, setShowShift] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [showAddTraining, setShowAddTraining] = useState(false);

  async function updateLeave(id: number, status: "approved" | "rejected") {
    setUpdating(id);
    try {
      await staff.updateLeave(id, { status });
      setLeave((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
      toast(`Leave request ${status}.`);
    } catch (e) {
      toast("Failed to update leave request.", "error");
    } finally { setUpdating(null); }
  }

  const upcomingCutoff = dateInDays(7);
  const upcomingShifts = shifts
    .filter((s) => s.date >= today() && s.date <= upcomingCutoff)
    .sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time));

  const shiftsByDate = upcomingShifts.reduce<Record<string, Shift[]>>((acc, s) => {
    (acc[s.date] ??= []).push(s);
    return acc;
  }, {});

  const pendingLeave = leave.filter((l) => l.status === "pending");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <UserCheck size={22} style={{ color: "#34d399" }} /> Staff
          </h1>
          <p className="text-sm mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
            {upcomingShifts.length} shifts this week · {pendingLeave.length} leave pending
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {can("staff.request_leave") && (
            <button onClick={() => setShowLeave(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl"
              style={{ background: "var(--border)", color: "var(--text-secondary)", border: "1px solid var(--border-strong)" }}>
              <Calendar size={13} /> <span className="hidden sm:inline">Request Leave</span>
            </button>
          )}
          {can("staff.manage") && (
            <button onClick={() => setShowShift(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-semibold rounded-xl text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
              <Plus size={14} /> <span className="hidden sm:inline">Add Shift</span><span className="sm:hidden">Shift</span>
            </button>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

        {/* Shifts — wider column */}
        <div className="xl:col-span-3 rounded-2xl overflow-hidden"
          style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-hover)" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Upcoming Shifts</h2>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Next 7 days</span>
          </div>

          {upcomingShifts.length === 0 ? (
            <p className="px-5 py-10 text-sm text-center" style={{ color: "var(--text-muted)" }}>No shifts scheduled.</p>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--bg-card)" }}>
              {Object.entries(shiftsByDate).map(([date, dayShifts]) => (
                <div key={date}>
                  {/* Date header */}
                  <div className="flex items-center gap-3 px-5 py-2.5"
                    style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--bg-card)" }}>
                    <span className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: date === today() ? "#a78bfa" : "var(--text-muted)" }}>
                      {fmtDateHeader(date)}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {dayShifts.length} shift{dayShifts.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {/* Shift rows */}
                  {dayShifts.map((s) => {
                    const cfg = SHIFT_CONFIG[s.shift_type] ?? SHIFT_CONFIG.day;
                    const name = (s.staff_member_name || `Staff #${s.staff_member}`).replace(/\s*\(.*?\)/, "");
                    const role = s.staff_member_name?.match(/\((.+?)\)/)?.[1] ?? "";
                    return (
                      <div key={s.id} className="flex items-center gap-3 px-5 py-3"
                        style={{ borderBottom: "1px solid var(--bg-card)" }}>
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                          {initials(s.staff_member_name || "?")}
                        </div>
                        {/* Name + role */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white truncate">{name}</span>
                            {s.is_agency && (
                              <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                                style={{ background: "var(--border)", color: "var(--text-muted)" }}>Agency</span>
                            )}
                          </div>
                          {role && <div className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>{role}</div>}
                        </div>
                        {/* Time */}
                        <div className="text-xs text-right flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                          {fmtTime(s.start_time)} – {fmtTime(s.end_time)}
                        </div>
                        {/* Badge */}
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 w-16 text-center"
                          style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Leave + Training */}
        <div className="xl:col-span-2 flex flex-col gap-4">

          {/* Leave Requests */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-hover)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Leave Requests</h2>
              {pendingLeave.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(250,204,21,0.15)", color: "#fbbf24" }}>
                  {pendingLeave.length} pending
                </span>
              )}
            </div>
            {leave.length === 0 ? (
              <p className="px-5 py-8 text-sm text-center" style={{ color: "var(--text-muted)" }}>No leave requests.</p>
            ) : (
              leave.slice(0, 6).map((req) => {
                const cfg = LEAVE_STATUS[req.status] ?? LEAVE_STATUS.pending;
                const name = (req.staff_member_name || `Staff #${req.staff_member}`).replace(/\s*\(.*?\)/, "");
                const role = req.staff_member_name?.match(/\((.+?)\)/)?.[1] ?? "";
                return (
                  <div key={req.id} className="flex items-start gap-3 px-5 py-3.5"
                    style={{ borderBottom: "1px solid var(--bg-card)" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}>
                      {initials(req.staff_member_name || "?")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{name}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        <span className="capitalize">{req.leave_type}</span>
                        <span className="mx-1">·</span>
                        {new Date(req.start_date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        {" – "}
                        {new Date(req.end_date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </div>
                      {role && <div className="text-xs capitalize mt-0.5" style={{ color: "var(--text-muted)" }}>{role}</div>}
                    </div>
                    {req.status === "pending" && can("staff.manage") ? (
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button onClick={() => updateLeave(req.id, "approved")} disabled={updating === req.id}
                          className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-50"
                          style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.25)" }}>
                          <CheckCircle size={13} style={{ color: "#34d399" }} />
                        </button>
                        <button onClick={() => updateLeave(req.id, "rejected")} disabled={updating === req.id}
                          className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-50"
                          style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}>
                          <XCircle size={13} style={{ color: "#f87171" }} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize flex-shrink-0"
                        style={{ background: cfg.bg, color: cfg.color }}>{req.status}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Training Records */}
          <div className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between px-5 py-4"
              style={{ background: "var(--bg-card)", borderBottom: showTraining ? "1px solid var(--border)" : "none" }}>
              <button className="flex items-center gap-2 flex-1 text-left" onClick={() => setShowTraining((v) => !v)}>
                <GraduationCap size={15} style={{ color: "#a78bfa" }} />
                <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Training Records
                </h2>
                <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>({training.length})</span>
                {showTraining
                  ? <ChevronUp size={13} style={{ color: "var(--text-muted)" }} />
                  : <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />}
              </button>
              {can("staff.manage") && (
                <button onClick={() => setShowAddTraining(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-white ml-3 flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
                  <Plus size={12} /> Add Record
                </button>
              )}
            </div>
            {showTraining && (
              training.length === 0 ? (
                <p className="px-5 py-8 text-sm text-center" style={{ color: "var(--text-muted)", background: "var(--bg-primary)" }}>
                  No training records.
                </p>
              ) : (
                <div style={{ background: "var(--bg-primary)" }}>
                  {training.map((t) => {
                    const cfg = TRAINING_STATUS[t.status] ?? TRAINING_STATUS.pending;
                    const isExpired = t.expiry_date && new Date(t.expiry_date) < new Date();
                    return (
                      <div key={t.id} className="flex items-center gap-3 px-5 py-3"
                        style={{ borderBottom: "1px solid var(--bg-card)" }}>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">
                            {(t.staff_member_name || `Staff #${t.staff_member}`).replace(/\s*\(.*?\)/, "")}
                          </div>
                          <div className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{t.course_name}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                          {t.expiry_date && (
                            <div className="text-xs mt-1" style={{ color: isExpired ? "#f87171" : "var(--text-muted)" }}>
                              exp. {new Date(t.expiry_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>

        </div>
      </div>

      {showShift && <AddShiftModal users={users} onClose={() => setShowShift(false)} onAdded={(s) => { setShifts((prev) => [s, ...prev]); setShowShift(false); toast("Shift added."); }} />}
      {showLeave && <LeaveModal onClose={() => setShowLeave(false)} onAdded={(l) => { setLeave((prev) => [l, ...prev]); setShowLeave(false); toast("Leave request submitted."); }} />}
      {showAddTraining && <AddTrainingModal users={users} onClose={() => setShowAddTraining(false)} onAdded={(t) => { setTraining((prev) => [t, ...prev]); setShowAddTraining(false); setShowTraining(true); toast("Training record added."); }} />}
    </div>
  );
}
