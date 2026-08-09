"use client";

import { useEffect, useState, useCallback } from "react";
import { Award, Plus, X, ShieldAlert, CheckCircle2, Clock, AlertTriangle, MinusCircle } from "lucide-react";
import { useToast } from "@/components/Toast";
import { useUser } from "@/context/UserContext";
import type { Accreditation } from "@/types";

const STATUS_CFG: Record<Accreditation["status"], { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  certified:      { label: "Certified",      color: "var(--c-green)", bg: "rgba(52,211,153,0.12)", icon: CheckCircle2 },
  in_progress:    { label: "In Progress",    color: "var(--c-teal2)", bg: "rgba(45,212,191,0.12)", icon: Clock },
  expiring_soon:  { label: "Expiring Soon",  color: "var(--c-amber)", bg: "rgba(251,191,36,0.12)", icon: AlertTriangle },
  expired:        { label: "Expired",        color: "var(--c-red)", bg: "rgba(239,68,68,0.12)", icon: AlertTriangle },
  not_applicable: { label: "N/A",            color: "#9ca3af", bg: "rgba(156,163,175,0.12)", icon: MinusCircle },
};

const CATEGORY_LABELS: Record<Accreditation["category"], string> = {
  cqc: "CQC Registration", cyber: "Cyber Security", data_protection: "Data Protection",
  fire_safety: "Fire Safety", health_safety: "Health & Safety", quality: "Quality Management", other: "Other",
};

const inputStyle = { background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" };

/**
 * Trust & Certifications register. Publishing this kind of live, provider-facing
 * accreditation status is the transparency move competitors like Empathika make
 * about themselves — here it's built as a real, editable tool for the operator's
 * own certifications, not just a marketing page.
 */
export default function AccreditationsPanel() {
  const { can } = useUser();
  const { toast } = useToast();
  const [items, setItems] = useState<Accreditation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "other" as Accreditation["category"], issuing_body: "",
    status: "in_progress" as Accreditation["status"], reference_number: "",
    valid_from: "", valid_until: "", certificate_url: "", notes: "",
  });

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/v1/compliance/accreditations/?ordering=valid_until", { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setItems(d.results ?? d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    if (!form.name) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = { ...form };
      if (!body.valid_from) delete body.valid_from;
      if (!body.valid_until) delete body.valid_until;
      const res = await fetch("/api/v1/compliance/accreditations/", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (res.ok) {
        const n = await res.json();
        setItems(p => [...p, n]);
        setShowModal(false);
        setForm({ name: "", category: "other", issuing_body: "", status: "in_progress", reference_number: "", valid_from: "", valid_until: "", certificate_url: "", notes: "" });
        toast("Accreditation added.", "success");
      } else { toast("Could not save accreditation.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
    finally { setSaving(false); }
  }

  const certifiedCount = items.filter(i => i.status === "certified").length;
  const attentionCount = items.filter(i => i.status === "expiring_soon" || i.status === "expired" || i.is_expiring_soon).length;

  if (loading) return null;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-strong)" }}>
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(45,212,191,0.12)" }}>
            <Award size={14} style={{ color: "var(--c-teal2)" }} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Trust &amp; Certifications</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {certifiedCount} certified{attentionCount > 0 ? ` · ${attentionCount} need attention` : ""}
            </p>
          </div>
        </div>
        {can("compliance.manage") && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white"
            style={{ background: "#0d9488" }}>
            <Plus size={12} /> Add
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 px-5">
          <ShieldAlert size={22} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>No accreditations on record yet — track Cyber Essentials, ISO 27001, DSPT, DTAC and more here.</p>
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {items.map(item => {
            const status = item.is_expiring_soon && item.status === "certified" ? "expiring_soon" : item.status;
            const cfg = STATUS_CFG[status];
            const Icon = cfg.icon;
            return (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                <Icon size={14} style={{ color: cfg.color }} className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">{item.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(var(--fg-rgb),0.06)", color: "var(--text-muted)" }}>
                      {CATEGORY_LABELS[item.category]}
                    </span>
                  </div>
                  {(item.issuing_body || item.valid_until) && (
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {item.issuing_body}{item.issuing_body && item.valid_until ? " · " : ""}
                      {item.valid_until ? `Valid until ${new Date(item.valid_until).toLocaleDateString("en-GB")}` : ""}
                    </div>
                  )}
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: cfg.bg, color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "var(--bg-elevated)", border: "1px solid rgba(45,212,191,0.25)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Add Accreditation</h3>
              <button onClick={() => setShowModal(false)} style={{ color: "var(--text-muted)" }}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Cyber Essentials Plus" className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Accreditation["category"] }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Accreditation["status"] }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                    {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Issuing Body</label>
                <input value={form.issuing_body} onChange={e => setForm(f => ({ ...f, issuing_body: e.target.value }))} placeholder="e.g. IASME" className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Valid From</label>
                  <input type="date" value={form.valid_from} onChange={e => setForm(f => ({ ...f, valid_from: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Valid Until</label>
                  <input type="date" value={form.valid_until} onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Reference Number</label>
                <input value={form.reference_number} onChange={e => setForm(f => ({ ...f, reference_number: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{ background: "rgba(var(--fg-rgb),0.06)", color: "rgba(var(--fg-rgb),0.7)", border: "1px solid rgba(var(--fg-rgb),0.08)" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{ background: "#0d9488" }}>{saving ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
