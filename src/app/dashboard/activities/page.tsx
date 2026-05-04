"use client";

import { useEffect, useState, useCallback } from "react";
import { Smile, Plus, X, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

interface Activity {
  id: number; name: string; activity_type: "group"|"one_to_one"|"external"|"virtual";
  organiser_name?: string; scheduled_date: string; scheduled_time: string | null;
  duration_minutes: number; location: string; description: string;
  is_completed: boolean; attendee_count?: number;
}

const TYPE_CFG = { group: { label:"Group", color:"#a78bfa", bg:"rgba(124,58,237,0.12)" }, one_to_one: { label:"1:1", color:"#60a5fa", bg:"rgba(96,165,250,0.12)" }, external: { label:"External", color:"#34d399", bg:"rgba(52,211,153,0.12)" }, virtual: { label:"Virtual", color:"#2dd4bf", bg:"rgba(45,212,191,0.1)" } } as const;

function startOfWeek(d: Date) { const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); return new Date(d.setDate(diff)); }
function addDays(d: Date, n: number) { return new Date(new Date(d).setDate(d.getDate() + n)); }
function isoDate(d: Date) { return d.toISOString().slice(0, 10); }
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

export default function ActivitiesPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", activity_type: "group", scheduled_date: isoDate(new Date()), scheduled_time: "", duration_minutes: "60", location: "", description: "" });

  const load = useCallback(() => {
    setLoading(true);
    const from = isoDate(weekStart);
    const to = isoDate(addDays(weekStart, 6));
    fetch(`/api/v1/activities/?scheduled_date__gte=${from}&scheduled_date__lte=${to}&ordering=scheduled_date,scheduled_time&page_size=200`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setActivities(d.results ?? d))
      .catch(console.error).finally(() => setLoading(false));
  }, [weekStart]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    if (!form.name || !form.scheduled_date) return;
    setSaving(true);
    try {
      const body = { ...form, duration_minutes: Number(form.duration_minutes), scheduled_time: form.scheduled_time || null };
      const res = await fetch("/api/v1/activities/", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) { const n = await res.json(); setActivities(p => [...p, n]); setShowCreate(false); setForm({ name: "", activity_type: "group", scheduled_date: isoDate(new Date()), scheduled_time: "", duration_minutes: "60", location: "", description: "" }); }
    } finally { setSaving(false); }
  }

  async function markComplete(id: number) {
    const res = await fetch(`/api/v1/activities/${id}/`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_completed: true }) });
    if (res.ok) { const u = await res.json(); setActivities(p => p.map(a => a.id === id ? u : a)); }
  }

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.2)" }}>
            <Smile size={16} style={{ color: "#34d399" }} />
          </div>
          <div><h1 className="text-lg font-bold text-white">Activities & Wellbeing</h1></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button onClick={() => setWeekStart(d => addDays(d, -7))} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}><ChevronLeft size={14} style={{ color: "rgba(255,255,255,0.6)" }} /></button>
            <span className="text-sm px-3" style={{ color: "rgba(255,255,255,0.6)" }}>{isoDate(weekStart)} – {isoDate(addDays(weekStart, 6))}</span>
            <button onClick={() => setWeekStart(d => addDays(d, 7))} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}><ChevronRight size={14} style={{ color: "rgba(255,255,255,0.6)" }} /></button>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white" style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}><Plus size={14} /> Add Activity</button>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div> : (
        <div className="grid grid-cols-7 gap-2" style={{ minHeight: 400 }}>
          {days.map((day, i) => {
            const dateStr = isoDate(day);
            const dayActivities = activities.filter(a => a.scheduled_date === dateStr);
            const isToday = dateStr === isoDate(new Date());
            return (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${isToday ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.06)"}` }}>
                <div className="px-2 py-2.5 text-center" style={{ background: isToday ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="text-xs font-semibold" style={{ color: isToday ? "#a78bfa" : "rgba(255,255,255,0.5)" }}>{DAYS[i]}</div>
                  <div className="text-sm font-bold mt-0.5" style={{ color: isToday ? "white" : "rgba(255,255,255,0.7)" }}>{day.getDate()}</div>
                </div>
                <div className="p-1.5 space-y-1">
                  {dayActivities.length === 0 ? <div className="text-center py-4 text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>—</div> : dayActivities.map(a => {
                    const t = TYPE_CFG[a.activity_type as keyof typeof TYPE_CFG] ?? TYPE_CFG.group;
                    return (
                      <div key={a.id} className="rounded-lg px-2 py-1.5 relative" style={{ background: a.is_completed ? "rgba(52,211,153,0.06)" : t.bg, border: `1px solid ${a.is_completed ? "rgba(52,211,153,0.15)" : "transparent"}` }}>
                        <div className="text-xs font-medium leading-snug" style={{ color: a.is_completed ? "#34d399" : "rgba(255,255,255,0.8)" }}>{a.name}</div>
                        {a.scheduled_time && <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{a.scheduled_time.slice(0,5)}</div>}
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-xs" style={{ color: t.color }}>{t.label}</span>
                          {!a.is_completed && <button onClick={() => markComplete(a.id)} title="Mark complete" className="opacity-40 hover:opacity-80"><CheckCircle size={11} style={{ color: "#34d399" }} /></button>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "#0f1629", border: "1px solid rgba(124,58,237,0.25)" }}>
            <div className="flex items-center justify-between mb-5"><h3 className="text-base font-bold text-white">Add Activity</h3><button onClick={() => setShowCreate(false)} style={{ color: "rgba(255,255,255,0.4)" }}><X size={18} /></button></div>
            <div className="space-y-3">
              {[
                { label: "Name *", el: <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="Activity name" /> },
                { label: "Type", el: <select value={form.activity_type} onChange={e => setForm(f => ({ ...f, activity_type: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>{["group","one_to_one","external","virtual"].map(t => <option key={t} value={t}>{TYPE_CFG[t as keyof typeof TYPE_CFG]?.label}</option>)}</select> },
                { label: "Date *", el: <input type="date" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} /> },
                { label: "Time", el: <input type="time" value={form.scheduled_time} onChange={e => setForm(f => ({ ...f, scheduled_time: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} /> },
                { label: "Duration (mins)", el: <input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} /> },
                { label: "Location", el: <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="Lounge, garden…" /> },
                { label: "Description", el: <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={inputStyle} /> },
              ].map(({ label, el }) => <div key={label}><label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</label>{el}</div>)}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}>Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.name} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>{saving ? "Saving…" : "Create"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
