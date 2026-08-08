"use client";

import { useEffect, useState, useCallback } from "react";
import { Utensils, Plus, X, Droplets } from "lucide-react";
import { useToast } from "@/components/Toast";

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
