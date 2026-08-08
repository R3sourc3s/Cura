"use client";

import { useState } from "react";
import { handover as handoverApi } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/Toast";
import type { HandoverNote, Resident } from "@/types";
import { ClipboardList, Plus, X, Save, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

const SHIFT_CONFIG = {
  day:     { color: "var(--c-amber)", bg: "rgba(250,204,21,0.12)",  label: "Day",     icon: "☀️" },
  evening: { color: "var(--c-orange)", bg: "rgba(251,146,60,0.12)",   label: "Evening", icon: "🌆" },
  night:   { color: "var(--c-teal2)", bg: "rgba(45, 212, 191,0.12)",   label: "Night",   icon: "🌙" },
} as const;

const PRIORITY = {
  normal:   { color: "rgba(var(--fg-rgb),0.5)",  bg: "rgba(var(--fg-rgb),0.06)",  label: "Normal" },
  urgent:   { color: "var(--c-amber)",                bg: "rgba(250,204,21,0.12)",   label: "Urgent" },
  critical: { color: "var(--c-red)",                bg: "rgba(239,68,68,0.12)",    label: "Critical" },
} as const;

const inputCls = "w-full px-3 py-2.5 text-sm rounded-xl outline-none";
const inputStyle = { background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" };

function today() { return new Date().toISOString().slice(0, 10); }
function addDays(date: string, n: number) {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>{label}</label>
      {children}
    </div>
  );
}

function CreateNoteModal({ residents, date, onClose, onCreated }: {
  residents: Resident[];
  date: string;
  onClose: () => void;
  onCreated: (n: HandoverNote) => void;
}) {
  const [form, setForm] = useState({
    shift: "day" as HandoverNote["shift"],
    priority: "normal" as HandoverNote["priority"],
    content: "",
    residents_mentioned: [] as number[],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleResident(id: number) {
    setForm((f) => ({
      ...f,
      residents_mentioned: f.residents_mentioned.includes(id)
        ? f.residents_mentioned.filter((r) => r !== id)
        : [...f.residents_mentioned, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.content.trim()) return;
    setSaving(true); setError("");
    try {
      const created = await handoverApi.create({ ...form, date });
      onCreated(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create note");
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-lg rounded-2xl flex flex-col overflow-hidden"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-strong)" }}>
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#0d9488" }}>
              <ClipboardList size={14} className="text-white" />
            </div>
            <h2 className="text-base font-bold text-white">Add Handover Note</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--input-bg)" }}>
            <X size={16} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Shift">
              <select className={inputCls} style={inputStyle} value={form.shift}
                onChange={(e) => setForm((f) => ({ ...f, shift: e.target.value as HandoverNote["shift"] }))}>
                <option value="day">Day</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </Field>
            <Field label="Priority">
              <select className={inputCls} style={inputStyle} value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as HandoverNote["priority"] }))}>
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>
            </Field>
          </div>

          <Field label="Note">
            <textarea className={inputCls} style={inputStyle} rows={5} value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="Write your handover note here…" required />
          </Field>

          {residents.length > 0 && (
            <Field label="Residents Mentioned">
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {residents.map((r) => {
                  const selected = form.residents_mentioned.includes(r.id);
                  return (
                    <button key={r.id} type="button" onClick={() => toggleResident(r.id)}
                      className="text-xs px-2.5 py-1 rounded-full transition-colors"
                      style={{
                        background: selected ? "rgba(13, 148, 136,0.25)" : "rgba(var(--fg-rgb),0.05)",
                        color: selected ? "var(--c-teal)" : "rgba(var(--fg-rgb),0.5)",
                        border: `1px solid ${selected ? "rgba(13, 148, 136,0.4)" : "rgba(var(--fg-rgb),0.08)"}`,
                      }}>
                      {r.full_name}
                    </button>
                  );
                })}
              </div>
            </Field>
          )}
        </form>

        <div className="px-6 py-4 flex gap-3" style={{ borderTop: "1px solid var(--border)" }}>
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
            style={{ background: "var(--input-bg)", color: "var(--text-secondary)", border: "1px solid var(--border-strong)" }}>
            Cancel
          </button>
          <button onClick={(e) => handleSubmit(e as unknown as React.FormEvent)} disabled={saving || !form.content.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
            style={{ background: "#0d9488" }}>
            <Save size={14} />{saving ? "Saving…" : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  initialNotes: HandoverNote[];
  residents: Resident[];
}

export default function HandoverClient({ initialNotes, residents }: Props) {
  const { user, can } = useUser();
  const { toast } = useToast();
  const [notes, setNotes] = useState<HandoverNote[]>(initialNotes);
  const [date, setDate] = useState(today());
  const [loadingDate, setLoadingDate] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const residentMap = Object.fromEntries(residents.map((r) => [r.id, r.full_name]));

  async function loadDate(d: string) {
    setLoadingDate(true);
    try {
      const data = await handoverApi.list({ date: d, ordering: "-created_at" });
      setNotes(data.results);
      setDate(d);
    } catch { toast("Failed to load notes.", "error"); }
    finally { setLoadingDate(false); }
  }

  async function markRead(noteId: number) {
    try {
      await handoverApi.markRead(noteId);
      setNotes((prev) => prev.map((n) =>
        n.id === noteId && user && !n.read_by_ids.includes(user.id)
          ? { ...n, read_by_ids: [...n.read_by_ids, user.id] }
          : n
      ));
    } catch { /* silent */ }
  }

  function handleCreated(n: HandoverNote) {
    if (n.date === date) setNotes((prev) => [n, ...prev]);
    setShowCreate(false);
    toast("Handover note added.");
  }

  const shifts = ["day", "evening", "night"] as const;
  const byShift = Object.fromEntries(shifts.map((s) => [s, notes.filter((n) => n.shift === s)]));

  const isToday = date === today();
  const dateLabel = isToday
    ? "Today"
    : new Date(date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardList size={22} style={{ color: "#0d9488" }} /> Handover
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {notes.length} note{notes.length !== 1 ? "s" : ""} · {dateLabel}
          </p>
        </div>
        {can("handover.create") && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold rounded-xl text-white flex-shrink-0"
            style={{ background: "#0d9488" }}>
            <Plus size={15} /> <span className="hidden sm:inline">Add Note</span><span className="sm:hidden">Add</span>
          </button>
        )}
      </div>

      {/* Date nav */}
      <div className="flex items-center gap-3">
        <button onClick={() => loadDate(addDays(date, -1))} disabled={loadingDate}
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "var(--input-bg)", border: "1px solid var(--border-strong)" }}>
          <ChevronLeft size={14} style={{ color: "var(--text-secondary)" }} />
        </button>
        <input type="date" value={date} onChange={(e) => loadDate(e.target.value)}
          className="text-sm px-3 py-2 rounded-xl outline-none"
          style={{ background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }} />
        <button onClick={() => loadDate(addDays(date, 1))} disabled={loadingDate || date >= today()}
          className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30"
          style={{ background: "var(--input-bg)", border: "1px solid var(--border-strong)" }}>
          <ChevronRight size={14} style={{ color: "var(--text-secondary)" }} />
        </button>
        {!isToday && (
          <button onClick={() => loadDate(today())}
            className="text-xs px-3 py-2 rounded-xl"
            style={{ background: "rgba(13, 148, 136,0.12)", color: "var(--c-teal)", border: "1px solid rgba(13, 148, 136,0.2)" }}>
            Back to Today
          </button>
        )}
      </div>

      {loadingDate ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {shifts.map((shift) => {
            const cfg = SHIFT_CONFIG[shift];
            const shiftNotes = byShift[shift];
            return (
              <div key={shift} className="rounded-2xl overflow-hidden"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-strong)" }}>
                <div className="flex items-center gap-2 px-4 py-3"
                  style={{ borderBottom: "1px solid var(--border)", background: `${cfg.bg}` }}>
                  <span>{cfg.icon}</span>
                  <span className="text-sm font-semibold" style={{ color: cfg.color }}>{cfg.label} Shift</span>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(0,0,0,0.2)", color: cfg.color }}>
                    {shiftNotes.length}
                  </span>
                </div>

                {shiftNotes.length === 0 ? (
                  <p className="px-4 py-8 text-sm text-center" style={{ color: "var(--text-muted)" }}>
                    No notes for this shift.
                  </p>
                ) : (
                  <div className="divide-y" style={{ borderColor: "var(--bg-card)" }}>
                    {shiftNotes.map((note) => {
                      const pr = PRIORITY[note.priority as keyof typeof PRIORITY] ?? PRIORITY.normal;
                      const isRead = user ? note.read_by_ids.includes(user.id) : false;
                      return (
                        <div key={note.id} className="px-4 py-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              {note.priority !== "normal" && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                  style={{ background: pr.bg, color: pr.color }}>{pr.label}</span>
                              )}
                              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                {note.author_name}
                                {note.author_role && ` · ${note.author_role}`}
                              </span>
                            </div>
                            {!isRead && (
                              <button onClick={() => markRead(note.id)}
                                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg flex-shrink-0"
                                style={{ background: "rgba(52,211,153,0.1)", color: "var(--c-green)", border: "1px solid rgba(52,211,153,0.2)" }}>
                                <CheckCircle size={10} /> Mark read
                              </button>
                            )}
                            {isRead && (
                              <span className="text-xs flex-shrink-0" style={{ color: "rgba(52,211,153,0.5)" }}>
                                <CheckCircle size={11} className="inline" />
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{note.content}</p>
                          {note.residents_mentioned.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {note.residents_mentioned.map((id) => (
                                <span key={id} className="text-xs px-1.5 py-0.5 rounded"
                                  style={{ background: "rgba(13, 148, 136,0.12)", color: "var(--c-teal)" }}>
                                  {residentMap[id] ?? `Resident #${id}`}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {new Date(note.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                            {note.read_by_ids.length > 0 && ` · Read by ${note.read_by_ids.length}`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateNoteModal
          residents={residents}
          date={date}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
