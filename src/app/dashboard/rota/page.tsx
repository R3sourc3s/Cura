"use client";

import { useEffect, useState, useCallback } from "react";
import { CalendarDays, Plus, X, ChevronLeft, ChevronRight, Users, AlertTriangle, Gauge } from "lucide-react";
import { useToast } from "@/components/Toast";

interface Shift {
  id: number; staff_member: number; staff_member_name?: string;
  shift_type: "day"|"evening"|"night"; date: string;
  start_time: string; end_time: string; is_agency: boolean; notes: string;
}
interface StaffMember { id: number; full_name: string; role: string; }

interface CoverageShift {
  shift_type: "day"|"evening"|"night"; shift_type_label: string;
  staff_count: number; agency_count: number; recommended_staff: number;
  understaffed: boolean; gap: number;
}
interface Coverage {
  date: string; resident_count: number; acuity_weighted_load: number;
  high_acuity_count: number; shifts: CoverageShift[];
}

const SHIFT_CFG = {
  day:     { label:"Day",     color:"var(--c-amber)", bg:"rgba(251,191,36,0.15)",  time:"07:00–15:00" },
  evening: { label:"Evening", color:"var(--c-teal2)", bg:"rgba(45, 212, 191,0.15)", time:"15:00–23:00" },
  night:   { label:"Night",   color:"var(--c-teal)", bg:"rgba(13, 148, 136,0.15)", time:"23:00–07:00" },
} as const;

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function startOfWeek(d: Date) { const day = d.getDay(); const diff = d.getDate() - day + (day===0?-6:1); return new Date(new Date(d).setDate(diff)); }
function addDays(d: Date, n: number) { return new Date(new Date(d).setDate(d.getDate()+n)); }
function isoDate(d: Date) { return d.toISOString().slice(0,10); }

export default function RotaPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({ staff_member: "", shift_type: "day", date: isoDate(new Date()), start_time: "07:00", end_time: "15:00", is_agency: false, notes: "" });

  const load = useCallback(() => {
    setLoading(true);
    const from = isoDate(weekStart); const to = isoDate(addDays(weekStart, 6));
    fetch(`/api/v1/staff/shifts/?date_gte=${from}&date_lte=${to}&ordering=date,start_time&page_size=200`, { credentials:"include" })
      .then(r => r.ok ? r.json() : { results:[] })
      .then(d => setShifts(d.results ?? d))
      .catch(console.error).finally(() => setLoading(false));
  }, [weekStart]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    fetch("/api/v1/auth/users/?page_size=100", { credentials:"include" })
      .then(r => r.ok ? r.json() : { results:[] })
      .then(d => setStaff((d.results ?? d).filter((u: StaffMember & {role:string}) => u.role !== "family")));
  }, []);

  const [coverage, setCoverage] = useState<Coverage | null>(null);
  useEffect(() => {
    fetch("/api/v1/staff/staffing-coverage/", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(setCoverage)
      .catch(() => setCoverage(null));
  }, [shifts]);

  async function handleCreate() {
    if (!form.staff_member || !form.date) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/staff/shifts/", { method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ ...form, staff_member: Number(form.staff_member) }) });
      if (res.ok) { const n = await res.json(); setShifts(p=>[...p,n]); setShowCreate(false); setForm({ staff_member:"", shift_type:"day", date:isoDate(new Date()), start_time:"07:00", end_time:"15:00", is_agency:false, notes:"" }); toast("Shift added.", "success"); }
      else { toast("Could not add shift.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
    finally { setSaving(false); }
  }

  async function deleteShift(id: number) {
    await fetch(`/api/v1/staff/shifts/${id}/`, { method:"DELETE", credentials:"include" });
    setShifts(p => p.filter(s => s.id !== id));
  }

  const days = Array.from({ length:7 }, (_,i) => addDays(weekStart, i));
  const shiftTypes: ("day"|"evening"|"night")[] = ["day","evening","night"];
  const inputStyle = { background:"var(--input-bg)", border:"1px solid var(--border-strong)", color:"var(--text-primary)" };

  const today = isoDate(new Date());
  const totalThisWeek = shifts.length;
  const agencyCount = shifts.filter(s => s.is_agency).length;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:"rgba(251,191,36,0.12)", border:"1px solid rgba(251,191,36,0.2)" }}>
            <CalendarDays size={16} style={{ color:"var(--c-amber)" }} />
          </div>
          <div><h1 className="text-lg font-bold text-white">Staff Rota</h1><p className="text-xs" style={{ color:"var(--text-muted)" }}>Weekly shift schedule</p></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button onClick={()=>setWeekStart(d=>addDays(d,-7))} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:"var(--bg-card)", border:"1px solid var(--border)" }}><ChevronLeft size={14} style={{ color:"var(--text-secondary)" }} /></button>
            <span className="text-sm px-3 font-medium" style={{ color:"var(--text-secondary)" }}>{isoDate(weekStart)} – {isoDate(addDays(weekStart,6))}</span>
            <button onClick={()=>setWeekStart(d=>addDays(d,7))} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:"var(--bg-card)", border:"1px solid var(--border)" }}><ChevronRight size={14} style={{ color:"var(--text-secondary)" }} /></button>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white" style={{ background:"linear-gradient(135deg,#0d9488,#10b981)" }}><Plus size={14} /> Add Shift</button>
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-4 flex-wrap">
        <div className="text-xs px-3 py-1.5 rounded-xl" style={{ background:"var(--bg-card)", color:"var(--text-secondary)" }}>
          <Users size={11} className="inline mr-1.5" /><strong style={{ color:"var(--text-primary)" }}>{totalThisWeek}</strong> shifts this week
        </div>
        {agencyCount > 0 && <div className="text-xs px-3 py-1.5 rounded-xl" style={{ background:"rgba(251,146,60,0.1)", color:"var(--c-orange)" }}><strong>{agencyCount}</strong> agency shifts</div>}
      </div>

      {/* Staffing coverage */}
      {coverage && (
        <div className="rounded-2xl p-4" style={{ background:"var(--bg-card)", border:"1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Gauge size={13} style={{ color:"var(--c-teal)" }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color:"var(--text-muted)" }}>
              Today&apos;s staffing coverage
            </span>
            <span className="text-xs" style={{ color:"var(--text-muted)" }}>
              — {coverage.resident_count} residents, {coverage.high_acuity_count} high/critical acuity
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {coverage.shifts.map(s => {
              const cfg = SHIFT_CFG[s.shift_type];
              return (
                <div key={s.shift_type} className="rounded-xl p-3"
                  style={{ background: s.understaffed ? "rgba(239,68,68,0.06)" : "var(--input-bg)", border: s.understaffed ? "1px solid rgba(239,68,68,0.3)" : "1px solid var(--border)" }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold" style={{ color: cfg.color }}>{s.shift_type_label}</span>
                    {s.understaffed ? (
                      <span className="flex items-center gap-1 text-xs font-medium" style={{ color:"var(--c-red)" }}>
                        <AlertTriangle size={10} /> Short {s.gap}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color:"var(--c-green)" }}>Covered</span>
                    )}
                  </div>
                  <div className="text-sm" style={{ color:"var(--text-secondary)" }}>
                    <strong style={{ color:"var(--text-primary)" }}>{s.staff_count}</strong> rostered
                    {s.recommended_staff > 0 && <> · suggests {s.recommended_staff}</>}
                    {s.agency_count > 0 && <> · {s.agency_count} agency</>}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs mt-3" style={{ color: "rgba(var(--fg-rgb),0.35)" }}>
            Suggested staffing is an illustrative guide based on resident count and fall/pressure-ulcer risk — not a regulatory minimum.
          </p>
        </div>
      )}

      {/* Rota grid */}
      {loading ? <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div> : (
        <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid var(--border)" }}>
          {/* Header row */}
          <div className="grid" style={{ gridTemplateColumns:"100px repeat(7, 1fr)", background:"var(--bg-card)", borderBottom:"1px solid var(--border)" }}>
            <div className="px-3 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color:"var(--text-muted)" }}>Shift</div>
            {days.map((day, i) => {
              const d = isoDate(day); const isToday = d === today;
              return (
                <div key={i} className="px-2 py-3 text-center" style={{ borderLeft:"1px solid var(--border)", background: isToday ? "rgba(13, 148, 136,0.08)" : "transparent" }}>
                  <div className="text-xs font-semibold" style={{ color: isToday ? "var(--c-teal)" : "var(--text-secondary)" }}>{DAYS[i]}</div>
                  <div className="text-sm font-bold mt-0.5" style={{ color: isToday ? "white" : "var(--text-secondary)" }}>{day.getDate()}</div>
                </div>
              );
            })}
          </div>

          {/* Rows per shift type */}
          {shiftTypes.map(type => {
            const cfg = SHIFT_CFG[type];
            return (
              <div key={type} className="grid" style={{ gridTemplateColumns:"100px repeat(7, 1fr)", borderBottom:"1px solid var(--border)" }}>
                <div className="px-3 py-3 flex flex-col justify-center" style={{ borderRight:"1px solid var(--border)" }}>
                  <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                  <span className="text-xs mt-0.5" style={{ color:"var(--text-muted)" }}>{cfg.time}</span>
                </div>
                {days.map((day, i) => {
                  const d = isoDate(day);
                  const dayShifts = shifts.filter(s => s.date === d && s.shift_type === type);
                  const isToday = d === today;
                  return (
                    <div key={i} className="p-1.5 min-h-[80px]" style={{ borderLeft:"1px solid var(--border)", background: isToday ? "rgba(13, 148, 136,0.03)" : "transparent" }}>
                      {dayShifts.length === 0 ? (
                        <button onClick={() => { setForm(f => ({ ...f, shift_type: type, date: d, start_time: cfg.time.split("–")[0], end_time: cfg.time.split("–")[1] })); setShowCreate(true); }}
                          className="w-full h-full min-h-[70px] rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                          style={{ border:"1px dashed var(--border-strong)", color:"var(--text-muted)" }}>
                          <Plus size={14} />
                        </button>
                      ) : dayShifts.map(s => (
                        <div key={s.id} className="rounded-lg px-2 py-1.5 mb-1 group relative" style={{ background: s.is_agency ? "rgba(251,146,60,0.12)" : cfg.bg }}>
                          <div className="text-xs font-medium leading-snug" style={{ color:"var(--text-primary)" }}>{s.staff_member_name?.split(" ")[0] ?? `#${s.staff_member}`}</div>
                          <div className="text-xs" style={{ color:"var(--text-muted)" }}>{s.start_time.slice(0,5)}–{s.end_time.slice(0,5)}</div>
                          {s.is_agency && <div className="text-xs" style={{ color:"var(--c-orange)" }}>Agency</div>}
                          <button onClick={()=>deleteShift(s.id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity" style={{ color:"var(--c-red)" }}><X size={10} /></button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background:"var(--bg-elevated)", border:"1px solid rgba(13, 148, 136,0.25)" }}>
            <div className="flex items-center justify-between mb-5"><h3 className="text-base font-bold text-white">Add Shift</h3><button onClick={()=>setShowCreate(false)} style={{ color:"var(--text-muted)" }}><X size={18}/></button></div>
            <div className="space-y-3">
              {[
                { label:"Staff Member *", el:<select value={form.staff_member} onChange={e=>setForm(f=>({...f,staff_member:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}><option value="">Select…</option>{staff.map(s=><option key={s.id} value={s.id}>{s.full_name} ({s.role})</option>)}</select> },
                { label:"Shift Type", el:<select value={form.shift_type} onChange={e=>setForm(f=>({...f,shift_type:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>{shiftTypes.map(t=><option key={t} value={t}>{SHIFT_CFG[t].label}</option>)}</select> },
                { label:"Date *", el:<input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}/> },
                { label:"Start Time", el:<input type="time" value={form.start_time} onChange={e=>setForm(f=>({...f,start_time:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}/> },
                { label:"End Time", el:<input type="time" value={form.end_time} onChange={e=>setForm(f=>({...f,end_time:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}/> },
                { label:"Notes", el:<input value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="Optional"/> },
              ].map(({label,el})=><div key={label}><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>{label}</label>{el}</div>)}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="agency" checked={form.is_agency} onChange={e=>setForm(f=>({...f,is_agency:e.target.checked}))} className="w-4 h-4 rounded"/>
                <label htmlFor="agency" className="text-sm" style={{color:"var(--text-secondary)"}}>Agency staff</label>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowCreate(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{background:"var(--bg-card)",color:"var(--text-secondary)",border:"1px solid var(--border)"}}>Cancel</button>
              <button onClick={handleCreate} disabled={saving||!form.staff_member} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{background:"linear-gradient(135deg,#0d9488,#10b981)"}}>{saving?"Saving…":"Add Shift"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
