"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertCircle, Plus, X } from "lucide-react";

interface FallsAssessment {
  id: number; resident: number; resident_name?: string;
  assessed_by_name?: string; assessment_date: string;
  history_of_falls: boolean; secondary_diagnosis: boolean;
  ambulatory_aid: string; iv_access: boolean;
  gait: string; mental_status: string;
  total_score: number; risk_level: string;
  action_plan: string; next_review_date: string | null;
}
interface Resident { id: number; full_name: string; }

const RISK_CFG = {
  low:    { label:"Low Risk",    color:"#34d399", bg:"rgba(52,211,153,0.12)",  range:"0–24" },
  medium: { label:"Medium Risk", color:"#fbbf24", bg:"rgba(251,191,36,0.12)",  range:"25–44" },
  high:   { label:"High Risk",   color:"#f87171", bg:"rgba(239,68,68,0.12)",   range:"≥45" },
};

const inputStyle = { background:"var(--input-bg)", border:"1px solid var(--border-strong)", color:"var(--text-primary)" };
function isoDate(d: Date) { return d.toISOString().slice(0,10); }

function ScorePreview({ form }: { form: Record<string, string | boolean> }) {
  let s = 0;
  if (form.history_of_falls) s += 25;
  if (form.secondary_diagnosis) s += 15;
  const aid: Record<string,number> = { none:0, crutches:15, furniture:30 };
  s += aid[form.ambulatory_aid as string] ?? 0;
  if (form.iv_access) s += 20;
  const gait: Record<string,number> = { normal:0, weak:10, impaired:20 };
  s += gait[form.gait as string] ?? 0;
  if (form.mental_status === "overestimates") s += 15;
  const level = s < 25 ? "low" : s < 45 ? "medium" : "high";
  const cfg = RISK_CFG[level];
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background:cfg.bg, border:`1px solid ${cfg.color}33` }}>
      <span className="text-2xl font-bold" style={{ color:cfg.color }}>{s}</span>
      <div>
        <div className="text-sm font-semibold" style={{ color:cfg.color }}>{cfg.label}</div>
        <div className="text-xs" style={{ color:"var(--text-muted)" }}>Morse Fall Scale score</div>
      </div>
    </div>
  );
}

export default function FallsRiskPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResident, setSelectedResident] = useState<number | "">("");
  const [assessments, setAssessments] = useState<FallsAssessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    assessment_date: isoDate(new Date()),
    history_of_falls: false, secondary_diagnosis: false,
    ambulatory_aid: "none", iv_access: false,
    gait: "normal", mental_status: "oriented", action_plan: "", next_review_date: "",
  });

  useEffect(() => {
    fetch("/api/v1/residents/?page_size=200&is_active=true", { credentials:"include" })
      .then(r => r.ok ? r.json() : { results:[] })
      .then(d => setResidents(d.results ?? d));
  }, []);

  const load = useCallback(() => {
    if (!selectedResident) { setAssessments([]); return; }
    setLoading(true);
    fetch(`/api/v1/falls-risk/?resident=${selectedResident}&ordering=-assessment_date&page_size=20`, { credentials:"include" })
      .then(r => r.ok ? r.json() : { results:[] })
      .then(d => setAssessments(d.results ?? d))
      .catch(console.error).finally(() => setLoading(false));
  }, [selectedResident]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    if (!selectedResident) return;
    setSaving(true);
    try {
      const body = { ...form, resident: selectedResident, next_review_date: form.next_review_date || null };
      const res = await fetch("/api/v1/falls-risk/", { method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
      if (res.ok) {
        const n = await res.json();
        setAssessments(p => [n, ...p]);
        setShowCreate(false);
        setForm({ assessment_date:isoDate(new Date()), history_of_falls:false, secondary_diagnosis:false, ambulatory_aid:"none", iv_access:false, gait:"normal", mental_status:"oriented", action_plan:"", next_review_date:"" });
      }
    } finally { setSaving(false); }
  }

  const latest = assessments[0];

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:"rgba(251,191,36,0.12)", border:"1px solid rgba(251,191,36,0.2)" }}>
            <AlertCircle size={16} style={{ color:"#fbbf24" }} />
          </div>
          <div><h1 className="text-lg font-bold text-white">Falls Risk Assessment</h1><p className="text-xs" style={{ color:"var(--text-muted)" }}>Morse Fall Scale scoring & history</p></div>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedResident} onChange={e => setSelectedResident(e.target.value ? Number(e.target.value) : "")} className="text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
            <option value="">Select resident…</option>
            {residents.map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
          </select>
          {selectedResident && (
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white" style={{ background:"linear-gradient(135deg,#7c3aed,#3b82f6)" }}><Plus size={14} /> New Assessment</button>
          )}
        </div>
      </div>

      {!selectedResident ? (
        <div className="text-center py-20 rounded-2xl" style={{ background:"var(--bg-card)", border:"1px solid var(--border)" }}>
          <AlertCircle size={28} className="mx-auto mb-2" style={{ color:"var(--text-muted)" }} />
          <p className="text-sm" style={{ color:"var(--text-muted)" }}>Select a resident to view their falls risk history</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {/* Current risk */}
          {latest && (
            <div className="rounded-2xl p-5" style={{ background:"var(--bg-card)", border:"1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Current Risk Status</h3>
                <span className="text-xs" style={{ color:"var(--text-muted)" }}>Assessed {new Date(latest.assessment_date).toLocaleDateString("en-GB")}</span>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                {(() => {
                  const cfg = RISK_CFG[latest.risk_level as keyof typeof RISK_CFG] ?? RISK_CFG.low;
                  return (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background:cfg.bg }}>
                      <span className="text-3xl font-bold" style={{ color:cfg.color }}>{latest.total_score}</span>
                      <div>
                        <div className="text-sm font-bold" style={{ color:cfg.color }}>{cfg.label}</div>
                        <div className="text-xs" style={{ color:"var(--text-muted)" }}>Morse Fall Scale</div>
                      </div>
                    </div>
                  );
                })()}
                <div className="flex gap-4 text-xs flex-wrap" style={{ color:"var(--text-secondary)" }}>
                  {latest.history_of_falls && <span className="px-2 py-1 rounded" style={{ background:"var(--input-bg)" }}>History of falls +25</span>}
                  {latest.secondary_diagnosis && <span className="px-2 py-1 rounded" style={{ background:"var(--input-bg)" }}>Secondary diagnosis +15</span>}
                  {latest.iv_access && <span className="px-2 py-1 rounded" style={{ background:"var(--input-bg)" }}>IV access +20</span>}
                  {latest.ambulatory_aid !== "none" && <span className="px-2 py-1 rounded" style={{ background:"var(--input-bg)" }}>Aid: {latest.ambulatory_aid}</span>}
                  {latest.gait !== "normal" && <span className="px-2 py-1 rounded" style={{ background:"var(--input-bg)" }}>Gait: {latest.gait}</span>}
                  {latest.mental_status === "overestimates" && <span className="px-2 py-1 rounded" style={{ background:"var(--input-bg)" }}>Mental status +15</span>}
                </div>
              </div>
              {latest.action_plan && (
                <div className="mt-3 text-xs p-3 rounded-xl" style={{ background:"var(--bg-card)", color:"var(--text-secondary)" }}>
                  <span style={{ color:"var(--text-muted)" }}>Action plan: </span>{latest.action_plan}
                </div>
              )}
              {latest.next_review_date && (
                <div className="mt-2 text-xs" style={{ color:"#fbbf24" }}>Next review: {new Date(latest.next_review_date).toLocaleDateString("en-GB")}</div>
              )}
            </div>
          )}

          {/* History */}
          {assessments.length === 0 ? (
            <div className="text-center py-12 rounded-2xl" style={{ background:"var(--bg-card)", border:"1px solid var(--border)" }}>
              <p className="text-sm" style={{ color:"var(--text-muted)" }}>No assessments recorded yet.</p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid var(--border)" }}>
              <div className="px-4 py-3" style={{ background:"var(--bg-card)", borderBottom:"1px solid var(--border)" }}>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color:"var(--text-muted)" }}>Assessment History</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom:"1px solid var(--border)" }}>
                    {["Date","Score","Risk Level","Assessed By","Next Review"].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs" style={{ color:"var(--text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assessments.map(a => {
                    const cfg = RISK_CFG[a.risk_level as keyof typeof RISK_CFG] ?? RISK_CFG.low;
                    return (
                      <tr key={a.id} style={{ borderBottom:"1px solid var(--border)" }}>
                        <td className="px-4 py-3 text-sm text-white">{new Date(a.assessment_date).toLocaleDateString("en-GB")}</td>
                        <td className="px-4 py-3 text-sm font-bold" style={{ color:cfg.color }}>{a.total_score}</td>
                        <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-lg" style={{ background:cfg.bg, color:cfg.color }}>{cfg.label}</span></td>
                        <td className="px-4 py-3 text-xs" style={{ color:"var(--text-secondary)" }}>{a.assessed_by_name ?? "—"}</td>
                        <td className="px-4 py-3 text-xs" style={{ color:"var(--text-muted)" }}>{a.next_review_date ? new Date(a.next_review_date).toLocaleDateString("en-GB") : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ background:"var(--bg-elevated)", border:"1px solid rgba(124,58,237,0.25)" }}>
            <div className="flex items-center justify-between mb-5"><h3 className="text-base font-bold text-white">New Falls Risk Assessment</h3><button onClick={()=>setShowCreate(false)} style={{color:"var(--text-muted)"}}><X size={18}/></button></div>

            <ScorePreview form={form as Record<string, string | boolean>} />

            <div className="space-y-3 mt-4">
              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Assessment Date</label>
              <input type="date" value={form.assessment_date} onChange={e=>setForm(f=>({...f,assessment_date:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}/></div>

              {/* Boolean items */}
              <div className="space-y-2">
                {[
                  { key:"history_of_falls", label:"History of falls", pts:25 },
                  { key:"secondary_diagnosis", label:"Secondary medical diagnosis", pts:15 },
                  { key:"iv_access", label:"IV access / heparin lock", pts:20 },
                ].map(({ key, label, pts }) => (
                  <label key={key} className="flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer" style={{ background:"var(--bg-card)", border:"1px solid var(--border)" }}>
                    <div>
                      <div className="text-sm text-white">{label}</div>
                      <div className="text-xs" style={{ color:"var(--text-muted)" }}>+{pts} points if yes</div>
                    </div>
                    <input type="checkbox" checked={form[key as keyof typeof form] as boolean} onChange={e=>setForm(f=>({...f,[key]:e.target.checked}))} className="w-4 h-4 rounded"/>
                  </label>
                ))}
              </div>

              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Ambulatory Aid (0/15/30 pts)</label>
              <select value={form.ambulatory_aid} onChange={e=>setForm(f=>({...f,ambulatory_aid:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                <option value="none">None / Bedrest / Nurse assist (0)</option>
                <option value="crutches">Crutches / Cane / Walker (15)</option>
                <option value="furniture">Furniture (30)</option>
              </select></div>

              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Gait (0/10/20 pts)</label>
              <select value={form.gait} onChange={e=>setForm(f=>({...f,gait:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                <option value="normal">Normal / Bedrest / Immobile (0)</option>
                <option value="weak">Weak (10)</option>
                <option value="impaired">Impaired (20)</option>
              </select></div>

              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Mental Status (0/15 pts)</label>
              <select value={form.mental_status} onChange={e=>setForm(f=>({...f,mental_status:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                <option value="oriented">Oriented to own ability (0)</option>
                <option value="overestimates">Overestimates / forgets limitations (15)</option>
              </select></div>

              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Action Plan</label>
              <textarea rows={2} value={form.action_plan} onChange={e=>setForm(f=>({...f,action_plan:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={inputStyle} placeholder="Interventions to reduce fall risk…"/></div>

              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Next Review Date</label>
              <input type="date" value={form.next_review_date} onChange={e=>setForm(f=>({...f,next_review_date:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}/></div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowCreate(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{background:"var(--border)",color:"var(--text-secondary)",border:"1px solid var(--border-strong)"}}>Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{background:"linear-gradient(135deg,#7c3aed,#3b82f6)"}}>{saving?"Saving…":"Save Assessment"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
