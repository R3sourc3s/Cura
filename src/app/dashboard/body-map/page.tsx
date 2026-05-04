"use client";

import { useEffect, useState, useCallback } from "react";
import { Stethoscope, Plus, X, CheckCircle } from "lucide-react";

interface WoundRecord {
  id: number; resident: number; resident_name?: string;
  wound_type: string; grade: string;
  body_side: "front" | "back" | "left" | "right";
  location_x: number; location_y: number;
  description: string; first_observed: string;
  is_active: boolean; created_at: string;
  latest_assessment?: WoundAssessment;
}

interface WoundAssessment {
  id: number; wound: number;
  assessment_date: string;
  length_cm: number | null; width_cm: number | null; depth_cm: number | null;
  appearance: string; treatment: string; dressing_used: string;
  next_review: string | null; notes: string; created_at: string;
  assessed_by_name?: string;
}

interface Resident { id: number; full_name: string; }

const WOUND_TYPES = ["pressure_ulcer","laceration","bruise","surgical","skin_tear","burn","other"];
const WOUND_TYPE_LABEL: Record<string,string> = { pressure_ulcer:"Pressure Ulcer", laceration:"Laceration", bruise:"Bruise", surgical:"Surgical", skin_tear:"Skin Tear", burn:"Burn", other:"Other" };
const GRADES = ["1","2","3","4","unstageable"];
const GRADE_LABEL: Record<string,string> = { "1":"Grade 1","2":"Grade 2","3":"Grade 3","4":"Grade 4","unstageable":"Unstageable" };
const SIDES = [
  { id: "front" as const, label: "Front" },
  { id: "back"  as const, label: "Back"  },
  { id: "left"  as const, label: "Left"  },
  { id: "right" as const, label: "Right" },
];

const inputStyle = { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.8)" };

function gradeColor(grade: string) {
  if (grade === "1") return "#34d399";
  if (grade === "2") return "#fbbf24";
  if (grade === "3") return "#fb923c";
  if (grade === "4" || grade === "unstageable") return "#f87171";
  return "#a78bfa";
}

function isoDate(d: Date) { return d.toISOString().slice(0,10); }

// ── Body SVG diagrams ─────────────────────────────────────────────────────────

function BodyFront() {
  const s = "none";
  const c = "rgba(255,255,255,0.22)";
  const c2 = "rgba(255,255,255,0.13)";
  const sw = 1.5;
  return (
    <g>
      {/* Head */}
      <ellipse cx="100" cy="28" rx="21" ry="25" fill={s} stroke={c} strokeWidth={sw}/>
      {/* Neck */}
      <rect x="92" y="52" width="16" height="13" rx="4" fill={s} stroke={c2} strokeWidth={sw}/>
      {/* Shoulders */}
      <path d="M60 68 Q45 68 38 78 L30 90" fill={s} stroke={c} strokeWidth={sw}/>
      <path d="M140 68 Q155 68 162 78 L170 90" fill={s} stroke={c} strokeWidth={sw}/>
      {/* Torso */}
      <rect x="62" y="65" width="76" height="88" rx="10" fill={s} stroke={c} strokeWidth={sw}/>
      {/* Clavicle lines */}
      <line x1="100" y1="66" x2="62" y2="74" stroke={c2} strokeWidth="1"/>
      <line x1="100" y1="66" x2="138" y2="74" stroke={c2} strokeWidth="1"/>
      {/* Chest / ribs suggestion */}
      <ellipse cx="83" cy="88" rx="10" ry="7" fill={s} stroke={c2} strokeWidth="1"/>
      <ellipse cx="117" cy="88" rx="10" ry="7" fill={s} stroke={c2} strokeWidth="1"/>
      {/* Abdomen line */}
      <line x1="100" y1="105" x2="100" y2="150" stroke={c2} strokeWidth="1" strokeDasharray="3,3"/>
      {/* Navel */}
      <circle cx="100" cy="130" r="2.5" fill={s} stroke={c2} strokeWidth="1"/>
      {/* Arms */}
      <rect x="28" y="68" width="30" height="78" rx="13" fill={s} stroke={c} strokeWidth={sw}/>
      <rect x="142" y="68" width="30" height="78" rx="13" fill={s} stroke={c} strokeWidth={sw}/>
      {/* Hands */}
      <ellipse cx="43" cy="155" rx="13" ry="9" fill={s} stroke={c2} strokeWidth="1"/>
      <ellipse cx="157" cy="155" rx="13" ry="9" fill={s} stroke={c2} strokeWidth="1"/>
      {/* Hips */}
      <path d="M62 153 Q58 165 60 175 L62 175" fill={s} stroke={c} strokeWidth={sw}/>
      <path d="M138 153 Q142 165 140 175 L138 175" fill={s} stroke={c} strokeWidth={sw}/>
      {/* Pelvis */}
      <path d="M62 153 Q100 168 138 153" fill={s} stroke={c2} strokeWidth="1"/>
      {/* Legs */}
      <rect x="62" y="158" width="34" height="98" rx="14" fill={s} stroke={c} strokeWidth={sw}/>
      <rect x="104" y="158" width="34" height="98" rx="14" fill={s} stroke={c} strokeWidth={sw}/>
      {/* Knees */}
      <ellipse cx="79" cy="222" rx="13" ry="8" fill={s} stroke={c2} strokeWidth="1"/>
      <ellipse cx="121" cy="222" rx="13" ry="8" fill={s} stroke={c2} strokeWidth="1"/>
      {/* Feet */}
      <ellipse cx="79" cy="260" rx="15" ry="7" fill={s} stroke={c2} strokeWidth="1"/>
      <ellipse cx="121" cy="260" rx="15" ry="7" fill={s} stroke={c2} strokeWidth="1"/>
    </g>
  );
}

function BodyBack() {
  const s = "none";
  const c = "rgba(255,255,255,0.22)";
  const c2 = "rgba(255,255,255,0.13)";
  const sw = 1.5;
  return (
    <g>
      {/* Head */}
      <ellipse cx="100" cy="28" rx="21" ry="25" fill={s} stroke={c} strokeWidth={sw}/>
      {/* Neck */}
      <rect x="92" y="52" width="16" height="13" rx="4" fill={s} stroke={c2} strokeWidth={sw}/>
      {/* Shoulders */}
      <path d="M60 68 Q45 68 38 78 L30 90" fill={s} stroke={c} strokeWidth={sw}/>
      <path d="M140 68 Q155 68 162 78 L170 90" fill={s} stroke={c} strokeWidth={sw}/>
      {/* Torso / back */}
      <rect x="62" y="65" width="76" height="88" rx="10" fill={s} stroke={c} strokeWidth={sw}/>
      {/* Spine */}
      <line x1="100" y1="68" x2="100" y2="153" stroke={c2} strokeWidth="1.5" strokeDasharray="4,3"/>
      {/* Shoulder blades */}
      <ellipse cx="82" cy="90" rx="12" ry="16" fill={s} stroke={c2} strokeWidth="1"/>
      <ellipse cx="118" cy="90" rx="12" ry="16" fill={s} stroke={c2} strokeWidth="1"/>
      {/* Lumbar */}
      <ellipse cx="100" cy="140" rx="14" ry="8" fill={s} stroke={c2} strokeWidth="1"/>
      {/* Arms */}
      <rect x="28" y="68" width="30" height="78" rx="13" fill={s} stroke={c} strokeWidth={sw}/>
      <rect x="142" y="68" width="30" height="78" rx="13" fill={s} stroke={c} strokeWidth={sw}/>
      {/* Hands */}
      <ellipse cx="43" cy="155" rx="13" ry="9" fill={s} stroke={c2} strokeWidth="1"/>
      <ellipse cx="157" cy="155" rx="13" ry="9" fill={s} stroke={c2} strokeWidth="1"/>
      {/* Hips */}
      <path d="M62 153 Q100 170 138 153" fill={s} stroke={c2} strokeWidth="1"/>
      {/* Legs */}
      <rect x="62" y="158" width="34" height="98" rx="14" fill={s} stroke={c} strokeWidth={sw}/>
      <rect x="104" y="158" width="34" height="98" rx="14" fill={s} stroke={c} strokeWidth={sw}/>
      {/* Knee hollows */}
      <ellipse cx="79" cy="222" rx="11" ry="7" fill={s} stroke={c2} strokeWidth="1"/>
      <ellipse cx="121" cy="222" rx="11" ry="7" fill={s} stroke={c2} strokeWidth="1"/>
      {/* Heels */}
      <ellipse cx="79" cy="260" rx="12" ry="7" fill={s} stroke={c2} strokeWidth="1"/>
      <ellipse cx="121" cy="260" rx="12" ry="7" fill={s} stroke={c2} strokeWidth="1"/>
      {/* Sacrum / coccyx area */}
      <ellipse cx="100" cy="158" rx="16" ry="7" fill={s} stroke={c2} strokeWidth="1" opacity="0.7"/>
    </g>
  );
}

function BodyLeft() {
  const s = "none";
  const c = "rgba(255,255,255,0.22)";
  const c2 = "rgba(255,255,255,0.13)";
  const sw = 1.5;
  return (
    <g>
      {/* Head — profile */}
      <path d="M85 10 Q120 8 122 28 Q124 48 110 54 Q100 58 88 54 Q78 50 80 30 Q80 12 85 10Z" fill={s} stroke={c} strokeWidth={sw}/>
      {/* Ear */}
      <ellipse cx="80" cy="32" rx="5" ry="8" fill={s} stroke={c2} strokeWidth="1"/>
      {/* Nose suggestion */}
      <path d="M121 25 Q126 28 122 33" fill={s} stroke={c2} strokeWidth="1"/>
      {/* Neck */}
      <rect x="90" y="54" width="18" height="14" rx="4" fill={s} stroke={c2} strokeWidth={sw}/>
      {/* Torso side */}
      <path d="M72 68 Q68 80 68 120 Q68 150 75 158 L118 158 Q128 148 128 118 Q128 80 124 68Z" fill={s} stroke={c} strokeWidth={sw}/>
      {/* Chest / belly contour */}
      <path d="M128 75 Q138 88 136 108 Q134 128 128 138" fill={s} stroke={c2} strokeWidth="1"/>
      {/* Arm (one visible) */}
      <rect x="50" y="70" width="20" height="75" rx="10" fill={s} stroke={c} strokeWidth={sw}/>
      <ellipse cx="60" cy="150" rx="10" ry="7" fill={s} stroke={c2} strokeWidth="1"/>
      {/* Hip */}
      <path d="M75 158 Q70 168 72 180" fill={s} stroke={c} strokeWidth={sw}/>
      <path d="M118 158 Q124 168 122 180" fill={s} stroke={c} strokeWidth={sw}/>
      {/* Upper leg (thigh) */}
      <path d="M72 160 Q65 195 68 235 Q70 255 80 260 Q90 265 98 260 Q108 255 110 235 Q113 195 118 160Z" fill={s} stroke={c} strokeWidth={sw}/>
      {/* Lower leg */}
      <path d="M68 235 Q65 255 70 270 Q74 278 80 278 Q88 278 92 270 Q97 260 98 235" fill={s} stroke={c} strokeWidth={sw}/>
      {/* Foot */}
      <path d="M70 275 Q68 282 78 285 Q96 287 110 280 Q115 275 108 272" fill={s} stroke={c2} strokeWidth="1"/>
      {/* Spine line */}
      <line x1="96" y1="68" x2="96" y2="155" stroke={c2} strokeWidth="1" strokeDasharray="3,3"/>
    </g>
  );
}

function BodyRight() {
  const s = "none";
  const c = "rgba(255,255,255,0.22)";
  const c2 = "rgba(255,255,255,0.13)";
  const sw = 1.5;
  return (
    <g>
      {/* Head — profile (mirrored) */}
      <path d="M115 10 Q80 8 78 28 Q76 48 90 54 Q100 58 112 54 Q122 50 120 30 Q120 12 115 10Z" fill={s} stroke={c} strokeWidth={sw}/>
      {/* Ear */}
      <ellipse cx="120" cy="32" rx="5" ry="8" fill={s} stroke={c2} strokeWidth="1"/>
      {/* Nose suggestion */}
      <path d="M79 25 Q74 28 78 33" fill={s} stroke={c2} strokeWidth="1"/>
      {/* Neck */}
      <rect x="92" y="54" width="18" height="14" rx="4" fill={s} stroke={c2} strokeWidth={sw}/>
      {/* Torso side (mirrored) */}
      <path d="M128 68 Q132 80 132 120 Q132 150 125 158 L82 158 Q72 148 72 118 Q72 80 76 68Z" fill={s} stroke={c} strokeWidth={sw}/>
      {/* Chest / belly contour */}
      <path d="M72 75 Q62 88 64 108 Q66 128 72 138" fill={s} stroke={c2} strokeWidth="1"/>
      {/* Arm */}
      <rect x="130" y="70" width="20" height="75" rx="10" fill={s} stroke={c} strokeWidth={sw}/>
      <ellipse cx="140" cy="150" rx="10" ry="7" fill={s} stroke={c2} strokeWidth="1"/>
      {/* Hip */}
      <path d="M125 158 Q130 168 128 180" fill={s} stroke={c} strokeWidth={sw}/>
      <path d="M82 158 Q76 168 78 180" fill={s} stroke={c} strokeWidth={sw}/>
      {/* Upper leg */}
      <path d="M128 160 Q135 195 132 235 Q130 255 120 260 Q110 265 102 260 Q92 255 90 235 Q87 195 82 160Z" fill={s} stroke={c} strokeWidth={sw}/>
      {/* Lower leg */}
      <path d="M132 235 Q135 255 130 270 Q126 278 120 278 Q112 278 108 270 Q103 260 102 235" fill={s} stroke={c} strokeWidth={sw}/>
      {/* Foot */}
      <path d="M130 275 Q132 282 122 285 Q104 287 90 280 Q85 275 92 272" fill={s} stroke={c2} strokeWidth="1"/>
      {/* Spine line */}
      <line x1="104" y1="68" x2="104" y2="155" stroke={c2} strokeWidth="1" strokeDasharray="3,3"/>
    </g>
  );
}

const BODY_COMPONENTS = {
  front: BodyFront,
  back:  BodyBack,
  left:  BodyLeft,
  right: BodyRight,
};

// ─────────────────────────────────────────────────────────────────────────────

export default function BodyMapPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResident, setSelectedResident] = useState<number | "">("");
  const [side, setSide] = useState<"front"|"back"|"left"|"right">("front");
  const [wounds, setWounds] = useState<WoundRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWound, setSelectedWound] = useState<WoundRecord | null>(null);
  const [showAddWound, setShowAddWound] = useState(false);
  const [showAddAssessment, setShowAddAssessment] = useState(false);
  const [pendingClick, setPendingClick] = useState<{x:number;y:number} | null>(null);
  const [saving, setSaving] = useState(false);

  const [woundForm, setWoundForm] = useState({ wound_type:"pressure_ulcer", grade:"2", first_observed:isoDate(new Date()), description:"" });
  const [assessForm, setAssessForm] = useState({ assessment_date:isoDate(new Date()), length_cm:"", width_cm:"", depth_cm:"", appearance:"", treatment:"", dressing_used:"", next_review:"", notes:"" });

  useEffect(() => {
    fetch("/api/v1/residents/?page_size=200&is_active=true", { credentials:"include" })
      .then(r => r.ok ? r.json() : { results:[] })
      .then(d => setResidents(d.results ?? d));
  }, []);

  const loadWounds = useCallback(() => {
    if (!selectedResident) { setWounds([]); return; }
    setLoading(true);
    fetch(`/api/v1/body-map/wounds/?resident=${selectedResident}&page_size=100`, { credentials:"include" })
      .then(r => r.ok ? r.json() : { results:[] })
      .then(d => setWounds(d.results ?? d))
      .catch(console.error).finally(() => setLoading(false));
  }, [selectedResident]);

  useEffect(() => { loadWounds(); }, [loadWounds]);

  function handleBodyClick(e: React.MouseEvent<SVGSVGElement>) {
    if (!selectedResident) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = parseFloat(((e.clientX - rect.left) / rect.width * 100).toFixed(1));
    const y = parseFloat(((e.clientY - rect.top) / rect.height * 100).toFixed(1));
    setPendingClick({ x, y });
    setShowAddWound(true);
  }

  async function handleCreateWound() {
    if (!selectedResident || !pendingClick) return;
    setSaving(true);
    try {
      const body = { ...woundForm, resident: selectedResident, body_side: side, location_x: pendingClick.x, location_y: pendingClick.y, is_active: true };
      const res = await fetch("/api/v1/body-map/wounds/", { method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
      if (res.ok) {
        const n = await res.json();
        setWounds(p => [...p, n]);
        setShowAddWound(false);
        setPendingClick(null);
        setWoundForm({ wound_type:"pressure_ulcer", grade:"2", first_observed:isoDate(new Date()), description:"" });
      }
    } finally { setSaving(false); }
  }

  async function handleMarkHealed(id: number) {
    const res = await fetch(`/api/v1/body-map/wounds/${id}/`, { method:"PATCH", credentials:"include", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ is_active: false, healed_date: isoDate(new Date()) }) });
    if (res.ok) { const u = await res.json(); setWounds(p => p.map(w => w.id === id ? u : w)); if (selectedWound?.id === id) setSelectedWound(u); }
  }

  async function handleCreateAssessment() {
    if (!selectedWound) return;
    setSaving(true);
    try {
      const body = {
        wound: selectedWound.id,
        assessment_date: assessForm.assessment_date,
        length_cm: assessForm.length_cm ? Number(assessForm.length_cm) : null,
        width_cm: assessForm.width_cm ? Number(assessForm.width_cm) : null,
        depth_cm: assessForm.depth_cm ? Number(assessForm.depth_cm) : null,
        appearance: assessForm.appearance,
        treatment: assessForm.treatment,
        dressing_used: assessForm.dressing_used,
        next_review: assessForm.next_review || null,
        notes: assessForm.notes,
      };
      const res = await fetch("/api/v1/body-map/assessments/", { method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
      if (res.ok) {
        const n = await res.json();
        setWounds(p => p.map(w => w.id === selectedWound.id ? { ...w, latest_assessment: n } : w));
        setSelectedWound(s => s ? { ...s, latest_assessment: n } : s);
        setShowAddAssessment(false);
        setAssessForm({ assessment_date:isoDate(new Date()), length_cm:"", width_cm:"", depth_cm:"", appearance:"", treatment:"", dressing_used:"", next_review:"", notes:"" });
      }
    } finally { setSaving(false); }
  }

  const visibleWounds = wounds.filter(w => w.body_side === side);
  const BodyComponent = BODY_COMPONENTS[side];

  // Per-side wound counts for the tab badges
  const countBySide = (s: string) => wounds.filter(w => w.body_side === s && w.is_active).length;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:"rgba(96,165,250,0.12)", border:"1px solid rgba(96,165,250,0.2)" }}>
            <Stethoscope size={16} style={{ color:"#60a5fa" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Body Map</h1>
            <p className="text-xs" style={{ color:"rgba(255,255,255,0.35)" }}>Wound &amp; skin integrity tracker — front, back, left &amp; right</p>
          </div>
        </div>
        <select value={selectedResident} onChange={e => { setSelectedResident(e.target.value ? Number(e.target.value) : ""); setSelectedWound(null); }}
          className="text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
          <option value="">Select resident…</option>
          {residents.map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
        </select>
      </div>

      {!selectedResident ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)" }}>
          <Stethoscope size={32} className="mb-3" style={{ color:"rgba(255,255,255,0.15)" }} />
          <p className="text-sm" style={{ color:"rgba(255,255,255,0.3)" }}>Select a resident to view their body map</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Body diagram column */}
          <div className="lg:col-span-2 space-y-3">

            {/* Side tabs */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
              {SIDES.map(s => {
                const cnt = countBySide(s.id);
                const active = side === s.id;
                return (
                  <button key={s.id} onClick={() => { setSide(s.id); setSelectedWound(null); }}
                    className="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all relative"
                    style={{ background: active ? "rgba(96,165,250,0.2)" : "transparent", color: active ? "#60a5fa" : "rgba(255,255,255,0.4)", border: active ? "1px solid rgba(96,165,250,0.3)" : "1px solid transparent" }}>
                    {s.label}
                    {cnt > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full text-[9px] font-bold flex items-center justify-center"
                        style={{ background: "#f87171", color: "#fff" }}>{cnt}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Body diagram */}
            <div className="rounded-2xl p-4 flex flex-col items-center" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-xs mb-3" style={{ color:"rgba(255,255,255,0.3)" }}>
                Viewing: <span className="font-medium" style={{ color:"#60a5fa" }}>{SIDES.find(s=>s.id===side)?.label}</span>
                {" · "}Click to mark a wound
              </p>

              <svg
                viewBox="0 0 200 290"
                className="w-full max-w-[180px] cursor-crosshair select-none"
                onClick={handleBodyClick}
                style={{ overflow:"visible" }}>
                <BodyComponent />
                {visibleWounds.map(w => {
                  const cx = w.location_x * 2;
                  const cy = w.location_y * 2.9;
                  const color = gradeColor(w.grade);
                  const isSelected = selectedWound?.id === w.id;
                  return (
                    <g key={w.id} style={{ cursor:"pointer" }} onClick={ev => { ev.stopPropagation(); setSelectedWound(isSelected ? null : w); }}>
                      <circle cx={cx} cy={cy} r={isSelected ? 9 : 7} fill={color} opacity={w.is_active ? 0.85 : 0.35} stroke="white" strokeWidth={isSelected ? 2 : 1}/>
                      {isSelected && <circle cx={cx} cy={cy} r="14" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5"/>}
                      {!w.is_active && <line x1={cx-5} y1={cy-5} x2={cx+5} y2={cy+5} stroke="white" strokeWidth="1.5" opacity="0.6"/>}
                      {!w.is_active && <line x1={cx+5} y1={cy-5} x2={cx-5} y2={cy+5} stroke="white" strokeWidth="1.5" opacity="0.6"/>}
                    </g>
                  );
                })}
              </svg>

              {/* Grade legend */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {[["1","Grade 1"],["2","Grade 2"],["3","Grade 3"],["4","Grade 4"],["unstageable","Unstageable"]].map(([g,l]) => (
                  <div key={g} className="flex items-center gap-1 text-xs" style={{ color:"rgba(255,255,255,0.4)" }}>
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: gradeColor(g) }} />
                    {l}
                  </div>
                ))}
              </div>
            </div>

            {/* Summary badges for all sides */}
            <div className="grid grid-cols-4 gap-1.5">
              {SIDES.map(s => {
                const active = countBySide(s.id);
                const total = wounds.filter(w => w.body_side === s.id).length;
                return (
                  <button key={s.id} onClick={() => { setSide(s.id); setSelectedWound(null); }}
                    className="rounded-xl p-2 text-center transition-all"
                    style={{ background: side === s.id ? "rgba(96,165,250,0.1)" : "rgba(255,255,255,0.02)", border: `1px solid ${side === s.id ? "rgba(96,165,250,0.25)" : "rgba(255,255,255,0.06)"}` }}>
                    <div className="text-base font-bold" style={{ color: active > 0 ? "#f87171" : "#34d399" }}>{active}</div>
                    <div className="text-xs" style={{ color:"rgba(255,255,255,0.35)" }}>{s.label}</div>
                    {total > active && <div className="text-xs" style={{ color:"rgba(255,255,255,0.2)" }}>{total-active} healed</div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wound list + detail */}
          <div className="lg:col-span-3 space-y-3">
            {loading ? (
              <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" /></div>
            ) : (
              <>
                <div className="rounded-2xl p-4" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">
                      {SIDES.find(s=>s.id===side)?.label} — Wound Records
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.4)" }}>
                        {visibleWounds.filter(w => w.is_active).length} active · {visibleWounds.filter(w => !w.is_active).length} healed
                      </span>
                    </div>
                  </div>

                  {/* Show wounds from current side */}
                  {visibleWounds.length === 0 ? (
                    <p className="text-xs text-center py-6" style={{ color:"rgba(255,255,255,0.25)" }}>
                      No wounds on the {SIDES.find(s=>s.id===side)?.label.toLowerCase()} of the body. Click the diagram to add one.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {visibleWounds.map(w => {
                        const isSelected = selectedWound?.id === w.id;
                        return (
                          <button key={w.id} onClick={() => setSelectedWound(isSelected ? null : w)} className="w-full text-left rounded-xl px-3 py-2.5 transition-all"
                            style={{ background: isSelected ? "rgba(96,165,250,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${isSelected ? "rgba(96,165,250,0.3)" : "rgba(255,255,255,0.06)"}` }}>
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: gradeColor(w.grade), opacity: w.is_active ? 1 : 0.4 }} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-semibold" style={{ color: w.is_active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)" }}>
                                    {WOUND_TYPE_LABEL[w.wound_type] ?? w.wound_type}
                                  </span>
                                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.4)" }}>
                                    {GRADE_LABEL[w.grade] ?? w.grade}
                                  </span>
                                  {!w.is_active && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background:"rgba(52,211,153,0.1)", color:"#34d399" }}>Healed</span>}
                                </div>
                                <div className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.3)" }}>
                                  First observed {new Date(w.first_observed).toLocaleDateString("en-GB")}
                                  {w.latest_assessment && <span> · Assessed {new Date(w.latest_assessment.assessment_date).toLocaleDateString("en-GB")}</span>}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Show wounds from other sides as a hint */}
                  {wounds.filter(w => w.body_side !== side && w.is_active).length > 0 && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor:"rgba(255,255,255,0.05)" }}>
                      <p className="text-xs" style={{ color:"rgba(255,255,255,0.25)" }}>
                        Also:{" "}
                        {SIDES.filter(s => s.id !== side).map(s => {
                          const n = countBySide(s.id);
                          if (!n) return null;
                          return (
                            <button key={s.id} onClick={() => { setSide(s.id); setSelectedWound(null); }}
                              className="mr-2 underline" style={{ color:"rgba(96,165,250,0.7)" }}>
                              {n} on {s.label.toLowerCase()}
                            </button>
                          );
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Wound detail */}
                {selectedWound && (
                  <div className="rounded-2xl p-4 space-y-4" style={{ background:"rgba(96,165,250,0.04)", border:"1px solid rgba(96,165,250,0.15)" }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white">{WOUND_TYPE_LABEL[selectedWound.wound_type] ?? selectedWound.wound_type}</h3>
                        <p className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.4)" }}>
                          {SIDES.find(s=>s.id===selectedWound.body_side)?.label} · {GRADE_LABEL[selectedWound.grade] ?? selectedWound.grade}
                          {" · "}{selectedWound.is_active ? "Active" : "Healed"}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {selectedWound.is_active && (
                          <button onClick={() => handleMarkHealed(selectedWound.id)}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                            style={{ background:"rgba(52,211,153,0.1)", color:"#34d399", border:"1px solid rgba(52,211,153,0.2)" }}>
                            <CheckCircle size={11} /> Mark Healed
                          </button>
                        )}
                        <button onClick={() => setShowAddAssessment(true)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                          style={{ background:"rgba(96,165,250,0.1)", color:"#60a5fa", border:"1px solid rgba(96,165,250,0.2)" }}>
                          <Plus size={11} /> Assessment
                        </button>
                      </div>
                    </div>

                    {selectedWound.description && (
                      <p className="text-xs" style={{ color:"rgba(255,255,255,0.5)" }}>{selectedWound.description}</p>
                    )}

                    {selectedWound.latest_assessment ? (
                      <div className="rounded-xl p-3 space-y-2" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">Latest Assessment</span>
                          <span className="text-xs" style={{ color:"rgba(255,255,255,0.3)" }}>
                            {new Date(selectedWound.latest_assessment.assessment_date).toLocaleDateString("en-GB")}
                            {selectedWound.latest_assessment.assessed_by_name && ` · ${selectedWound.latest_assessment.assessed_by_name}`}
                          </span>
                        </div>
                        {(selectedWound.latest_assessment.length_cm || selectedWound.latest_assessment.width_cm) && (
                          <div className="flex gap-3 text-xs" style={{ color:"rgba(255,255,255,0.5)" }}>
                            {selectedWound.latest_assessment.length_cm != null && <span>L: {selectedWound.latest_assessment.length_cm}cm</span>}
                            {selectedWound.latest_assessment.width_cm != null && <span>W: {selectedWound.latest_assessment.width_cm}cm</span>}
                            {selectedWound.latest_assessment.depth_cm != null && <span>D: {selectedWound.latest_assessment.depth_cm}cm</span>}
                          </div>
                        )}
                        {selectedWound.latest_assessment.appearance && <p className="text-xs" style={{ color:"rgba(255,255,255,0.5)" }}><span style={{ color:"rgba(255,255,255,0.35)" }}>Appearance: </span>{selectedWound.latest_assessment.appearance}</p>}
                        {selectedWound.latest_assessment.treatment && <p className="text-xs" style={{ color:"rgba(255,255,255,0.5)" }}><span style={{ color:"rgba(255,255,255,0.35)" }}>Treatment: </span>{selectedWound.latest_assessment.treatment}</p>}
                        {selectedWound.latest_assessment.dressing_used && <p className="text-xs" style={{ color:"rgba(255,255,255,0.5)" }}><span style={{ color:"rgba(255,255,255,0.35)" }}>Dressing: </span>{selectedWound.latest_assessment.dressing_used}</p>}
                        {selectedWound.latest_assessment.next_review && <p className="text-xs" style={{ color:"#fbbf24" }}>Next review: {new Date(selectedWound.latest_assessment.next_review).toLocaleDateString("en-GB")}</p>}
                      </div>
                    ) : (
                      <p className="text-xs" style={{ color:"rgba(255,255,255,0.3)" }}>No assessments recorded yet.</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Add wound modal */}
      {showAddWound && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background:"#0f1629", border:"1px solid rgba(96,165,250,0.25)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Add Wound — {SIDES.find(s=>s.id===side)?.label}</h3>
              <button onClick={() => { setShowAddWound(false); setPendingClick(null); }} style={{ color:"rgba(255,255,255,0.4)" }}><X size={18}/></button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-xs mb-1" style={{color:"rgba(255,255,255,0.5)"}}>Wound Type</label>
              <select value={woundForm.wound_type} onChange={e=>setWoundForm(f=>({...f,wound_type:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                {WOUND_TYPES.map(t=><option key={t} value={t} style={{background:"#0f1629"}}>{WOUND_TYPE_LABEL[t]}</option>)}
              </select></div>
              <div><label className="block text-xs mb-1" style={{color:"rgba(255,255,255,0.5)"}}>Grade</label>
              <select value={woundForm.grade} onChange={e=>setWoundForm(f=>({...f,grade:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                {GRADES.map(g=><option key={g} value={g} style={{background:"#0f1629"}}>{GRADE_LABEL[g]}</option>)}
              </select></div>
              <div><label className="block text-xs mb-1" style={{color:"rgba(255,255,255,0.5)"}}>First Observed *</label>
              <input type="date" value={woundForm.first_observed} onChange={e=>setWoundForm(f=>({...f,first_observed:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}/></div>
              <div><label className="block text-xs mb-1" style={{color:"rgba(255,255,255,0.5)"}}>Description</label>
              <textarea rows={2} value={woundForm.description} onChange={e=>setWoundForm(f=>({...f,description:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={inputStyle}/></div>
              <p className="text-xs px-2 py-1.5 rounded-lg" style={{ color:"rgba(255,255,255,0.35)", background:"rgba(255,255,255,0.04)" }}>
                📍 {SIDES.find(s=>s.id===side)?.label} body · {pendingClick?.x}%, {pendingClick?.y}%
              </p>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowAddWound(false); setPendingClick(null); }} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,255,255,0.08)"}}>Cancel</button>
              <button onClick={handleCreateWound} disabled={saving||!woundForm.first_observed} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{background:"linear-gradient(135deg,#3b82f6,#7c3aed)"}}>{saving?"Saving…":"Add Wound"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add assessment modal */}
      {showAddAssessment && selectedWound && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background:"#0f1629", border:"1px solid rgba(96,165,250,0.25)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">New Assessment</h3>
              <button onClick={() => setShowAddAssessment(false)} style={{ color:"rgba(255,255,255,0.4)" }}><X size={18}/></button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-xs mb-1" style={{color:"rgba(255,255,255,0.5)"}}>Assessment Date *</label>
              <input type="date" value={assessForm.assessment_date} onChange={e=>setAssessForm(f=>({...f,assessment_date:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}/></div>
              <div className="grid grid-cols-3 gap-2">
                {(["length_cm","width_cm","depth_cm"] as const).map(key=>(
                  <div key={key}><label className="block text-xs mb-1 capitalize" style={{color:"rgba(255,255,255,0.5)"}}>{key.replace("_cm"," (cm)")}</label>
                  <input type="number" step="0.1" value={assessForm[key]} onChange={e=>setAssessForm(f=>({...f,[key]:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}/></div>
                ))}
              </div>
              {(["appearance","treatment","dressing_used"] as const).map(key=>(
                <div key={key}><label className="block text-xs mb-1 capitalize" style={{color:"rgba(255,255,255,0.5)"}}>{key.replace(/_/g," ")}</label>
                <input value={assessForm[key]} onChange={e=>setAssessForm(f=>({...f,[key]:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}/></div>
              ))}
              <div><label className="block text-xs mb-1" style={{color:"rgba(255,255,255,0.5)"}}>Next Review Date</label>
              <input type="date" value={assessForm.next_review} onChange={e=>setAssessForm(f=>({...f,next_review:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}/></div>
              <div><label className="block text-xs mb-1" style={{color:"rgba(255,255,255,0.5)"}}>Notes</label>
              <textarea rows={2} value={assessForm.notes} onChange={e=>setAssessForm(f=>({...f,notes:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={inputStyle}/></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddAssessment(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,255,255,0.08)"}}>Cancel</button>
              <button onClick={handleCreateAssessment} disabled={saving||!assessForm.assessment_date} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{background:"linear-gradient(135deg,#3b82f6,#7c3aed)"}}>{saving?"Saving…":"Save Assessment"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
