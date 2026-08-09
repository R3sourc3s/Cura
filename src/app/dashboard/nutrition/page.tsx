"use client";

import { useEffect, useState, useCallback } from "react";
import { Utensils, Plus, X, Droplets, Syringe, Activity } from "lucide-react";
import { useToast } from "@/components/Toast";
import type { PEGChart, PEGFeedRecord } from "@/types";

interface FluidRecord {
  id: number; resident: number; recorded_by_name?: string;
  recorded_at: string; fluid_type: string; amount_ml: number; notes: string;
}
interface MealRecord {
  id: number; resident: number; recorded_by_name?: string;
  recorded_at: string; meal_type: string; completion_percent: number; appetite: string; notes: string;
}
interface Resident { id: number; full_name: string; }

const FLUID_TYPES: Record<string,string> = { water:"Water", tea:"Tea", coffee:"Coffee", juice:"Juice", milk:"Milk", supplement:"Supplement", soup:"Soup", iv:"IV Fluids", other:"Other" };
const MEAL_TYPES: Record<string,string> = { breakfast:"Breakfast", lunch:"Lunch", dinner:"Dinner", snack:"Snack" };
const APPETITE_CFG: Record<string,{color:string;bg:string}> = { good:{color:"var(--c-green)",bg:"rgba(52,211,153,0.1)"}, fair:{color:"var(--c-amber)",bg:"rgba(251,191,36,0.1)"}, poor:{color:"var(--c-red)",bg:"rgba(239,68,68,0.1)"} };
const FLUID_TARGET_ML = 1500;

function isoDate(d: Date) { return d.toISOString().slice(0,10); }
const inputStyle = { background:"var(--input-bg)", border:"1px solid var(--border-strong)", color:"var(--text-primary)" };

export default function NutritionPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResident, setSelectedResident] = useState<number | "">("");
  const [date, setDate] = useState(isoDate(new Date()));
  const [fluids, setFluids] = useState<FluidRecord[]>([]);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFluid, setShowFluid] = useState(false);
  const [showMeal, setShowMeal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [fluidForm, setFluidForm] = useState({ fluid_type:"water", amount_ml:"200", notes:"" });
  const [mealForm, setMealForm] = useState({ meal_type:"breakfast", completion_percent:"100", appetite:"good", notes:"" });

  // PEG / enteral feeding chart
  const [pegChart, setPegChart] = useState<PEGChart | null>(null);
  const [pegLoading, setPegLoading] = useState(false);
  const [showPegSetup, setShowPegSetup] = useState(false);
  const [showFeedLog, setShowFeedLog] = useState(false);
  const [savingPeg, setSavingPeg] = useState(false);
  const [pegForm, setPegForm] = useState({ tube_type:"peg", tube_size_fr:"", feed_regimen:"", feed_rate_ml_per_hr:"", water_flush_ml:"30" });
  const [feedForm, setFeedForm] = useState({ entry_type:"feed", volume_ml:"", site_condition:"normal", tolerated_well:true, notes:"" });

  const loadPeg = useCallback(() => {
    if (!selectedResident) { setPegChart(null); return; }
    setPegLoading(true);
    fetch(`/api/v1/nutrition/peg-charts/?resident=${selectedResident}`, { credentials:"include" })
      .then(r => r.ok ? r.json() : { results:[] })
      .then(d => setPegChart((d.results ?? d)[0] ?? null))
      .catch(console.error).finally(() => setPegLoading(false));
  }, [selectedResident]);

  useEffect(() => { loadPeg(); }, [loadPeg]);

  async function handleSetupPeg() {
    if (!selectedResident) return;
    setSavingPeg(true);
    try {
      const body = {
        resident: selectedResident, tube_type: pegForm.tube_type, tube_size_fr: pegForm.tube_size_fr,
        feed_regimen: pegForm.feed_regimen,
        feed_rate_ml_per_hr: pegForm.feed_rate_ml_per_hr || null,
        water_flush_ml: Number(pegForm.water_flush_ml) || 0,
      };
      const res = await fetch("/api/v1/nutrition/peg-charts/", { method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
      if (res.ok) { const n = await res.json(); setPegChart(n); setShowPegSetup(false); toast("PEG chart created.", "success"); }
      else { toast("Could not create PEG chart.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
    finally { setSavingPeg(false); }
  }

  async function handleLogFeed() {
    if (!pegChart) return;
    setSavingPeg(true);
    try {
      const body = {
        peg_chart: pegChart.id, entry_type: feedForm.entry_type,
        volume_ml: feedForm.volume_ml ? Number(feedForm.volume_ml) : null,
        site_condition: feedForm.entry_type === "site_check" ? feedForm.site_condition : "",
        tolerated_well: feedForm.tolerated_well, notes: feedForm.notes,
      };
      const res = await fetch("/api/v1/nutrition/peg-feeds/", { method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
      if (res.ok) {
        const n: PEGFeedRecord = await res.json();
        setPegChart(p => p ? { ...p, recent_feeds: [n, ...(p.recent_feeds ?? [])].slice(0, 10) } : p);
        setShowFeedLog(false);
        setFeedForm({ entry_type:"feed", volume_ml:"", site_condition:"normal", tolerated_well:true, notes:"" });
        toast("Entry logged.", "success");
      } else { toast("Could not log entry.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
    finally { setSavingPeg(false); }
  }

  useEffect(() => {
    fetch("/api/v1/residents/?page_size=200&is_active=true", { credentials:"include" })
      .then(r => r.ok ? r.json() : { results:[] })
      .then(d => setResidents(d.results ?? d));
  }, []);

  const load = useCallback(() => {
    if (!selectedResident) { setFluids([]); setMeals([]); return; }
    setLoading(true);
    Promise.all([
      fetch(`/api/v1/nutrition/fluid/?resident=${selectedResident}&recorded_at__date__gte=${date}&recorded_at__date__lte=${date}&page_size=100`, { credentials:"include" }).then(r => r.ok ? r.json() : { results:[] }),
      fetch(`/api/v1/nutrition/meals/?resident=${selectedResident}&recorded_at__date__gte=${date}&recorded_at__date__lte=${date}&page_size=100`, { credentials:"include" }).then(r => r.ok ? r.json() : { results:[] }),
    ]).then(([f, m]) => { setFluids(f.results ?? f); setMeals(m.results ?? m); })
      .catch(console.error).finally(() => setLoading(false));
  }, [selectedResident, date]);

  useEffect(() => { load(); }, [load]);

  async function handleAddFluid() {
    if (!selectedResident) return;
    setSaving(true);
    try {
      const body = { resident: selectedResident, fluid_type: fluidForm.fluid_type, amount_ml: Number(fluidForm.amount_ml), notes: fluidForm.notes };
      const res = await fetch("/api/v1/nutrition/fluid/", { method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
      if (res.ok) { const n = await res.json(); setFluids(p => [...p, n]); setShowFluid(false); setFluidForm({ fluid_type:"water", amount_ml:"200", notes:"" }); toast("Fluid intake logged.", "success"); }
      else { toast("Could not log fluid intake.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
    finally { setSaving(false); }
  }

  async function handleAddMeal() {
    if (!selectedResident) return;
    setSaving(true);
    try {
      const body = { resident: selectedResident, meal_type: mealForm.meal_type, completion_percent: Number(mealForm.completion_percent), appetite: mealForm.appetite, notes: mealForm.notes };
      const res = await fetch("/api/v1/nutrition/meals/", { method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
      if (res.ok) { const n = await res.json(); setMeals(p => [...p, n]); setShowMeal(false); setMealForm({ meal_type:"breakfast", completion_percent:"100", appetite:"good", notes:"" }); toast("Meal logged.", "success"); }
      else { toast("Could not log meal.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
    finally { setSaving(false); }
  }

  const totalFluidMl = fluids.reduce((acc, f) => acc + f.amount_ml, 0);
  const fluidPct = Math.min(100, Math.round(totalFluidMl / FLUID_TARGET_ML * 100));
  const fluidColor = fluidPct >= 80 ? "var(--c-green)" : fluidPct >= 50 ? "var(--c-amber)" : "var(--c-red)";

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:"rgba(45, 212, 191,0.12)", border:"1px solid rgba(45, 212, 191,0.2)" }}>
            <Utensils size={16} style={{ color:"var(--c-teal2)" }} />
          </div>
          <div><h1 className="text-lg font-bold text-white">Fluid & Nutrition</h1><p className="text-xs" style={{ color:"var(--text-muted)" }}>Daily intake monitoring</p></div>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedResident} onChange={e => setSelectedResident(e.target.value ? Number(e.target.value) : "")} className="text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
            <option value="">Select resident…</option>
            {residents.map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
          </select>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} />
        </div>
      </div>

      {!selectedResident ? (
        <div className="text-center py-20 rounded-2xl" style={{ background:"rgba(var(--fg-rgb),0.02)", border:"1px solid var(--border)" }}>
          <Utensils size={28} className="mx-auto mb-2" style={{ color:"var(--text-muted)" }} />
          <p className="text-sm" style={{ color:"var(--text-muted)" }}>Select a resident to view their nutrition record</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Fluid section */}
          <div className="rounded-2xl p-5 space-y-4" style={{ background:"rgba(var(--fg-rgb),0.02)", border:"1px solid var(--border)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets size={15} style={{ color:"var(--c-teal2)" }} />
                <h3 className="text-sm font-semibold text-white">Fluid Intake</h3>
              </div>
              <button onClick={() => setShowFluid(true)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background:"rgba(45, 212, 191,0.1)", color:"var(--c-teal2)", border:"1px solid rgba(45, 212, 191,0.2)" }}><Plus size={11} /> Add</button>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span style={{ color:"var(--text-secondary)" }}>Daily target: {FLUID_TARGET_ML}ml</span>
                <span style={{ color: fluidColor, fontWeight: 600 }}>{totalFluidMl}ml ({fluidPct}%)</span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background:"var(--bg-card-hover)" }}>
                <div className="h-2 rounded-full transition-all" style={{ width:`${fluidPct}%`, background: fluidColor }} />
              </div>
            </div>

            {/* Fluid log */}
            {fluids.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color:"var(--text-muted)" }}>No fluid intake logged today.</p>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {fluids.map(f => (
                  <div key={f.id} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ background:"rgba(var(--fg-rgb),0.02)" }}>
                    <span className="text-xs" style={{ color:"var(--text-muted)" }}>{new Date(f.recorded_at).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</span>
                    <span className="text-xs font-medium text-white flex-1">{FLUID_TYPES[f.fluid_type] ?? f.fluid_type}</span>
                    <span className="text-xs font-semibold" style={{ color:"var(--c-teal2)" }}>{f.amount_ml}ml</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Meals section */}
          <div className="rounded-2xl p-5 space-y-4" style={{ background:"rgba(var(--fg-rgb),0.02)", border:"1px solid var(--border)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils size={15} style={{ color:"var(--c-green)" }} />
                <h3 className="text-sm font-semibold text-white">Meals</h3>
              </div>
              <button onClick={() => setShowMeal(true)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background:"rgba(52,211,153,0.1)", color:"var(--c-green)", border:"1px solid rgba(52,211,153,0.2)" }}><Plus size={11} /> Add</button>
            </div>

            {/* Meal grid */}
            <div className="grid grid-cols-2 gap-2">
              {["breakfast","lunch","dinner","snack"].map(mt => {
                const entry = meals.find(m => m.meal_type === mt);
                return (
                  <div key={mt} className="rounded-xl p-3 text-center" style={{ background: entry ? "rgba(52,211,153,0.05)" : "rgba(var(--fg-rgb),0.02)", border: entry ? "1px solid rgba(52,211,153,0.15)" : "1px solid rgba(var(--fg-rgb),0.06)" }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: entry ? "var(--c-green)" : "var(--text-muted)" }}>{MEAL_TYPES[mt]}</div>
                    {entry ? (
                      <>
                        <div className="text-lg font-bold" style={{ color:"var(--text-primary)" }}>{entry.completion_percent}%</div>
                        <div className="text-xs mt-0.5 px-1.5 py-0.5 rounded w-fit mx-auto" style={{ background: APPETITE_CFG[entry.appetite]?.bg, color: APPETITE_CFG[entry.appetite]?.color }}>
                          {entry.appetite}
                        </div>
                      </>
                    ) : (
                      <div className="text-xs" style={{ color:"var(--text-muted)" }}>Not recorded</div>
                    )}
                  </div>
                );
              })}
            </div>

            {meals.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {meals.filter(m => m.notes).map(m => (
                  <div key={m.id} className="text-xs px-3 py-2 rounded-lg" style={{ background:"rgba(var(--fg-rgb),0.02)", color:"var(--text-muted)" }}>
                    <span className="font-medium" style={{ color:"var(--text-secondary)" }}>{MEAL_TYPES[m.meal_type]}: </span>{m.notes}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PEG / enteral feeding chart */}
      {selectedResident && !pegLoading && (
        <div className="rounded-2xl p-5 space-y-4" style={{ background:"rgba(var(--fg-rgb),0.02)", border:"1px solid var(--border)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Syringe size={15} style={{ color:"#a78bfa" }} />
              <h3 className="text-sm font-semibold text-white">PEG / Enteral Feeding Chart</h3>
            </div>
            {pegChart ? (
              <button onClick={() => setShowFeedLog(true)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background:"rgba(139,92,246,0.1)", color:"#a78bfa", border:"1px solid rgba(139,92,246,0.2)" }}>
                <Plus size={11} /> Log Feed / Check
              </button>
            ) : (
              <button onClick={() => setShowPegSetup(true)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background:"rgba(139,92,246,0.1)", color:"#a78bfa", border:"1px solid rgba(139,92,246,0.2)" }}>
                <Plus size={11} /> Set Up PEG Chart
              </button>
            )}
          </div>

          {!pegChart ? (
            <p className="text-xs text-center py-4" style={{ color:"var(--text-muted)" }}>No feeding tube on record for this resident.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="rounded-lg px-2.5 py-2" style={{ background:"rgba(var(--fg-rgb),0.03)" }}>
                  <div style={{ color:"var(--text-muted)" }}>Tube</div>
                  <div className="font-medium text-white mt-0.5">{pegChart.tube_type.toUpperCase()}{pegChart.tube_size_fr ? ` · ${pegChart.tube_size_fr}` : ""}</div>
                </div>
                <div className="rounded-lg px-2.5 py-2" style={{ background:"rgba(var(--fg-rgb),0.03)" }}>
                  <div style={{ color:"var(--text-muted)" }}>Feed rate</div>
                  <div className="font-medium text-white mt-0.5">{pegChart.feed_rate_ml_per_hr ? `${pegChart.feed_rate_ml_per_hr} ml/hr` : "—"}</div>
                </div>
                <div className="rounded-lg px-2.5 py-2" style={{ background:"rgba(var(--fg-rgb),0.03)" }}>
                  <div style={{ color:"var(--text-muted)" }}>Water flush</div>
                  <div className="font-medium text-white mt-0.5">{pegChart.water_flush_ml}ml</div>
                </div>
                <div className="rounded-lg px-2.5 py-2" style={{ background:"rgba(var(--fg-rgb),0.03)" }}>
                  <div style={{ color:"var(--text-muted)" }}>Regimen</div>
                  <div className="font-medium text-white mt-0.5 truncate" title={pegChart.feed_regimen}>{pegChart.feed_regimen || "—"}</div>
                </div>
              </div>

              {pegChart.recent_feeds && pegChart.recent_feeds.length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {pegChart.recent_feeds.map(f => (
                    <div key={f.id} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ background:"rgba(var(--fg-rgb),0.02)" }}>
                      <Activity size={11} style={{ color: f.tolerated_well ? "var(--c-green)" : "var(--c-red)" }} />
                      <span className="text-xs" style={{ color:"var(--text-muted)" }}>{new Date(f.recorded_at).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</span>
                      <span className="text-xs font-medium text-white flex-1 capitalize">{f.entry_type.replace("_"," ")}</span>
                      {f.volume_ml != null && <span className="text-xs" style={{ color:"#a78bfa" }}>{f.volume_ml}ml</span>}
                      {f.site_condition && <span className="text-xs" style={{ color:"var(--text-muted)" }}>{f.site_condition}</span>}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* PEG setup modal */}
      {showPegSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background:"var(--bg-elevated)", border:"1px solid rgba(139,92,246,0.25)" }}>
            <div className="flex items-center justify-between mb-5"><h3 className="text-base font-bold text-white">Set Up PEG Chart</h3><button onClick={()=>setShowPegSetup(false)} style={{color:"var(--text-muted)"}}><X size={18}/></button></div>
            <div className="space-y-3">
              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Tube Type</label>
              <select value={pegForm.tube_type} onChange={e=>setPegForm(f=>({...f,tube_type:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                <option value="peg">PEG</option><option value="rig">RIG</option><option value="ng">NG</option><option value="jejunostomy">Jejunostomy</option>
              </select></div>
              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Tube Size (Fr)</label>
              <input value={pegForm.tube_size_fr} onChange={e=>setPegForm(f=>({...f,tube_size_fr:e.target.value}))} placeholder="e.g. 16Fr" className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}/></div>
              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Feed Regimen</label>
              <input value={pegForm.feed_regimen} onChange={e=>setPegForm(f=>({...f,feed_regimen:e.target.value}))} placeholder="e.g. Nutrison 1.5kcal, 20:00–08:00" className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Rate (ml/hr)</label>
                <input type="number" min="0" value={pegForm.feed_rate_ml_per_hr} onChange={e=>setPegForm(f=>({...f,feed_rate_ml_per_hr:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}/></div>
                <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Water flush (ml)</label>
                <input type="number" min="0" value={pegForm.water_flush_ml} onChange={e=>setPegForm(f=>({...f,water_flush_ml:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}/></div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowPegSetup(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{background:"var(--bg-card-hover)",color:"var(--text-secondary)",border:"1px solid var(--bg-card-hover)"}}>Cancel</button>
              <button onClick={handleSetupPeg} disabled={savingPeg} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{background:"linear-gradient(135deg,#8b5cf6,#7c3aed)"}}>{savingPeg?"Saving…":"Create Chart"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Log feed / check modal */}
      {showFeedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background:"var(--bg-elevated)", border:"1px solid rgba(139,92,246,0.25)" }}>
            <div className="flex items-center justify-between mb-5"><h3 className="text-base font-bold text-white">Log Feed / Site Check</h3><button onClick={()=>setShowFeedLog(false)} style={{color:"var(--text-muted)"}}><X size={18}/></button></div>
            <div className="space-y-3">
              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Entry Type</label>
              <select value={feedForm.entry_type} onChange={e=>setFeedForm(f=>({...f,entry_type:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                <option value="feed">Feed Administered</option><option value="flush">Water Flush</option>
                <option value="site_check">Site Check</option><option value="medication">Medication via Tube</option>
              </select></div>
              {feedForm.entry_type !== "site_check" && (
                <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Volume (ml)</label>
                <input type="number" min="0" value={feedForm.volume_ml} onChange={e=>setFeedForm(f=>({...f,volume_ml:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}/></div>
              )}
              {feedForm.entry_type === "site_check" && (
                <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Site Condition</label>
                <select value={feedForm.site_condition} onChange={e=>setFeedForm(f=>({...f,site_condition:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                  <option value="normal">Normal</option><option value="redness">Redness</option><option value="leaking">Leaking</option>
                  <option value="granulation">Granulation Tissue</option><option value="infected">Signs of Infection</option>
                </select></div>
              )}
              <label className="flex items-center gap-2 text-xs" style={{color:"var(--text-secondary)"}}>
                <input type="checkbox" checked={feedForm.tolerated_well} onChange={e=>setFeedForm(f=>({...f,tolerated_well:e.target.checked}))} />
                Tolerated well
              </label>
              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Notes</label>
              <input value={feedForm.notes} onChange={e=>setFeedForm(f=>({...f,notes:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="Optional"/></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowFeedLog(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{background:"var(--bg-card-hover)",color:"var(--text-secondary)",border:"1px solid var(--bg-card-hover)"}}>Cancel</button>
              <button onClick={handleLogFeed} disabled={savingPeg} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{background:"linear-gradient(135deg,#8b5cf6,#7c3aed)"}}>{savingPeg?"Saving…":"Log Entry"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add fluid modal */}
      {showFluid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background:"var(--bg-elevated)", border:"1px solid rgba(45, 212, 191,0.25)" }}>
            <div className="flex items-center justify-between mb-5"><h3 className="text-base font-bold text-white">Log Fluid Intake</h3><button onClick={()=>setShowFluid(false)} style={{color:"var(--text-muted)"}}><X size={18}/></button></div>
            <div className="space-y-3">
              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Type</label>
              <select value={fluidForm.fluid_type} onChange={e=>setFluidForm(f=>({...f,fluid_type:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                {Object.entries(FLUID_TYPES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select></div>
              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Amount (ml)</label>
              <input type="number" min="0" max="2000" value={fluidForm.amount_ml} onChange={e=>setFluidForm(f=>({...f,amount_ml:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}/></div>
              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Notes</label>
              <input value={fluidForm.notes} onChange={e=>setFluidForm(f=>({...f,notes:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="Optional"/></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowFluid(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{background:"var(--bg-card-hover)",color:"var(--text-secondary)",border:"1px solid var(--bg-card-hover)"}}>Cancel</button>
              <button onClick={handleAddFluid} disabled={saving||!fluidForm.amount_ml} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{background:"linear-gradient(135deg,#10b981,#0d9488)"}}>{saving?"Saving…":"Log"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add meal modal */}
      {showMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background:"var(--bg-elevated)", border:"1px solid rgba(52,211,153,0.25)" }}>
            <div className="flex items-center justify-between mb-5"><h3 className="text-base font-bold text-white">Log Meal</h3><button onClick={()=>setShowMeal(false)} style={{color:"var(--text-muted)"}}><X size={18}/></button></div>
            <div className="space-y-3">
              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Meal</label>
              <select value={mealForm.meal_type} onChange={e=>setMealForm(f=>({...f,meal_type:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                {Object.entries(MEAL_TYPES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select></div>
              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Completion %</label>
              <select value={mealForm.completion_percent} onChange={e=>setMealForm(f=>({...f,completion_percent:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                {[0,25,50,75,100].map(v=><option key={v} value={v}>{v}%</option>)}
              </select></div>
              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Appetite</label>
              <select value={mealForm.appetite} onChange={e=>setMealForm(f=>({...f,appetite:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                <option value="good">Good</option><option value="fair">Fair</option><option value="poor">Poor</option>
              </select></div>
              <div><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Notes</label>
              <input value={mealForm.notes} onChange={e=>setMealForm(f=>({...f,notes:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="Optional"/></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowMeal(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{background:"var(--bg-card-hover)",color:"var(--text-secondary)",border:"1px solid var(--bg-card-hover)"}}>Cancel</button>
              <button onClick={handleAddMeal} disabled={saving} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{background:"linear-gradient(135deg,var(--c-green),#10b981)"}}>{saving?"Saving…":"Log"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
