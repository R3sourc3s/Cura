"use client";

import { useEffect, useState, useCallback } from "react";
import { ShieldAlert, Plus, X, ChevronDown, ChevronUp } from "lucide-react";

interface SafeguardingConcern {
  id: number; resident: number; resident_name?: string;
  raised_by_name?: string; category: string;
  date_raised: string; description: string;
  immediate_action_taken: string; referred_to_authority: boolean;
  referral_date: string | null; referral_reference: string;
  outcome: string; status: string; closed_date: string | null;
}
interface Resident { id: number; full_name: string; }

const CATEGORIES: Record<string,string> = { physical:"Physical Abuse", emotional:"Emotional/Psychological", financial:"Financial Abuse", sexual:"Sexual Abuse", neglect:"Neglect", discriminatory:"Discriminatory", organisational:"Organisational", self_neglect:"Self-Neglect", domestic:"Domestic Abuse" };
const STATUS_CFG: Record<string,{label:string;color:string;bg:string}> = {
  open:          { label:"Open",                color:"#f87171", bg:"rgba(239,68,68,0.12)" },
  investigating: { label:"Under Investigation", color:"#fbbf24", bg:"rgba(251,191,36,0.12)" },
  referred:      { label:"Referred",            color:"#60a5fa", bg:"rgba(96,165,250,0.12)" },
  closed:        { label:"Closed",              color:"#34d399", bg:"rgba(52,211,153,0.12)" },
};

const inputStyle = { background:"var(--input-bg)", border:"1px solid var(--border-strong)", color:"var(--text-primary)" };
function isoDate(d: Date) { return d.toISOString().slice(0,10); }

export default function SafeguardingPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [concerns, setConcerns] = useState<SafeguardingConcern[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ resident:"", category:"neglect", date_raised:isoDate(new Date()), description:"", immediate_action_taken:"", referred_to_authority:false, referral_date:"", referral_reference:"", outcome:"", status:"open" });

  useEffect(() => {
    fetch("/api/v1/residents/?page_size=200&is_active=true", { credentials:"include" })
      .then(r => r.ok ? r.json() : { results:[] })
      .then(d => setResidents(d.results ?? d));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams({ ordering:"-date_raised", page_size:"200" });
    if (filterStatus) qs.set("status", filterStatus);
    fetch(`/api/v1/safeguarding/?${qs}`, { credentials:"include" })
      .then(r => r.ok ? r.json() : { results:[] })
      .then(d => setConcerns(d.results ?? d))
      .catch(console.error).finally(() => setLoading(false));
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    if (!form.resident || !form.description) return;
    setSaving(true);
    try {
      const body = { ...form, resident: Number(form.resident), referral_date: form.referral_date || null, referred_to_authority: form.referred_to_authority };
      const res = await fetch("/api/v1/safeguarding/", { method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
      if (res.ok) { const n = await res.json(); setConcerns(p => [n, ...p]); setShowCreate(false); setForm({ resident:"", category:"neglect", date_raised:isoDate(new Date()), description:"", immediate_action_taken:"", referred_to_authority:false, referral_date:"", referral_reference:"", outcome:"", status:"open" }); }
    } finally { setSaving(false); }
  }

  async function updateStatus(id: number, status: string) {
    const res = await fetch(`/api/v1/safeguarding/${id}/`, { method:"PATCH", credentials:"include", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ status, ...(status === "closed" ? { closed_date: isoDate(new Date()) } : {}) }) });
    if (res.ok) { const u = await res.json(); setConcerns(p => p.map(c => c.id === id ? u : c)); }
  }

  const open = concerns.filter(c => c.status === "open").length;
  const investigating = concerns.filter(c => c.status === "investigating").length;

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.2)" }}>
            <ShieldAlert size={16} style={{ color:"#f87171" }} />
          </div>
          <div><h1 className="text-lg font-bold text-white">Safeguarding Register</h1><p className="text-xs" style={{ color:"var(--text-muted)" }}>Concerns, referrals & outcomes</p></div>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white" style={{ background:"linear-gradient(135deg,#ef4444,#7c3aed)" }}><Plus size={14} /> Raise Concern</button>
      </div>

      {/* Summary */}
      {(open > 0 || investigating > 0) && (
        <div className="flex gap-3 flex-wrap">
          {open > 0 && <div className="text-xs px-3 py-2 rounded-xl" style={{ background:"rgba(239,68,68,0.1)", color:"#f87171" }}><strong>{open}</strong> open concerns</div>}
          {investigating > 0 && <div className="text-xs px-3 py-2 rounded-xl" style={{ background:"rgba(251,191,36,0.1)", color:"#fbbf24" }}><strong>{investigating}</strong> under investigation</div>}
        </div>
      )}

      {/* Status filter */}
      <div className="flex gap-1 flex-wrap">
        {["","open","investigating","referred","closed"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className="text-xs px-3 py-1.5 rounded-xl transition-all"
            style={{ background: filterStatus===s ? "rgba(239,68,68,0.15)" : "var(--bg-card)", color: filterStatus===s ? "#f87171" : "var(--text-secondary)", border: filterStatus===s ? "1px solid rgba(239,68,68,0.3)" : "1px solid transparent" }}>
            {s === "" ? "All" : STATUS_CFG[s]?.label ?? s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-red-500 border-t-transparent animate-spin" /></div>
      ) : concerns.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background:"var(--bg-card)", border:"1px solid var(--border)" }}>
          <ShieldAlert size={28} className="mx-auto mb-2" style={{ color:"var(--text-muted)" }} />
          <p className="text-sm" style={{ color:"var(--text-muted)" }}>No safeguarding concerns on record.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {concerns.map(c => {
            const stCfg = STATUS_CFG[c.status] ?? STATUS_CFG.open;
            const isExpanded = expandedId === c.id;
            return (
              <div key={c.id} className="rounded-2xl overflow-hidden" style={{ border:"1px solid var(--border)" }}>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left" style={{ background:"var(--bg-card)" }} onClick={() => setExpandedId(isExpanded ? null : c.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{c.resident_name ?? `Resident #${c.resident}`}</span>
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background:"var(--border)", color:"var(--text-secondary)" }}>{CATEGORIES[c.category] ?? c.category}</span>
                      <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background:stCfg.bg, color:stCfg.color }}>{stCfg.label}</span>
                      {c.referred_to_authority && <span className="text-xs px-2 py-0.5 rounded" style={{ background:"rgba(96,165,250,0.1)", color:"#60a5fa" }}>Referred</span>}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color:"var(--text-muted)" }}>
                      {new Date(c.date_raised).toLocaleDateString("en-GB")} · {c.raised_by_name ?? "—"}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={14} style={{ color:"var(--text-muted)" }} /> : <ChevronDown size={14} style={{ color:"var(--text-muted)" }} />}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 space-y-3" style={{ borderTop:"1px solid var(--border)" }}>
                    <div className="text-xs" style={{ color:"var(--text-secondary)" }}><span style={{ color:"var(--text-muted)" }}>Description: </span>{c.description}</div>
                    {c.immediate_action_taken && <div className="text-xs" style={{ color:"var(--text-secondary)" }}><span style={{ color:"var(--text-muted)" }}>Immediate action: </span>{c.immediate_action_taken}</div>}
                    {c.outcome && <div className="text-xs" style={{ color:"var(--text-secondary)" }}><span style={{ color:"var(--text-muted)" }}>Outcome: </span>{c.outcome}</div>}
                    {c.status !== "closed" && (
                      <div className="flex gap-2 flex-wrap">
                        {c.status === "open" && <button onClick={() => updateStatus(c.id, "investigating")} className="text-xs px-3 py-1.5 rounded-lg" style={{ background:"rgba(251,191,36,0.1)", color:"#fbbf24", border:"1px solid rgba(251,191,36,0.2)" }}>Start Investigation</button>}
                        {(c.status === "open" || c.status === "investigating") && <button onClick={() => updateStatus(c.id, "referred")} className="text-xs px-3 py-1.5 rounded-lg" style={{ background:"rgba(96,165,250,0.1)", color:"#60a5fa", border:"1px solid rgba(96,165,250,0.2)" }}>Refer to Authority</button>}
                        <button onClick={() => updateStatus(c.id, "closed")} className="text-xs px-3 py-1.5 rounded-lg" style={{ background:"rgba(52,211,153,0.1)", color:"#34d399", border:"1px solid rgba(52,211,153,0.2)" }}>Close</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ background:"var(--bg-elevated)", border:"1px solid rgba(239,68,68,0.25)" }}>
            <div className="flex items-center justify-between mb-5"><h3 className="text-base font-bold text-white">Raise Safeguarding Concern</h3><button onClick={()=>setShowCreate(false)} style={{color:"var(--text-muted)"}}><X size={18}/></button></div>
            <div className="space-y-3">
              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Resident *</label>
              <select value={form.resident} onChange={e=>setForm(f=>({...f,resident:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                <option value="">Select…</option>{residents.map(r=><option key={r.id} value={r.id}>{r.full_name}</option>)}
              </select></div>
              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Category *</label>
              <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                {Object.entries(CATEGORIES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select></div>
              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Date Raised</label>
              <input type="date" value={form.date_raised} onChange={e=>setForm(f=>({...f,date_raised:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}/></div>
              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Description *</label>
              <textarea rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={inputStyle} placeholder="Describe the concern in detail…"/></div>
              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Immediate Action Taken</label>
              <textarea rows={2} value={form.immediate_action_taken} onChange={e=>setForm(f=>({...f,immediate_action_taken:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={inputStyle}/></div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.referred_to_authority} onChange={e=>setForm(f=>({...f,referred_to_authority:e.target.checked}))} className="w-4 h-4 rounded"/>
                <span className="text-sm" style={{color:"var(--text-secondary)"}}>Referred to local authority</span>
              </label>
              {form.referred_to_authority && (
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Referral Date</label>
                  <input type="date" value={form.referral_date} onChange={e=>setForm(f=>({...f,referral_date:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}/></div>
                  <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Reference No.</label>
                  <input value={form.referral_reference} onChange={e=>setForm(f=>({...f,referral_reference:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}/></div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowCreate(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{background:"var(--border)",color:"var(--text-primary)",border:"1px solid var(--border-strong)"}}>Cancel</button>
              <button onClick={handleCreate} disabled={saving||!form.resident||!form.description} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{background:"linear-gradient(135deg,#ef4444,#7c3aed)"}}>{saving?"Saving…":"Raise Concern"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
