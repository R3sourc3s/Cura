"use client";

import { useEffect, useState, useCallback } from "react";
import { Moon, Plus, X, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/Toast";

interface OvernightCheck {
  id: number; resident: number; resident_name?: string;
  checked_by_name?: string; check_time: string; status: string; notes: string;
}
interface Resident { id: number; full_name: string; }

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  asleep:      { label:"Asleep",           color:"var(--c-teal)", bg:"rgba(13, 148, 136,0.12)" },
  awake:       { label:"Awake",            color:"var(--c-teal2)", bg:"rgba(45, 212, 191,0.12)" },
  unsettled:   { label:"Unsettled",        color:"var(--c-amber)", bg:"rgba(251,191,36,0.12)" },
  repositioned:{ label:"Repositioned",     color:"var(--c-green)", bg:"rgba(52,211,153,0.12)" },
  toileted:    { label:"Toileted",         color:"var(--c-teal2)", bg:"rgba(45,212,191,0.1)" },
  unwell:      { label:"Unwell – Escalated",color:"var(--c-red)",bg:"rgba(239,68,68,0.12)" },
};

function isoDate(d: Date) { return d.toISOString().slice(0,10); }
const inputStyle = { background:"var(--input-bg)", border:"1px solid var(--border-strong)", color:"var(--text-primary)" };

export default function OvernightChecksPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [checks, setChecks] = useState<OvernightCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(isoDate(new Date()));
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({ resident: "", status: "asleep", notes: "" });

  useEffect(() => {
    fetch("/api/v1/residents/?page_size=200&is_active=true", { credentials:"include" })
      .then(r => r.ok ? r.json() : { results:[] })
      .then(d => setResidents(d.results ?? d));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/v1/overnight-checks/?check_time__date=${date}&ordering=-check_time&page_size=300`, { credentials:"include" })
      .then(r => r.ok ? r.json() : { results:[] })
      .then(d => setChecks(d.results ?? d))
      .catch(console.error).finally(() => setLoading(false));
  }, [date]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    if (!form.resident) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/overnight-checks/", { method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ ...form, resident: Number(form.resident) }) });
      if (res.ok) { const n = await res.json(); setChecks(p => [n, ...p]); setShowCreate(false); setForm({ resident:"", status:"asleep", notes:"" }); toast("Check logged.", "success"); }
      else { toast("Could not log check.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
    finally { setSaving(false); }
  }

  const totalChecks = checks.length;
  const unwellCount = checks.filter(c => c.status === "unwell").length;

  const byResident: { resident: Resident; checks: OvernightCheck[] }[] = residents
    .map(r => ({ resident: r, checks: checks.filter(c => c.resident === r.id) }))
    .filter(g => g.checks.length > 0);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:"rgba(13, 148, 136,0.12)", border:"1px solid rgba(13, 148, 136,0.2)" }}>
            <Moon size={16} style={{ color:"var(--c-teal)" }} />
          </div>
          <div><h1 className="text-lg font-bold text-white">Overnight Checks</h1><p className="text-xs" style={{ color:"var(--text-muted)" }}>Night staff resident monitoring log</p></div>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} />
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white" style={{ background:"linear-gradient(135deg,#0d9488,#10b981)" }}><Plus size={14} /> Log Check</button>
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-3 flex-wrap">
        <div className="text-xs px-3 py-1.5 rounded-xl" style={{ background:"var(--input-bg)", color:"var(--text-secondary)" }}>
          <CheckCircle size={11} className="inline mr-1.5" style={{ color:"var(--c-green)" }} /><strong style={{ color:"var(--text-primary)" }}>{totalChecks}</strong> checks logged
        </div>
        {unwellCount > 0 && (
          <div className="text-xs px-3 py-1.5 rounded-xl" style={{ background:"rgba(239,68,68,0.1)", color:"var(--c-red)" }}>
            <AlertTriangle size={11} className="inline mr-1.5" /><strong>{unwellCount}</strong> unwell escalations
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(STATUS_CFG).map(([k, v]) => (
          <div key={k} className="text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5" style={{ background:v.bg, color:v.color }}>
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:v.color }} />{v.label}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div>
      ) : checks.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background:"rgba(var(--fg-rgb),0.02)", border:"1px solid var(--border)" }}>
          <Moon size={28} className="mx-auto mb-2" style={{ color:"var(--text-muted)" }} />
          <p className="text-sm" style={{ color:"var(--text-muted)" }}>No checks logged for this date.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {byResident.map(({ resident: r, checks: rc }) => (
            <div key={r.id} className="rounded-2xl p-4" style={{ background:"rgba(var(--fg-rgb),0.02)", border:"1px solid var(--border)" }}>
              <div className="text-sm font-semibold text-white mb-2">{r.full_name}</div>
              <div className="space-y-1.5">
                {rc.map(c => {
                  const cfg = STATUS_CFG[c.status] ?? { label:c.status, color:"var(--c-teal)", bg:"rgba(13, 148, 136,0.12)" };
                  return (
                    <div key={c.id} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ background:"rgba(var(--fg-rgb),0.02)" }}>
                      <span className="text-xs font-medium w-14 flex-shrink-0" style={{ color:"var(--text-muted)" }}>
                        {new Date(c.check_time).toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" })}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-lg flex-shrink-0" style={{ background:cfg.bg, color:cfg.color }}>{cfg.label}</span>
                      {c.notes && <span className="text-xs flex-1 truncate" style={{ color:"var(--text-muted)" }}>{c.notes}</span>}
                      {c.checked_by_name && <span className="text-xs flex-shrink-0" style={{ color:"var(--text-muted)" }}>{c.checked_by_name}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background:"var(--bg-elevated)", border:"1px solid rgba(13, 148, 136,0.25)" }}>
            <div className="flex items-center justify-between mb-5"><h3 className="text-base font-bold text-white">Log Check</h3><button onClick={() => setShowCreate(false)} style={{ color:"var(--text-muted)" }}><X size={18} /></button></div>
            <div className="space-y-3">
              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Resident *</label>
              <select value={form.resident} onChange={e=>setForm(f=>({...f,resident:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                <option value="">Select…</option>{residents.map(r=><option key={r.id} value={r.id}>{r.full_name}</option>)}
              </select></div>
              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Status *</label>
              <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select></div>
              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Notes</label>
              <input value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="Optional" /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowCreate(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{background:"var(--bg-card-hover)",color:"var(--text-secondary)",border:"1px solid var(--bg-card-hover)"}}>Cancel</button>
              <button onClick={handleCreate} disabled={saving||!form.resident} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{background:"linear-gradient(135deg,#0d9488,#10b981)"}}>{saving?"Saving…":"Log"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
