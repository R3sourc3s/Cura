"use client";

import { useRef, useState } from "react";
import { medications } from "@/lib/api";
import type { Medication, MAREntry, Resident } from "@/types";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/Toast";
import {
  Pill, AlertTriangle, CheckCircle, Clock, XCircle,
  Plus, X, Save, Edit2, Trash2,
} from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const STATUS_CONFIG = {
  given:    { icon: CheckCircle, color: "var(--c-green)", bg: "rgba(52,211,153,0.12)", label: "Given" },
  pending:  { icon: Clock,       color: "var(--c-orange)", bg: "rgba(251,146,60,0.12)",  label: "Pending" },
  refused:  { icon: XCircle,     color: "var(--c-red)", bg: "rgba(239,68,68,0.12)",   label: "Refused" },
  omitted:  { icon: XCircle,     color: "var(--c-teal)", bg: "rgba(13, 148, 136,0.12)",  label: "Omitted" },
} as const;

const ROUTES = ["oral", "topical", "injection", "inhaled", "other"];
const FREQS  = [
  { value: "od",     label: "Once daily (OD)" },
  { value: "bd",     label: "Twice daily (BD)" },
  { value: "tds",    label: "Three times daily (TDS)" },
  { value: "qds",    label: "Four times daily (QDS)" },
  { value: "prn",    label: "As required (PRN)" },
  { value: "weekly", label: "Weekly" },
];

const inputCls = "w-full px-3 py-2.5 text-sm rounded-xl outline-none";
const inputStyle = { background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" };

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl ${className}`}
      style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-hover)" }}>
      {children}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const BLANK = {
  resident: "",
  drug_name: "", dose: "", route: "oral", frequency: "od",
  prescribed_by: "", indication: "",
  start_date: new Date().toISOString().split("T")[0], end_date: "",
  stock_count: "28", reorder_threshold: "7",
  is_controlled: false, notes: "",
};

function MedModal({ initial, residents, onClose, onSaved }: { initial?: Medication; residents: Resident[]; onClose: () => void; onSaved: (m: Medication) => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState(
    initial
      ? {
          resident: String(initial.resident),
          drug_name: initial.drug_name, dose: initial.dose,
          route: initial.route, frequency: initial.frequency,
          prescribed_by: initial.prescribed_by, indication: initial.indication ?? "",
          start_date: initial.start_date, end_date: initial.end_date ?? "",
          stock_count: String(initial.stock_count), reorder_threshold: String(initial.reorder_threshold),
          is_controlled: initial.is_controlled, notes: initial.notes ?? "",
        }
      : BLANK
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  function set(k: string, v: string | boolean) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        resident: Number(form.resident),
        stock_count: Number(form.stock_count),
        reorder_threshold: Number(form.reorder_threshold),
        end_date: form.end_date || undefined,
      };
      const saved = initial
        ? await medications.update(initial.id, payload)
        : await medications.create(payload);
      onSaved(saved);
      toast(initial ? "Medication updated." : "Medication added.", "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      toast("Could not save medication.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}>
      <div className="h-full w-full max-w-xl flex flex-col overflow-hidden"
        style={{ background: "var(--bg-elevated)", borderLeft: "1px solid var(--bg-card-hover)" }}>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--c-teal2), #10b981)" }}>
              <Pill size={14} className="text-white" />
            </div>
            <h2 className="text-base font-bold text-white">
              {initial ? "Edit Medication" : "Add Medication"}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--input-bg)" }}>
            <X size={16} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm text-red-300"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}

          <Field label="Resident" required>
            <select className={inputCls} style={inputStyle} value={form.resident}
              onChange={(e) => set("resident", e.target.value)} required>
              <option value="">— select resident —</option>
              {residents.map((r) => (
                <option key={r.id} value={r.id}>{r.full_name} (Room {r.room_number})</option>
              ))}
            </select>
          </Field>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 4 }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Drug Details</p>
            <div className="space-y-3">
              <Field label="Drug Name" required>
                <input className={inputCls} style={inputStyle} value={form.drug_name}
                  onChange={(e) => set("drug_name", e.target.value)} required placeholder="e.g. Amlodipine" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Dose" required>
                  <input className={inputCls} style={inputStyle} value={form.dose}
                    onChange={(e) => set("dose", e.target.value)} required placeholder="e.g. 5mg" />
                </Field>
                <Field label="Route" required>
                  <select className={inputCls} style={inputStyle} value={form.route}
                    onChange={(e) => set("route", e.target.value)}>
                    {ROUTES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </Field>
                <Field label="Frequency" required>
                  <select className={inputCls} style={inputStyle} value={form.frequency}
                    onChange={(e) => set("frequency", e.target.value)}>
                    {FREQS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </Field>
                <Field label="Indication">
                  <input className={inputCls} style={inputStyle} value={form.indication}
                    onChange={(e) => set("indication", e.target.value)} placeholder="e.g. Hypertension" />
                </Field>
              </div>
              <Field label="Prescribed By" required>
                <input className={inputCls} style={inputStyle} value={form.prescribed_by}
                  onChange={(e) => set("prescribed_by", e.target.value)} required placeholder="Dr. Name" />
              </Field>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 4 }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Dates & Stock</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date" required>
                <input type="date" className={inputCls} style={inputStyle} value={form.start_date}
                  onChange={(e) => set("start_date", e.target.value)} required />
              </Field>
              <Field label="End Date">
                <input type="date" className={inputCls} style={inputStyle} value={form.end_date}
                  onChange={(e) => set("end_date", e.target.value)} />
              </Field>
              <Field label="Stock Count">
                <input type="number" min="0" className={inputCls} style={inputStyle} value={form.stock_count}
                  onChange={(e) => set("stock_count", e.target.value)} />
              </Field>
              <Field label="Reorder Threshold">
                <input type="number" min="0" className={inputCls} style={inputStyle} value={form.reorder_threshold}
                  onChange={(e) => set("reorder_threshold", e.target.value)} />
              </Field>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 4 }}>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-5 rounded-full transition-colors flex items-center px-0.5"
                style={{ background: form.is_controlled ? "#0d9488" : "rgba(var(--fg-rgb),0.12)" }}>
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_controlled ? "translate-x-5" : "translate-x-0"}`} />
              </div>
              <div>
                <input type="checkbox" className="hidden" checked={form.is_controlled}
                  onChange={(e) => set("is_controlled", e.target.checked)} />
                <span className="text-sm font-medium text-white">Controlled Drug (CD)</span>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Requires additional authorisation</p>
              </div>
            </label>
          </div>

          <Field label="Notes">
            <textarea className={inputCls} style={inputStyle} value={form.notes} rows={3}
              onChange={(e) => set("notes", e.target.value)} placeholder="Additional notes…" />
          </Field>
        </form>

        <div className="px-6 py-4 flex gap-3 flex-shrink-0"
          style={{ borderTop: "1px solid var(--border)" }}>
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
            style={{ background: "var(--input-bg)", color: "var(--text-secondary)", border: "1px solid var(--bg-card-hover)" }}>
            Cancel
          </button>
          <button onClick={() => formRef.current?.requestSubmit()} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
            style={{ background: "#0d9488" }}>
            <Save size={14} />{saving ? "Saving…" : "Save Medication"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  initialMeds: Medication[];
  initialMar: MAREntry[];
  initialResidents: Resident[];
}

export default function MedicationsClient({ initialMeds, initialMar, initialResidents }: Props) {
  const { can } = useUser();
  const { toast } = useToast();
  const [meds, setMeds] = useState<Medication[]>(initialMeds);
  const [mar, setMar] = useState<MAREntry[]>(initialMar);
  const [residentList] = useState<Resident[]>(initialResidents);
  const [administeringId, setAdministeringId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editMed, setEditMed] = useState<Medication | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  async function administer(id: number) {
    setAdministeringId(id);
    try {
      await medications.updateMAR(id, { status: "given", administered_at: new Date().toISOString() });
      setMar((prev) => prev.map((e) => e.id === id ? { ...e, status: "given" } : e));
    } catch (e) { console.error(e); }
    finally { setAdministeringId(null); }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await medications.delete(id);
      setMeds((prev) => prev.filter((m) => m.id !== id));
      toast("Medication removed.", "error");
    } catch (e) { console.error(e); toast("Could not remove medication.", "error"); }
    finally { setDeletingId(null); }
  }

  function handleSaved(med: Medication) {
    setMeds((prev) => {
      const idx = prev.findIndex((m) => m.id === med.id);
      return idx >= 0 ? prev.map((m) => m.id === med.id ? med : m) : [med, ...prev];
    });
    setShowModal(false);
    setEditMed(null);
  }

  const lowStock = meds.filter((m) => m.is_low_stock);
  const todayMAR = mar.filter((e) => {
    const d = new Date(e.scheduled_at);
    return d.toDateString() === new Date().toDateString();
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Pill size={22} style={{ color: "var(--c-teal2)" }} /> Medications
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {meds.length} medications · {todayMAR.filter(m => m.status === "pending").length} pending today
          </p>
        </div>
        {can("medications.create") && (
          <button onClick={() => { setEditMed(null); setShowModal(true); }}
            className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold rounded-xl text-white"
            style={{ background: "#0d9488" }}>
            <Plus size={14} /> <span className="hidden sm:inline">Add Medication</span><span className="sm:hidden">Add</span>
          </button>
        )}
      </div>

      {lowStock.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">
            <strong>{lowStock.length}</strong> medication{lowStock.length !== 1 ? "s" : ""} low on stock: {lowStock.map(m => m.drug_name).join(", ")}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Today&apos;s MAR</h2>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(251,146,60,0.15)", color: "var(--c-orange)" }}>
              {todayMAR.filter((m) => m.status === "pending").length} pending
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--bg-card)" }}>
            {todayMAR.length === 0 ? (
              <p className="px-5 py-8 text-sm text-center" style={{ color: "var(--text-muted)" }}>No scheduled medications today.</p>
            ) : (
              todayMAR.map((entry) => {
                const cfg = STATUS_CONFIG[entry.status] ?? STATUS_CONFIG.pending;
                const StatusIcon = cfg.icon;
                const med = meds.find((m) => m.id === entry.medication);
                return (
                  <div key={entry.id} className="flex items-center gap-4 px-5 py-3.5"
                    style={{ borderBottom: "1px solid var(--border)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: cfg.bg }}>
                      <StatusIcon size={14} style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {med?.drug_name ?? `Med #${entry.medication}`}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {med?.dose} · {new Date(entry.scheduled_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    {entry.status === "pending" && can("medications.administer") ? (
                      <button onClick={() => administer(entry.id)} disabled={administeringId === entry.id}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg,#0d9488,#10b981)" }}>
                        {administeringId === entry.id ? "…" : "Administer"}
                      </button>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Inventory</h2>
            {lowStock.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.15)", color: "var(--c-red)" }}>
                {lowStock.length} low
              </span>
            )}
          </div>
          <div>
            {meds.length === 0 ? (
              <p className="px-5 py-8 text-sm text-center" style={{ color: "var(--text-muted)" }}>No medications.</p>
            ) : (
              meds.map((med) => (
                <div key={med.id} className="flex items-center gap-3 px-5 py-3.5"
                  style={{ borderBottom: "1px solid var(--border)" }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white">{med.drug_name}</span>
                      {med.is_controlled && (
                        <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                          style={{ background: "rgba(13, 148, 136,0.15)", color: "var(--c-teal)" }}>CD</span>
                      )}
                      {med.is_low_stock && <AlertTriangle size={12} className="text-red-400" />}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {med.dose} · {med.route} · {med.frequency.toUpperCase()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-1">
                      <div className="text-sm font-bold" style={{ color: med.is_low_stock ? "var(--c-red)" : "var(--text-secondary)" }}>
                        {med.stock_count}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>units</div>
                    </div>
                    <div className="w-10">
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-card-hover)" }}>
                        <div className="h-full rounded-full"
                          style={{
                            width: `${Math.min((med.stock_count / Math.max(med.reorder_threshold * 4, 1)) * 100, 100)}%`,
                            background: med.is_low_stock ? "#ef4444" : "var(--c-green)",
                          }}
                        />
                      </div>
                    </div>
                    {can("medications.edit") && (
                      <button onClick={() => { setEditMed(med); setShowModal(true); }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(45, 212, 191,0.1)", color: "var(--c-teal2)" }}>
                        <Edit2 size={12} />
                      </button>
                    )}
                    {can("medications.delete") && (
                      <button onClick={() => setConfirmDeleteId(med.id)} disabled={deletingId === med.id}
                        className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-40"
                        style={{ background: "rgba(239,68,68,0.08)", color: "var(--c-red)" }}>
                        {deletingId === med.id ? <span className="text-xs">…</span> : <Trash2 size={12} />}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {(showModal || editMed) && (
        <MedModal
          initial={editMed ?? undefined}
          residents={residentList}
          onClose={() => { setShowModal(false); setEditMed(null); }}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Delete Medication?"
        message="This will permanently remove the medication and all associated records."
        confirmLabel={deletingId !== null ? "Deleting…" : "Yes, Delete"}
        danger
        onConfirm={() => { if (confirmDeleteId !== null) { handleDelete(confirmDeleteId); setConfirmDeleteId(null); } }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
