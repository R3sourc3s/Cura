"use client";

import { useState } from "react";
import { AlertOctagon, Plus, X } from "lucide-react";
import { allergies as allergiesApi } from "@/lib/api";
import { useToast } from "@/components/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Allergy } from "@/types";

const SEVERITY_STYLE: Record<Allergy["severity"], { color: string; bg: string; label: string }> = {
  anaphylaxis: { color: "var(--c-red)",    bg: "rgba(239,68,68,0.14)",  label: "Anaphylaxis" },
  severe:      { color: "var(--c-red)",    bg: "rgba(239,68,68,0.10)",  label: "Severe" },
  moderate:    { color: "var(--c-orange)", bg: "rgba(251,146,60,0.12)", label: "Moderate" },
  mild:        { color: "var(--c-amber)",  bg: "rgba(251,191,36,0.12)", label: "Mild" },
};

/** Compact red banner for headers and medication screens. Renders "No known allergies" when empty. */
export function AllergyBanner({ allergies }: { allergies?: Allergy[] }) {
  const list = (allergies ?? []).filter((a) => a.is_active);
  if (list.length === 0) {
    return (
      <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
        No known allergies
      </span>
    );
  }
  return (
    <div role="note" aria-label="Allergies"
      className="flex items-start gap-2 px-3 py-2 rounded-xl text-sm"
      style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }}>
      <AlertOctagon size={15} className="flex-shrink-0 mt-0.5" style={{ color: "var(--c-red)" }} />
      <div style={{ color: "var(--text-primary)" }}>
        <strong style={{ color: "var(--c-red)" }}>Allergies: </strong>
        {list.map((a, i) => (
          <span key={a.id}>
            {i > 0 && ", "}
            {a.allergen}
            <span style={{ color: "var(--text-muted)" }}> ({SEVERITY_STYLE[a.severity].label.toLowerCase()})</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const inputStyle = { background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" };
const BLANK = { allergen: "", allergy_type: "drug" as Allergy["allergy_type"], severity: "moderate" as Allergy["severity"], reaction: "" };

/** Full allergy list with add / remove, for the resident overview. */
export function AllergiesCard({ residentId, allergies, canEdit, onChange }: {
  residentId: number;
  allergies: Allergy[];
  canEdit: boolean;
  onChange: (next: Allergy[]) => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<typeof BLANK | null>(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<Allergy | null>(null);
  const active = allergies.filter((a) => a.is_active);

  async function save() {
    if (!form?.allergen.trim()) return;
    setSaving(true);
    try {
      const created = await allergiesApi.create({ resident: residentId, ...form, allergen: form.allergen.trim() });
      onChange([...allergies, created]);
      setForm(null);
      toast("Allergy recorded.", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not save allergy.", "error");
    } finally { setSaving(false); }
  }

  async function remove(a: Allergy) {
    setRemoving(null);
    try {
      await allergiesApi.deactivate(a.id);
      onChange(allergies.filter((x) => x.id !== a.id));
      toast("Allergy removed.", "success");
    } catch { toast("Could not remove allergy.", "error"); }
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertOctagon size={15} style={{ color: "var(--c-red)" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Allergies &amp; Adverse Reactions</h3>
        </div>
        {canEdit && !form && (
          <button onClick={() => setForm(BLANK)}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg"
            style={{ background: "rgba(13,148,136,0.1)", color: "var(--c-teal)" }}>
            <Plus size={12} /> Add
          </button>
        )}
      </div>

      {active.length === 0 && !form && (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>No known allergies recorded.</p>
      )}

      {active.length > 0 && (
        <ul className="space-y-2">
          {active.map((a) => {
            const st = SEVERITY_STYLE[a.severity];
            return (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="min-w-0">
                  <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {a.allergen}
                    <span className="ml-2 text-xs capitalize" style={{ color: "var(--text-muted)" }}>{a.allergy_type}</span>
                  </div>
                  {a.reaction && <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{a.reaction}</div>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  {canEdit && (
                    <button onClick={() => setRemoving(a)} aria-label={`Remove ${a.allergen} allergy`}
                      className="w-6 h-6 rounded-md flex items-center justify-center" style={{ color: "var(--text-muted)" }}>
                      <X size={13} />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {form && (
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <input autoFocus value={form.allergen} onChange={(e) => setForm({ ...form, allergen: e.target.value })}
            placeholder="Allergen, e.g. Penicillins" aria-label="Allergen"
            className="col-span-2 text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} />
          <select value={form.allergy_type} onChange={(e) => setForm({ ...form, allergy_type: e.target.value as Allergy["allergy_type"] })}
            aria-label="Type" className="text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
            <option value="drug">Drug</option><option value="food">Food</option>
            <option value="environmental">Environmental</option><option value="other">Other</option>
          </select>
          <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as Allergy["severity"] })}
            aria-label="Severity" className="text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
            <option value="mild">Mild</option><option value="moderate">Moderate</option>
            <option value="severe">Severe</option><option value="anaphylaxis">Anaphylaxis</option>
          </select>
          <input value={form.reaction} onChange={(e) => setForm({ ...form, reaction: e.target.value })}
            placeholder="Reaction, e.g. Rash, swollen lips" aria-label="Reaction"
            className="col-span-2 text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} />
          <div className="col-span-2 flex justify-end gap-2">
            <button onClick={() => setForm(null)} className="px-3 py-1.5 rounded-lg text-sm"
              style={{ background: "var(--input-bg)", color: "var(--text-secondary)" }}>Cancel</button>
            <button onClick={save} disabled={saving || !form.allergen.trim()}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "#0d9488" }}>{saving ? "Saving…" : "Save allergy"}</button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={removing !== null}
        title="Remove allergy?"
        message={removing ? `${removing.allergen} will no longer be checked when medication is prescribed or given.` : ""}
        confirmLabel="Remove"
        danger
        onConfirm={() => removing && remove(removing)}
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
}
