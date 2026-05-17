"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar, Plus, X, ChevronDown, Search } from "lucide-react";

interface Appointment {
  id: number; resident: number; resident_name?: string;
  appointment_type: string; provider_name: string; location: string;
  scheduled_at: string; status: "scheduled"|"completed"|"cancelled"|"dna";
  outcome: string; follow_up_required: boolean; follow_up_notes: string;
  escort_required: boolean; transport_arranged: boolean; created_by_name?: string; created_at: string;
}
interface Resident { id: number; full_name: string; }

const TYPE_CFG: Record<string, { label:string; color:string; bg:string }> = {
  gp:         { label:"GP",          color:"#34d399", bg:"rgba(52,211,153,0.12)" },
  hospital:   { label:"Hospital",    color:"#f87171", bg:"rgba(239,68,68,0.12)" },
  specialist: { label:"Specialist",  color:"#a78bfa", bg:"rgba(124,58,237,0.12)" },
  dentist:    { label:"Dentist",     color:"#60a5fa", bg:"rgba(96,165,250,0.12)" },
  optician:   { label:"Optician",    color:"#2dd4bf", bg:"rgba(45,212,191,0.1)" },
  physio:     { label:"Physio",      color:"#fb923c", bg:"rgba(251,146,60,0.12)" },
  other:      { label:"Other",       color:"#9ca3af", bg:"rgba(107,114,128,0.1)" },
};
const STATUS_CFG: Record<string, { label:string; color:string; bg:string }> = {
  scheduled:  { label:"Scheduled",  color:"#60a5fa", bg:"rgba(96,165,250,0.12)" },
  completed:  { label:"Completed",  color:"#34d399", bg:"rgba(52,211,153,0.12)" },
  cancelled:  { label:"Cancelled",  color:"#9ca3af", bg:"rgba(107,114,128,0.1)" },
  dna:        { label:"DNA",        color:"#f87171", bg:"rgba(239,68,68,0.12)" },
};

export default function AppointmentsPage() {
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editAppt, setEditAppt] = useState<Appointment | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ resident: "", appointment_type: "gp", provider_name: "", location: "", scheduled_at: "", escort_required: false, transport_arranged: false });
  const [editForm, setEditForm] = useState({ status: "scheduled", outcome: "", follow_up_required: false, follow_up_notes: "" });

  const load = useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams({ ordering: "scheduled_at" });
    if (filterStatus) qs.set("status", filterStatus);
    if (filterType) qs.set("appointment_type", filterType);
    fetch(`/api/v1/appointments/?${qs}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setAppts(d.results ?? d))
      .catch(console.error).finally(() => setLoading(false));
  }, [filterStatus, filterType]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    fetch("/api/v1/residents/?is_active=true&page_size=100", { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] }).then(d => setResidents(d.results ?? []));
  }, []);

  async function handleCreate() {
    if (!form.resident || !form.provider_name || !form.scheduled_at) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/appointments/", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, resident: Number(form.resident) }) });
      if (res.ok) { const n = await res.json(); setAppts(p => [n, ...p]); setShowCreate(false); setForm({ resident: "", appointment_type: "gp", provider_name: "", location: "", scheduled_at: "", escort_required: false, transport_arranged: false }); }
    } finally { setSaving(false); }
  }

  async function handleUpdate() {
    if (!editAppt) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/appointments/${editAppt.id}/`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
      if (res.ok) { const u = await res.json(); setAppts(p => p.map(a => a.id === editAppt.id ? u : a)); setEditAppt(null); }
    } finally { setSaving(false); }
  }

  const today = new Date().toISOString().slice(0, 10);
  const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString();
  const upcoming = appts.filter(a => a.status === "scheduled" && a.scheduled_at >= today).length;
  const todayCount = appts.filter(a => a.scheduled_at.startsWith(today)).length;
  const escortNeeded = appts.filter(a => a.escort_required && a.status === "scheduled").length;
  const followUps = appts.filter(a => a.follow_up_required && a.status === "completed").length;

  const filtered = appts.filter(a => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (a.resident_name ?? "").toLowerCase().includes(q) || a.provider_name.toLowerCase().includes(q);
  });

  const inputStyle = { background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.2)" }}>
            <Calendar size={16} style={{ color: "#60a5fa" }} />
          </div>
          <div><h1 className="text-lg font-bold text-white">Appointments</h1><p className="text-xs" style={{ color: "var(--text-muted)" }}>GP, hospital & specialist visits</p></div>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white" style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}><Plus size={14} /> Add Appointment</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[{ label:"Upcoming This Week", value:upcoming, color:"#60a5fa" }, { label:"Today", value:todayCount, color:"#a78bfa" }, { label:"Escort Required", value:escortNeeded, color:"#fbbf24" }, { label:"Follow-ups Due", value:followUps, color:"#f87171" }].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-hover)" }}>
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input type="text" placeholder="Search resident or provider…" value={search} onChange={e => setSearch(e.target.value)} className="w-full text-sm pl-9 pr-4 py-2 rounded-xl outline-none" style={{ background: "var(--input-bg)", border: "1px solid var(--bg-card-hover)", color: "var(--text-secondary)" }} />
        </div>
        {[
          { value: filterStatus, set: setFilterStatus, opts: [["","All Status"],["scheduled","Scheduled"],["completed","Completed"],["cancelled","Cancelled"],["dna","DNA"]] },
          { value: filterType, set: setFilterType, opts: [["","All Types"],["gp","GP"],["hospital","Hospital"],["specialist","Specialist"],["dentist","Dentist"],["optician","Optician"],["physio","Physio"],["other","Other"]] },
        ].map((f, i) => (
          <div key={i} className="relative">
            <select value={f.value} onChange={e => f.set(e.target.value)} className="text-sm pl-3 pr-8 py-2 rounded-xl outline-none appearance-none" style={{ background: "var(--input-bg)", border: "1px solid var(--bg-card-hover)", color: "var(--text-secondary)" }}>
              {f.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
                {["Resident","Type","Provider","Date & Time","Status","Escort","Transport"].map(h => <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-3" style={{ color: "var(--text-muted)" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody style={{ background: "rgba(5,9,20,0.6)" }}>
              {loading ? <tr><td colSpan={7} className="py-12 text-center"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto" /></td></tr> :
               filtered.length === 0 ? <tr><td colSpan={7} className="py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>No appointments found</td></tr> :
               filtered.map(a => {
                const tc = TYPE_CFG[a.appointment_type] ?? TYPE_CFG.other;
                const sc = STATUS_CFG[a.status] ?? STATUS_CFG.scheduled;
                const isPast = a.scheduled_at < today;
                return (
                  <tr key={a.id} className="cursor-pointer" style={{ borderBottom: "1px solid var(--bg-card)", opacity: isPast && a.status === "scheduled" ? 0.7 : 1 }}
                    onClick={() => { setEditAppt(a); setEditForm({ status: a.status, outcome: a.outcome, follow_up_required: a.follow_up_required, follow_up_notes: a.follow_up_notes }); }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td className="px-4 py-3 text-sm font-medium text-white">{a.resident_name ?? `#${a.resident}`}</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: tc.bg, color: tc.color }}>{tc.label}</span></td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>{a.provider_name}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{new Date(a.scheduled_at).toLocaleDateString("en-GB")} <span style={{ color: "var(--text-muted)" }}>{new Date(a.scheduled_at).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</span></td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span></td>
                    <td className="px-4 py-3 text-xs" style={{ color: a.escort_required ? "#fbbf24" : "var(--text-muted)" }}>{a.escort_required ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: a.transport_arranged ? "#34d399" : "var(--text-muted)" }}>{a.transport_arranged ? "Arranged" : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "var(--bg-elevated)", border: "1px solid rgba(124,58,237,0.25)" }}>
            <div className="flex items-center justify-between mb-5"><h3 className="text-base font-bold text-white">Add Appointment</h3><button onClick={() => setShowCreate(false)} style={{ color: "var(--text-muted)" }}><X size={18} /></button></div>
            <div className="space-y-3">
              {[
                { label:"Resident *", el:<select value={form.resident} onChange={e=>setForm(f=>({...f,resident:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}><option value="">Select…</option>{residents.map(r=><option key={r.id} value={r.id}>{r.full_name}</option>)}</select> },
                { label:"Type", el:<select value={form.appointment_type} onChange={e=>setForm(f=>({...f,appointment_type:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>{Object.entries(TYPE_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select> },
                { label:"Provider / Doctor *", el:<input value={form.provider_name} onChange={e=>setForm(f=>({...f,provider_name:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="Dr Smith, City Hospital…" /> },
                { label:"Location", el:<input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="Address or clinic" /> },
                { label:"Date & Time *", el:<input type="datetime-local" value={form.scheduled_at} onChange={e=>setForm(f=>({...f,scheduled_at:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} /> },
              ].map(({label,el})=><div key={label}><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>{label}</label>{el}</div>)}
              <div className="flex gap-4">
                {[{id:"escort",label:"Escort required",key:"escort_required"},{id:"transport",label:"Transport arranged",key:"transport_arranged"}].map(({id,label,key})=>(
                  <div key={id} className="flex items-center gap-2">
                    <input type="checkbox" id={id} checked={form[key as keyof typeof form] as boolean} onChange={e=>setForm(f=>({...f,[key]:e.target.checked}))} className="w-4 h-4 rounded" />
                    <label htmlFor={id} className="text-sm" style={{color:"var(--text-secondary)"}}>{label}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowCreate(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{background:"var(--bg-card-hover)",color:"var(--text-secondary)",border:"1px solid var(--bg-card-hover)"}}>Cancel</button>
              <button onClick={handleCreate} disabled={saving||!form.resident||!form.provider_name||!form.scheduled_at} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{background:"linear-gradient(135deg,#7c3aed,#3b82f6)"}}>{saving?"Saving…":"Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "var(--bg-elevated)", border: "1px solid rgba(124,58,237,0.25)" }}>
            <div className="flex items-center justify-between mb-3"><h3 className="text-base font-bold text-white">Update Appointment</h3><button onClick={()=>setEditAppt(null)} style={{color:"var(--text-muted)"}}><X size={18}/></button></div>
            <p className="text-sm mb-5" style={{color:"var(--text-secondary)"}}>{editAppt.resident_name} — {editAppt.provider_name}</p>
            <div className="space-y-3">
              {[
                { label:"Status", el:<select value={editForm.status} onChange={e=>setEditForm(f=>({...f,status:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>{Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select> },
                { label:"Outcome / Notes", el:<textarea rows={3} value={editForm.outcome} onChange={e=>setEditForm(f=>({...f,outcome:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={inputStyle} /> },
              ].map(({label,el})=><div key={label}><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>{label}</label>{el}</div>)}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="fu" checked={editForm.follow_up_required} onChange={e=>setEditForm(f=>({...f,follow_up_required:e.target.checked}))} className="w-4 h-4 rounded" />
                <label htmlFor="fu" className="text-sm" style={{color:"var(--text-secondary)"}}>Follow-up required</label>
              </div>
              {editForm.follow_up_required && <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Follow-up Notes</label><textarea rows={2} value={editForm.follow_up_notes} onChange={e=>setEditForm(f=>({...f,follow_up_notes:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={inputStyle}/></div>}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setEditAppt(null)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{background:"var(--bg-card-hover)",color:"var(--text-secondary)",border:"1px solid var(--bg-card-hover)"}}>Cancel</button>
              <button onClick={handleUpdate} disabled={saving} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{background:"linear-gradient(135deg,#7c3aed,#3b82f6)"}}>{saving?"Saving…":"Update"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
