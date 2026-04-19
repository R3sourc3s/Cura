"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { residents as residentsApi } from "@/lib/api";
import type { Resident } from "@/types";
import { useToast } from "@/components/Toast";
import { Search, Filter, Users, AlertTriangle, Plus, Eye, Edit2, Trash2, X, Save, Upload } from "lucide-react";

const RISK = {
  critical: { bg: "rgba(239,68,68,0.15)",  text: "#f87171", dot: "#ef4444" },
  high:     { bg: "rgba(251,146,60,0.15)",  text: "#fb923c", dot: "#f97316" },
  medium:   { bg: "rgba(250,204,21,0.12)",  text: "#fbbf24", dot: "#eab308" },
  low:      { bg: "rgba(52,211,153,0.12)",  text: "#34d399", dot: "#10b981" },
} as const;

function RiskBadge({ level }: { level: string }) {
  const s = RISK[level as keyof typeof RISK] ?? RISK.low;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium capitalize"
      style={{ background: s.bg, color: s.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {level}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "#ef4444" : score >= 60 ? "#f97316" : score >= 40 ? "#eab308" : "#10b981";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold" style={{ color }}>{score}</span>
    </div>
  );
}

function ResidentAvatar({ r, size = 32 }: { r: Resident; size?: number }) {
  if (r.photo) return <img src={r.photo} alt={r.full_name} className="rounded-lg object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  const initials = [r.first_name[0], r.last_name[0]].join("").toUpperCase();
  const hue = (r.id * 47) % 360;
  return (
    <div className="rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
      style={{ width: size, height: size, background: `linear-gradient(135deg, hsl(${hue},60%,30%), hsl(${(hue+40)%360},70%,40%))`, color: "rgba(255,255,255,0.9)" }}>
      {initials}
    </div>
  );
}

const BLANK_FORM = {
  first_name: "", last_name: "", date_of_birth: "", nhs_number: "",
  room_number: "", admission_date: new Date().toISOString().split("T")[0],
  fall_risk: "low", pressure_ulcer_risk: "low",
  next_of_kin_name: "", next_of_kin_phone: "", gp_name: "", gp_phone: "",
};

const inputCls = "w-full px-3 py-2.5 text-sm rounded-xl outline-none";
const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" };

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (r: Resident) => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  function set(key: string, val: string) { setForm((f) => ({ ...f, [key]: val })); }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (photoFile) fd.append("photo", photoFile);
      const created = await residentsApi.create(fd);
      onCreated(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create resident");
    } finally { setSaving(false); }
  }

  const riskOpts = ["low", "medium", "high", "critical"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}>
      <div className="h-full w-full max-w-xl flex flex-col overflow-hidden"
        style={{ background: "#0d1526", borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
              <Plus size={14} className="text-white" />
            </div>
            <h2 className="text-base font-bold text-white">Add New Resident</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <X size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm text-red-300"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>{error}</div>
          )}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>Profile Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}>
                {photoPreview ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" /> : <Upload size={18} style={{ color: "#a78bfa" }} />}
              </div>
              <label className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Upload size={12} /> Choose Photo
                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </label>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 4 }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Personal Details</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="First Name" required><input className={inputCls} style={inputStyle} value={form.first_name} onChange={(e) => set("first_name", e.target.value)} required /></Field>
              <Field label="Last Name" required><input className={inputCls} style={inputStyle} value={form.last_name} onChange={(e) => set("last_name", e.target.value)} required /></Field>
              <Field label="Date of Birth" required><input type="date" className={inputCls} style={inputStyle} value={form.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} required /></Field>
              <Field label="NHS Number"><input className={inputCls} style={inputStyle} value={form.nhs_number} onChange={(e) => set("nhs_number", e.target.value)} placeholder="e.g. NHS013" /></Field>
              <Field label="Room Number" required><input className={inputCls} style={inputStyle} value={form.room_number} onChange={(e) => set("room_number", e.target.value)} placeholder="e.g. 7A" required /></Field>
              <Field label="Admission Date" required><input type="date" className={inputCls} style={inputStyle} value={form.admission_date} onChange={(e) => set("admission_date", e.target.value)} required /></Field>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 4 }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Risk Levels</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fall Risk" required>
                <select className={inputCls} style={inputStyle} value={form.fall_risk} onChange={(e) => set("fall_risk", e.target.value)}>
                  {riskOpts.map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                </select>
              </Field>
              <Field label="Pressure Ulcer Risk" required>
                <select className={inputCls} style={inputStyle} value={form.pressure_ulcer_risk} onChange={(e) => set("pressure_ulcer_risk", e.target.value)}>
                  {riskOpts.map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                </select>
              </Field>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 4 }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Key Contacts</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Next of Kin Name"><input className={inputCls} style={inputStyle} value={form.next_of_kin_name} onChange={(e) => set("next_of_kin_name", e.target.value)} /></Field>
              <Field label="Next of Kin Phone"><input type="tel" className={inputCls} style={inputStyle} value={form.next_of_kin_phone} onChange={(e) => set("next_of_kin_phone", e.target.value)} /></Field>
              <Field label="GP Name"><input className={inputCls} style={inputStyle} value={form.gp_name} onChange={(e) => set("gp_name", e.target.value)} /></Field>
              <Field label="GP Phone"><input type="tel" className={inputCls} style={inputStyle} value={form.gp_phone} onChange={(e) => set("gp_phone", e.target.value)} /></Field>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 flex gap-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
            Cancel
          </button>
          <button onClick={() => formRef.current?.requestSubmit()} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
            <Save size={14} />{saving ? "Creating…" : "Create Resident"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResidentsClient({ initialList, initialTotal }: { initialList: Resident[]; initialTotal: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const [list, setList] = useState<Resident[]>(initialList);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setPage(1);
    try {
      const params: Record<string, string> = { is_active: "true" };
      if (search) params.search = search;
      if (riskFilter) params.fall_risk = riskFilter;
      const data = await residentsApi.list(params);
      setList(data.results); setTotal(data.count);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, riskFilter]);

  useEffect(() => {
    if (!search && !riskFilter) return; // initial data already loaded server-side
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load, search, riskFilter]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const params: Record<string, string> = { is_active: "true", page: String(page + 1) };
      if (search) params.search = search;
      if (riskFilter) params.fall_risk = riskFilter;
      const data = await residentsApi.list(params);
      setList((prev) => [...prev, ...data.results]); setPage((p) => p + 1);
    } catch (e) { console.error(e); }
    finally { setLoadingMore(false); }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await residentsApi.delete(id);
      setList((l) => l.filter((r) => r.id !== id)); setTotal((t) => t - 1);
      toast("Resident discharged.", "warning");
    } catch { toast("Failed to remove resident.", "error"); }
    finally { setDeletingId(null); setConfirmId(null); }
  }

  function handleCreated(r: Resident) {
    setShowCreate(false);
    toast(`${r.full_name} added successfully.`);
    router.push(`/dashboard/residents/${r.id}`);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Users size={22} style={{ color: "#7c3aed" }} /> Residents
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            {total} active resident{total !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold rounded-xl text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
          <Plus size={15} /> <span className="hidden sm:inline">Add Resident</span><span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.25)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, NHS, room…" className="w-full pl-9 pr-3 py-2 text-sm rounded-xl outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }} />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: "rgba(255,255,255,0.35)" }} />
          <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}
            className="flex-1 sm:flex-none text-sm px-3 py-2 rounded-xl outline-none cursor-pointer"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: riskFilter ? "white" : "rgba(255,255,255,0.35)" }}>
            <option value="">All risk levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div>
        ) : list.length === 0 ? (
          <p className="text-center py-12 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No residents found.</p>
        ) : list.map((r) => (
          <div key={r.id} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-3 mb-3">
              <ResidentAvatar r={r} size={40} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{r.full_name}</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Room {r.room_number} · Age {r.age}</div>
              </div>
              <RiskBadge level={r.fall_risk} />
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {(r.conditions ?? []).slice(0, 3).map((c, i) => (
                <span key={i} className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)" }}>{c.name}</span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => router.push(`/dashboard/residents/${r.id}`)}
                className="flex-1 flex items-center justify-center gap-1 text-xs font-medium py-2 rounded-lg"
                style={{ background: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}>
                <Eye size={12} /> View
              </button>
              <button onClick={() => router.push(`/dashboard/residents/${r.id}/edit`)}
                className="flex-1 flex items-center justify-center gap-1 text-xs font-medium py-2 rounded-lg"
                style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }}>
                <Edit2 size={12} /> Edit
              </button>
              {confirmId === r.id ? (
                <>
                  <button onClick={() => handleDelete(r.id)} disabled={deletingId === r.id}
                    className="flex-1 text-xs font-semibold py-2 rounded-lg text-white disabled:opacity-50" style={{ background: "#dc2626" }}>
                    {deletingId === r.id ? "…" : "Confirm"}
                  </button>
                  <button onClick={() => setConfirmId(null)} className="w-8 flex items-center justify-center py-2 rounded-lg" style={{ color: "rgba(255,255,255,0.4)" }}>
                    <X size={12} />
                  </button>
                </>
              ) : (
                <button onClick={() => setConfirmId(r.id)}
                  className="w-9 flex items-center justify-center py-2 rounded-lg"
                  style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Resident", "Room", "Age", "Fall Risk", "AI Score", "Conditions", "Actions"].map((h) => (
                <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-3" style={{ color: "rgba(255,255,255,0.35)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody style={{ background: "rgba(5,9,20,0.6)" }}>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto" /></td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No residents found.</td></tr>
            ) : list.map((r) => (
              <tr key={r.id} className="transition-all" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ResidentAvatar r={r} size={34} />
                    <div>
                      <div className="text-sm font-medium text-white">{r.full_name}</div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{r.nhs_number || "No NHS no."}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><span className="text-sm font-mono" style={{ color: "rgba(255,255,255,0.6)" }}>{r.room_number}</span></td>
                <td className="px-4 py-3"><span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{r.age}</span></td>
                <td className="px-4 py-3"><RiskBadge level={r.fall_risk} /></td>
                <td className="px-4 py-3"><ScoreBar score={r.ai_risk_score} /></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(r.conditions ?? []).slice(0, 2).map((c, i) => (
                      <span key={i} className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)" }}>{c.name}</span>
                    ))}
                    {(r.conditions?.length ?? 0) > 2 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>+{(r.conditions?.length ?? 0) - 2}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => router.push(`/dashboard/residents/${r.id}`)}
                      className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg"
                      style={{ background: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}>
                      <Eye size={12} /> View
                    </button>
                    <button onClick={() => router.push(`/dashboard/residents/${r.id}/edit`)}
                      className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg"
                      style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }}>
                      <Edit2 size={12} /> Edit
                    </button>
                    {confirmId === r.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(r.id)} disabled={deletingId === r.id}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white disabled:opacity-50" style={{ background: "#dc2626" }}>
                          {deletingId === r.id ? "…" : "Confirm"}
                        </button>
                        <button onClick={() => setConfirmId(null)} className="text-xs px-2 py-1.5 rounded-lg" style={{ color: "rgba(255,255,255,0.4)" }}>
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmId(r.id)}
                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg"
                        style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.15)" }}>
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {list.filter((r) => r.fall_risk === "critical").length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">
            {list.filter((r) => r.fall_risk === "critical").length} resident(s) at critical fall risk — immediate review required.
          </p>
        </div>
      )}

      {list.length < total && (
        <div className="flex justify-center pt-2">
          <button onClick={loadMore} disabled={loadingMore}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>
            {loadingMore
              ? <><div className="w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />Loading…</>
              : `Load more (${total - list.length} remaining)`}
          </button>
        </div>
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
    </div>
  );
}
