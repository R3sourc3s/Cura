"use client";

import { useEffect, useState, useCallback } from "react";
import { GraduationCap, Plus, X, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface TrainingRecord {
  id: number; staff_member: number; staff_member_name?: string;
  course_name_display: string; completed_date: string | null;
  expiry_date: string | null; provider: string; notes: string; status: string;
}
interface StaffMember { id: number; full_name: string; role: string; }

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  valid:         { label:"Valid",          color:"#34d399", bg:"rgba(52,211,153,0.12)",  Icon: CheckCircle },
  expiring_soon: { label:"Expiring Soon",  color:"#fbbf24", bg:"rgba(251,191,36,0.12)",  Icon: Clock },
  expired:       { label:"Expired",        color:"#f87171", bg:"rgba(239,68,68,0.12)",   Icon: AlertTriangle },
  not_completed: { label:"Not Completed",  color:"#6b7280", bg:"rgba(107,114,128,0.12)", Icon: Clock },
};

const inputStyle = { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.8)" };

export default function TrainingPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStaff, setFilterStaff] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ staff_member:"", course_name:"", completed_date:"", expiry_date:"", provider:"", notes:"" });

  useEffect(() => {
    fetch("/api/v1/auth/users/?page_size=200", { credentials:"include" })
      .then(r => r.ok ? r.json() : { results:[] })
      .then(d => setStaff((d.results ?? d).filter((u: StaffMember) => u.role !== "family")));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams({ page_size:"200" });
    if (filterStaff) qs.set("staff_member", filterStaff);
    fetch(`/api/v1/training/records/?${qs}`, { credentials:"include" })
      .then(r => r.ok ? r.json() : { results:[] })
      .then(d => setRecords(d.results ?? d))
      .catch(console.error).finally(() => setLoading(false));
  }, [filterStaff]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    if (!form.staff_member || !form.course_name) return;
    setSaving(true);
    try {
      const body = { staff_member: Number(form.staff_member), course_name: form.course_name, completed_date: form.completed_date || null, expiry_date: form.expiry_date || null, provider: form.provider, notes: form.notes };
      const res = await fetch("/api/v1/training/records/", { method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
      if (res.ok) { const n = await res.json(); setRecords(p => [...p, n]); setShowCreate(false); setForm({ staff_member:"", course_name:"", completed_date:"", expiry_date:"", provider:"", notes:"" }); }
    } finally { setSaving(false); }
  }

  const filtered = records.filter(r => !filterStatus || r.status === filterStatus);
  const expired = records.filter(r => r.status === "expired").length;
  const expiring = records.filter(r => r.status === "expiring_soon").length;

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:"rgba(251,191,36,0.12)", border:"1px solid rgba(251,191,36,0.2)" }}>
            <GraduationCap size={16} style={{ color:"#fbbf24" }} />
          </div>
          <div><h1 className="text-lg font-bold text-white">Staff Training</h1><p className="text-xs" style={{ color:"rgba(255,255,255,0.35)" }}>Mandatory training & certification tracker</p></div>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white" style={{ background:"linear-gradient(135deg,#7c3aed,#3b82f6)" }}><Plus size={14} /> Add Record</button>
      </div>

      {/* Alerts */}
      {(expired > 0 || expiring > 0) && (
        <div className="flex gap-3 flex-wrap">
          {expired > 0 && <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl" style={{ background:"rgba(239,68,68,0.1)", color:"#f87171" }}><AlertTriangle size={12} /><strong>{expired}</strong>&nbsp;expired records</div>}
          {expiring > 0 && <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl" style={{ background:"rgba(251,191,36,0.1)", color:"#fbbf24" }}><Clock size={12} /><strong>{expiring}</strong>&nbsp;expiring within 30 days</div>}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select value={filterStaff} onChange={e => setFilterStaff(e.target.value)} className="text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
          <option value="">All staff</option>
          {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
        </select>
        {["","valid","expiring_soon","expired","not_completed"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className="text-xs px-3 py-1.5 rounded-xl transition-all"
            style={{ background: filterStatus===s ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)", color: filterStatus===s ? "#a78bfa" : "rgba(255,255,255,0.5)", border: filterStatus===s ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent" }}>
            {s === "" ? "All" : STATUS_CFG[s]?.label ?? s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid rgba(255,255,255,0.07)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ background:"rgba(255,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                {["Staff Member","Training","Completed","Expires","Status","Provider"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.35)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-sm" style={{ color:"rgba(255,255,255,0.3)" }}>No training records found.</td></tr>
              ) : filtered.map(r => {
                const cfg = STATUS_CFG[r.status] ?? STATUS_CFG.not_completed;
                const { Icon } = cfg;
                return (
                  <tr key={r.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    <td className="px-4 py-3 text-sm text-white font-medium">{r.staff_member_name ?? `Staff #${r.staff_member}`}</td>
                    <td className="px-4 py-3 text-sm" style={{ color:"rgba(255,255,255,0.7)" }}>{r.course_name_display}</td>
                    <td className="px-4 py-3 text-xs" style={{ color:"rgba(255,255,255,0.5)" }}>{r.completed_date ? new Date(r.completed_date).toLocaleDateString("en-GB") : "—"}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: r.status==="expired" ? "#f87171" : r.status==="expiring_soon" ? "#fbbf24" : "rgba(255,255,255,0.5)" }}>
                      {r.expiry_date ? new Date(r.expiry_date).toLocaleDateString("en-GB") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-xs w-fit px-2 py-0.5 rounded-lg" style={{ background:cfg.bg, color:cfg.color }}>
                        <Icon size={11} />{cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color:"rgba(255,255,255,0.4)" }}>{r.provider || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background:"#0f1629", border:"1px solid rgba(124,58,237,0.25)" }}>
            <div className="flex items-center justify-between mb-5"><h3 className="text-base font-bold text-white">Add Training Record</h3><button onClick={()=>setShowCreate(false)} style={{color:"rgba(255,255,255,0.4)"}}><X size={18}/></button></div>
            <div className="space-y-3">
              <div><label className="block text-xs mb-1" style={{color:"rgba(255,255,255,0.5)"}}>Staff Member *</label>
              <select value={form.staff_member} onChange={e=>setForm(f=>({...f,staff_member:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                <option value="">Select…</option>{staff.map(s=><option key={s.id} value={s.id}>{s.full_name} ({s.role})</option>)}
              </select></div>
              <div><label className="block text-xs mb-1" style={{color:"rgba(255,255,255,0.5)"}}>Training Course *</label>
              <input value={form.course_name} onChange={e=>setForm(f=>({...f,course_name:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="e.g. Fire Safety, Moving & Handling…"/></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-xs mb-1" style={{color:"rgba(255,255,255,0.5)"}}>Completed Date</label>
                <input type="date" value={form.completed_date} onChange={e=>setForm(f=>({...f,completed_date:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}/></div>
                <div><label className="block text-xs mb-1" style={{color:"rgba(255,255,255,0.5)"}}>Expiry Date</label>
                <input type="date" value={form.expiry_date} onChange={e=>setForm(f=>({...f,expiry_date:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}/></div>
              </div>
              <div><label className="block text-xs mb-1" style={{color:"rgba(255,255,255,0.5)"}}>Provider</label>
              <input value={form.provider} onChange={e=>setForm(f=>({...f,provider:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="Training provider name"/></div>
              <div><label className="block text-xs mb-1" style={{color:"rgba(255,255,255,0.5)"}}>Notes</label>
              <textarea rows={2} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={inputStyle}/></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowCreate(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,255,255,0.08)"}}>Cancel</button>
              <button onClick={handleCreate} disabled={saving||!form.staff_member||!form.course_name} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{background:"linear-gradient(135deg,#7c3aed,#3b82f6)"}}>{saving?"Saving…":"Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
