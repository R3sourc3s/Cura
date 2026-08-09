"use client";

import { useEffect, useRef, useState } from "react";
import { NotebookPen, X, Send, ChevronDown } from "lucide-react";

interface Resident { id: number; full_name: string; room_number?: string; }

const SHIFTS = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "night", label: "Night" },
];

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "personal_care", label: "Personal Care" },
  { value: "nutrition", label: "Nutrition" },
  { value: "mobility", label: "Mobility" },
  { value: "behaviour", label: "Behaviour" },
  { value: "medical", label: "Medical" },
  { value: "social", label: "Social" },
];

// One-tap phrase templates per category — low-typing point-of-care logging.
// Tapping inserts the phrase; staff can still edit or add to it before saving.
const TEMPLATES: Record<string, string[]> = {
  general: ["No concerns to report.", "Settled and comfortable throughout.", "Asked to speak with a nurse — flagged to shift lead."],
  personal_care: ["Assisted with washing and dressing, no concerns.", "Declined personal care, will offer again later.", "Continence care provided, skin intact."],
  nutrition: ["Ate all of meal and drank well.", "Ate approximately half of meal.", "Declined meal, offered an alternative."],
  mobility: ["Mobilised independently.", "Required assistance of one to transfer.", "Remained in bed/chair, repositioned as per care plan."],
  behaviour: ["Calm and settled throughout.", "Some agitation noted, redirected successfully.", "No behaviours of concern observed."],
  medical: ["Vital signs within normal range.", "No new symptoms reported.", "GP review requested — details in notes."],
  social: ["Engaged well in group activity.", "Enjoyed a visit from family.", "Preferred quiet time alone today."],
};

export default function QuickCareNote() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [residentId, setResidentId] = useState("");
  const [shift, setShift] = useState("morning");
  const [category, setCategory] = useState("general");
  const [mood, setMood] = useState("neutral");
  const [residents, setResidents] = useState<Resident[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && residents.length === 0) {
      fetch("/api/v1/residents/?is_active=true&page_size=50&ordering=full_name", { credentials: "include" })
        .then(r => r.ok ? r.json() : { results: [] })
        .then(d => setResidents(d.results ?? d))
        .catch(() => {});
    }
    if (open) setTimeout(() => textRef.current?.focus(), 100);
  }, [open, residents.length]);

  function insertTemplate(phrase: string) {
    setContent(prev => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${phrase}` : phrase;
    });
    textRef.current?.focus();
  }

  async function submit() {
    if (!content.trim() || !residentId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/care-notes/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resident: parseInt(residentId), content: content.trim(), shift, category, mood }),
      });
      if (res.ok) {
        setSaved(true);
        setContent("");
        setTimeout(() => { setSaved(false); setOpen(false); }, 1500);
      }
    } finally { setSaving(false); }
  }

  const now = new Date();
  const hour = now.getHours();
  const autoShift = hour < 8 ? "night" : hour < 14 ? "morning" : hour < 19 ? "afternoon" : "evening";

  useEffect(() => { if (open) setShift(autoShift); }, [open, autoShift]);

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => { setOpen(true); setSaved(false); }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl font-medium text-sm transition-all hover:scale-105 active:scale-95"
        style={{ background: "#0d9488", color: "#fff", boxShadow: "0 8px 32px rgba(13, 148, 136,0.45)" }}>
        <NotebookPen size={15} />
        <span className="hidden sm:inline">Quick Note</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
          onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl p-5 space-y-4"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-strong)", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}
            onClick={e => e.stopPropagation()}>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(13, 148, 136,0.12)", border: "1px solid rgba(13, 148, 136,0.2)" }}>
                  <NotebookPen size={13} style={{ color: "#0d9488" }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Quick Care Note</span>
              </div>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--input-bg)" }}>
                <X size={14} style={{ color: "var(--text-secondary)" }} />
              </button>
            </div>

            {/* Resident */}
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: "var(--text-muted)" }}>Resident *</label>
              <div className="relative">
                <select value={residentId} onChange={e => setResidentId(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-xl appearance-none outline-none pr-8"
                  style={{ background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: residentId ? "var(--text-primary)" : "var(--text-muted)" }}>
                  <option value="">Select resident…</option>
                  {residents.map(r => (
                    <option key={r.id} value={r.id} style={{ background: "var(--bg-elevated)" }}>
                      {r.full_name}{r.room_number ? ` · Room ${r.room_number}` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
              </div>
            </div>

            {/* Shift + Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "var(--text-muted)" }}>Shift</label>
                <div className="relative">
                  <select value={shift} onChange={e => setShift(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl appearance-none outline-none pr-8"
                    style={{ background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }}>
                    {SHIFTS.map(s => <option key={s.value} value={s.value} style={{ background: "var(--bg-elevated)" }}>{s.label}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                </div>
              </div>
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "var(--text-muted)" }}>Category</label>
                <div className="relative">
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl appearance-none outline-none pr-8"
                    style={{ background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value} style={{ background: "var(--bg-elevated)" }}>{c.label}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                </div>
              </div>
            </div>

            {/* Mood */}
            <div>
              <label className="text-xs mb-2 block" style={{ color: "var(--text-muted)" }}>Resident Mood</label>
              <div className="flex gap-2">
                {[
                  { v: "happy", e: "😊" }, { v: "neutral", e: "😐" }, { v: "sad", e: "😔" },
                  { v: "anxious", e: "😟" }, { v: "confused", e: "😕" }, { v: "agitated", e: "😤" },
                ].map(m => (
                  <button key={m.v} onClick={() => setMood(m.v)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all"
                    style={{ background: mood === m.v ? "rgba(13, 148, 136,0.12)" : "var(--bg-card)", border: mood === m.v ? "1px solid rgba(13, 148, 136,0.35)" : "1px solid transparent" }}
                    title={m.v}>
                    {m.e}
                  </button>
                ))}
              </div>
            </div>

            {/* One-tap templates */}
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: "var(--text-muted)" }}>Quick phrases — tap to add</label>
              <div className="flex flex-wrap gap-1.5">
                {(TEMPLATES[category] ?? TEMPLATES.general).map(phrase => (
                  <button key={phrase} type="button" onClick={() => insertTemplate(phrase)}
                    className="text-xs px-2.5 py-1.5 rounded-lg text-left transition-colors"
                    style={{ background: "var(--input-bg)", color: "var(--text-secondary)", border: "1px solid var(--border-strong)" }}>
                    {phrase}
                  </button>
                ))}
              </div>
            </div>

            {/* Note content */}
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: "var(--text-muted)" }}>Note *</label>
              <textarea ref={textRef} value={content} onChange={e => setContent(e.target.value)}
                placeholder="Describe the care provided, observations, or any concerns…"
                rows={4}
                className="w-full text-sm px-3 py-2.5 rounded-xl outline-none resize-none"
                style={{ background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }}
                onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) submit(); }}
              />
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Ctrl+Enter to save quickly</p>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm transition-all"
                style={{ background: "var(--input-bg)", color: "var(--text-secondary)" }}>
                Cancel
              </button>
              <button onClick={submit} disabled={saving || !content.trim() || !residentId}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                style={{ background: saved ? "rgba(52,211,153,0.15)" : "#0d9488", color: saved ? "var(--c-green)" : "#fff" }}>
                {saved ? "✓ Saved!" : saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send size={13} /> Save Note</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
