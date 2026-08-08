"use client";

import { useEffect, useState, useCallback } from "react";
import { BookOpen, Plus, X, Search, Filter, ChevronDown } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/Toast";

interface CareNote {
  id: number; resident: number; resident_name?: string;
  author: number | null; author_name?: string;
  shift: "day" | "evening" | "night";
  category: string; mood: string;
  content: string; recorded_at: string; created_at: string;
}
interface Resident { id: number; full_name: string; }

const SHIFT_CFG = {
  day:     { label: "Day",     color: "var(--c-amber)", bg: "rgba(251,191,36,0.12)" },
  evening: { label: "Evening", color: "var(--c-teal2)", bg: "rgba(45, 212, 191,0.12)" },
  night:   { label: "Night",   color: "var(--c-teal)", bg: "rgba(13, 148, 136,0.12)" },
} as const;

const MOOD_DOT: Record<string, string> = {
  good: "var(--c-green)", okay: "var(--c-teal2)", low: "var(--c-amber)",
  agitated: "var(--c-orange)", distressed: "var(--c-red)",
};

const CATEGORIES = ["personal_care","nutrition","mobility","mood","sleep","health","social","general"];
const CATEGORY_LABEL: Record<string, string> = {
  personal_care:"Personal Care", nutrition:"Nutrition", mobility:"Mobility",
  mood:"Mood", sleep:"Sleep", health:"Health", social:"Social", general:"General",
};

export default function CareNotesPage() {
  const [notes, setNotes] = useState<CareNote[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterShift, setFilterShift] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({ resident: "", shift: "day", category: "general", mood: "", content: "", recorded_at: new Date().toISOString().slice(0,16) });

  const load = useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams({ ordering: "-recorded_at", page_size: "50" });
    if (filterShift) qs.set("shift", filterShift);
    if (filterCat) qs.set("category", filterCat);
    fetch(`/api/v1/care-notes/?${qs}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setNotes(d.results ?? d))
      .catch(console.error).finally(() => setLoading(false));
  }, [filterShift, filterCat]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch("/api/v1/residents/?is_active=true&page_size=100", { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setResidents(d.results ?? []));
  }, []);

  async function handleSave() {
    if (!form.resident || !form.content || !form.recorded_at) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/care-notes/", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, resident: Number(form.resident) }),
      });
      if (res.ok) { const n = await res.json(); setNotes(p => [n, ...p]); setShowModal(false); setForm({ resident: "", shift: "day", category: "general", mood: "", content: "", recorded_at: new Date().toISOString().slice(0,16) }); toast("Care note added.", "success"); }
      else { toast("Could not save care note.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
    finally { setSaving(false); }
  }

  const filtered = notes.filter(n => {
    if (filterDate && !n.recorded_at.startsWith(filterDate)) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (n.resident_name ?? "").toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
  });

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = notes.filter(n => n.recorded_at.startsWith(today)).length;
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const weekCount = notes.filter(n => n.recorded_at >= weekAgo).length;
  const shiftCounts = { day: notes.filter(n => n.shift === "day").length, evening: notes.filter(n => n.shift === "evening").length, night: notes.filter(n => n.shift === "night").length };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(13, 148, 136,0.12)", border: "1px solid rgba(13, 148, 136,0.2)" }}>
            <BookOpen size={16} style={{ color: "var(--c-teal)" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Daily Care Notes</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>All resident care notes</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white"
          style={{ background: "#0d9488" }}>
          <Plus size={14} /> Add Note
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Today", value: todayCount, color: "var(--c-green)" },
          { label: "This Week", value: weekCount, color: "var(--c-teal2)" },
          { label: "Day Shift", value: shiftCounts.day, color: "var(--c-amber)" },
          { label: "Evening", value: shiftCounts.evening, color: "var(--c-teal2)" },
          { label: "Night", value: shiftCounts.night, color: "var(--c-teal)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-hover)" }}>
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input type="text" placeholder="Search resident or content…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full text-sm pl-9 pr-4 py-2 rounded-xl outline-none"
            style={{ background: "var(--input-bg)", border: "1px solid var(--bg-card-hover)", color: "var(--text-secondary)" }} />
        </div>
        {[
          { value: filterShift, set: setFilterShift, opts: [["","All Shifts"],["day","Day"],["evening","Evening"],["night","Night"]] },
          { value: filterCat, set: setFilterCat, opts: [["","All Categories"], ...CATEGORIES.map(c => [c, CATEGORY_LABEL[c]])] },
        ].map((f, i) => (
          <div key={i} className="relative">
            <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(var(--fg-rgb),0.25)" }} />
            <select value={f.value} onChange={e => f.set(e.target.value)}
              className="text-sm pl-8 pr-8 py-2 rounded-xl outline-none appearance-none"
              style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.08)", color: "rgba(var(--fg-rgb),0.6)" }}>
              {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(var(--fg-rgb),0.3)" }} />
          </div>
        ))}
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
          className="text-sm px-3 py-2 rounded-xl outline-none"
          style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.08)", color: "rgba(var(--fg-rgb),0.6)" }} />
      </div>

      {/* Notes */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No care notes found" description="Record a new care note to get started." action={{ label: "Add Note", onClick: () => setShowModal(true) }} />
      ) : (
        <div className="space-y-3">
          {filtered.map(note => {
            const shift = SHIFT_CFG[note.shift as keyof typeof SHIFT_CFG] ?? SHIFT_CFG.day;
            return (
              <div key={note.id} className="rounded-2xl p-4" style={{ background: "rgba(var(--fg-rgb),0.03)", border: "1px solid rgba(var(--fg-rgb),0.07)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-sm font-semibold text-white">{note.resident_name ?? `Resident #${note.resident}`}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: shift.bg, color: shift.color }}>{shift.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(var(--fg-rgb),0.05)", color: "rgba(var(--fg-rgb),0.45)" }}>{CATEGORY_LABEL[note.category] ?? note.category}</span>
                      {note.mood && MOOD_DOT[note.mood] && (
                        <span className="flex items-center gap-1 text-xs" style={{ color: "rgba(var(--fg-rgb),0.4)" }}>
                          <span className="w-2 h-2 rounded-full" style={{ background: MOOD_DOT[note.mood] }} />
                          {note.mood}
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(var(--fg-rgb),0.65)" }}>{note.content}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs" style={{ color: "rgba(var(--fg-rgb),0.4)" }}>{new Date(note.recorded_at).toLocaleDateString("en-GB")}</div>
                    <div className="text-xs" style={{ color: "rgba(var(--fg-rgb),0.25)" }}>{new Date(note.recorded_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
                    {note.author_name && <div className="text-xs mt-1" style={{ color: "rgba(var(--fg-rgb),0.3)" }}>{note.author_name}</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-lg" style={{ background: "var(--bg-elevated)", border: "1px solid rgba(13, 148, 136,0.25)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Add Care Note</h3>
              <button onClick={() => setShowModal(false)} style={{ color: "rgba(var(--fg-rgb),0.4)" }}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: "Resident *", el: <select value={form.resident} onChange={e => setForm(f => ({ ...f, resident: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}><option value="">Select resident…</option>{residents.map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}</select> },
                { label: "Shift *", el: <select value={form.shift} onChange={e => setForm(f => ({ ...f, shift: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}>{["day","evening","night"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}</select> },
                { label: "Category", el: <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}>{CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}</select> },
                { label: "Mood", el: <select value={form.mood} onChange={e => setForm(f => ({ ...f, mood: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}><option value="">Not recorded</option>{["good","okay","low","agitated","distressed"].map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>)}</select> },
                { label: "Date & Time *", el: <input type="datetime-local" value={form.recorded_at} onChange={e => setForm(f => ({ ...f, recorded_at: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }} /> },
                { label: "Note *", el: <textarea rows={4} placeholder="Describe the care provided…" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }} /> },
              ].map(({ label, el }) => (
                <div key={label}><label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>{label}</label>{el}</div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{ background: "rgba(var(--fg-rgb),0.06)", color: "rgba(var(--fg-rgb),0.7)", border: "1px solid rgba(var(--fg-rgb),0.08)" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.resident || !form.content} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{ background: "#0d9488" }}>{saving ? "Saving…" : "Save Note"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
