"use client";

import { useEffect, useState, useCallback } from "react";
import { LayoutGrid, Plus, X, Users, AlertTriangle, UserCheck2 } from "lucide-react";
import { useToast } from "@/components/Toast";
import EmptyState from "@/components/ui/EmptyState";
import type { Wing } from "@/types";

interface WingOccupancy {
  id: number;
  name: string;
  floor: string;
  bed_count: number;
  occupied: number;
  occupancy_pct: number | null;
  lead_staff_name: string | null;
  high_risk_count: number;
  residents: { id: number; full_name: string; room_number: string; fall_risk: string }[];
}

interface OversightData {
  wings: WingOccupancy[];
  unassigned_residents: number;
  staff_on_shift_now: { id: number; name: string; shift_type: string }[];
  generated_at: string;
}

interface StaffMember { id: number; full_name: string; }

const inputStyle = { background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" };

export default function WingsPage() {
  const [data, setData] = useState<OversightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", floor: "", bed_count: "10", lead_staff: "" });

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/v1/staff/wings-oversight/", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch("/api/v1/auth/users/?page_size=100", { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setStaff((d.results ?? []).map((u: { id: number; first_name: string; last_name: string }) => ({ id: u.id, full_name: `${u.first_name} ${u.last_name}`.trim() }))));
  }, []);

  async function handleCreate() {
    if (!form.name) return;
    setSaving(true);
    try {
      const body: Partial<Wing> = { name: form.name, floor: form.floor, bed_count: Number(form.bed_count) };
      if (form.lead_staff) body.lead_staff = Number(form.lead_staff);
      const res = await fetch("/api/v1/staff/wings/", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ name: "", floor: "", bed_count: "10", lead_staff: "" });
        toast("Wing created.", "success");
        load();
      } else { toast("Could not create wing.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.2)" }}>
            <LayoutGrid size={16} style={{ color: "#818cf8" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Wings & Occupancy</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Central, multi-wing oversight across your care home</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white"
          style={{ background: "#0d9488" }}>
          <Plus size={14} /> Add Wing
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" /></div>
      ) : !data || data.wings.length === 0 ? (
        <EmptyState icon={LayoutGrid} title="No wings set up" description="Create wings to see live occupancy and roster across your whole home."
          action={{ label: "Add Wing", onClick: () => setShowModal(true) }} />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Wings", value: data.wings.length, color: "#818cf8" },
              { label: "Total Occupied", value: data.wings.reduce((a, w) => a + w.occupied, 0), color: "var(--c-teal)" },
              { label: "High Risk Residents", value: data.wings.reduce((a, w) => a + w.high_risk_count, 0), color: "var(--c-red)" },
              { label: "Staff On Shift Now", value: data.staff_on_shift_now.length, color: "var(--c-green)" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl p-4 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-hover)" }}>
                <div className="text-2xl font-bold" style={{ color }}>{value}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
              </div>
            ))}
          </div>

          {data.unassigned_residents > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
              <AlertTriangle size={16} className="flex-shrink-0" style={{ color: "var(--c-amber)" }} />
              <p className="text-sm" style={{ color: "var(--c-amber)" }}>
                <strong>{data.unassigned_residents}</strong> active resident{data.unassigned_residents !== 1 ? "s" : ""} not yet allocated to a wing.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.wings.map(wing => (
              <div key={wing.id} className="rounded-2xl p-5" style={{ background: "rgba(var(--fg-rgb),0.02)", border: "1px solid var(--border)" }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{wing.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {wing.floor ? `${wing.floor} · ` : ""}{wing.lead_staff_name ? `Led by ${wing.lead_staff_name}` : "No lead assigned"}
                    </div>
                  </div>
                  {wing.high_risk_count > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: "rgba(239,68,68,0.12)", color: "var(--c-red)" }}>
                      {wing.high_risk_count} high risk
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span style={{ color: "var(--text-secondary)" }}>Occupancy</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{wing.occupied} / {wing.bed_count} beds{wing.occupancy_pct != null ? ` (${wing.occupancy_pct}%)` : ""}</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: "var(--bg-card-hover)" }}>
                    <div className="h-2 rounded-full" style={{ width: `${Math.min(wing.occupancy_pct ?? 0, 100)}%`, background: (wing.occupancy_pct ?? 0) > 95 ? "var(--c-red)" : "#818cf8" }} />
                  </div>
                </div>

                {wing.residents.length === 0 ? (
                  <p className="text-xs text-center py-3" style={{ color: "var(--text-muted)" }}>No residents allocated.</p>
                ) : (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {wing.residents.map(r => (
                      <div key={r.id} className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg" style={{ background: "rgba(var(--fg-rgb),0.03)" }}>
                        <span style={{ color: "var(--text-secondary)" }}>{r.full_name}</span>
                        <span className="flex items-center gap-2">
                          <span style={{ color: "var(--text-muted)" }}>Room {r.room_number}</span>
                          {(r.fall_risk === "high" || r.fall_risk === "critical") && (
                            <AlertTriangle size={10} style={{ color: "var(--c-red)" }} />
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {data.staff_on_shift_now.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(var(--fg-rgb),0.02)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <UserCheck2 size={13} style={{ color: "var(--c-green)" }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Staff on shift right now</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.staff_on_shift_now.map(s => (
                  <span key={s.id} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(52,211,153,0.1)", color: "var(--c-green)" }}>
                    {s.name} · {s.shift_type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: "var(--bg-elevated)", border: "1px solid rgba(129,140,248,0.25)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Add Wing</h3>
              <button onClick={() => setShowModal(false)} style={{ color: "var(--text-muted)" }}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Rose Wing" className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Floor</label>
                <input value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} placeholder="e.g. Ground Floor" className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Bed Count</label>
                <input type="number" min="0" value={form.bed_count} onChange={e => setForm(f => ({ ...f, bed_count: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Lead Staff</label>
                <select value={form.lead_staff} onChange={e => setForm(f => ({ ...f, lead_staff: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                  <option value="">None</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{ background: "rgba(var(--fg-rgb),0.06)", color: "rgba(var(--fg-rgb),0.7)", border: "1px solid rgba(var(--fg-rgb),0.08)" }}>Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.name} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{ background: "#0d9488" }}>{saving ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
        <Users size={11} /> Tip: allocate a resident to a wing from their profile edit page to see them appear here.
      </div>
    </div>
  );
}
