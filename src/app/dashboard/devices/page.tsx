"use client";

import { useEffect, useState, useCallback } from "react";
import { Watch, Plus, X, BatteryLow, BatteryMedium, BatteryFull, AlertTriangle, Trash2, WifiOff, Wifi } from "lucide-react";
import { useToast } from "@/components/Toast";
import { useUser } from "@/context/UserContext";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Device, DeviceType } from "@/types";

interface ResidentOption { id: number; full_name: string; }

const inputStyle = { background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" };

const DEVICE_TYPES: { value: DeviceType; label: string }[] = [
  { value: "wearable", label: "Wearable (watch / pendant)" },
  { value: "fall_sensor", label: "Fall sensor" },
  { value: "bed_sensor", label: "Bed occupancy sensor" },
  { value: "motion_sensor", label: "Motion / ambient sensor" },
  { value: "door_sensor", label: "Door sensor" },
  { value: "other", label: "Other" },
];

function batteryIcon(level: number | null) {
  if (level == null) return null;
  if (level <= 20) return <BatteryLow size={13} style={{ color: "var(--c-red)" }} />;
  if (level <= 60) return <BatteryMedium size={13} style={{ color: "var(--c-amber)" }} />;
  return <BatteryFull size={13} style={{ color: "var(--c-green)" }} />;
}

function isStale(lastSeen: string | null) {
  if (!lastSeen) return true;
  return Date.now() - new Date(lastSeen).getTime() > 1000 * 60 * 60 * 6; // 6h without a check-in
}

export default function DevicesPage() {
  const { can } = useUser();
  const { toast } = useToast();

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [residents, setResidents] = useState<ResidentOption[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Device | null>(null);
  const [form, setForm] = useState({ name: "", device_type: "wearable" as DeviceType, external_id: "", manufacturer: "", resident: "" });

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/v1/devices/", { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setDevices(d.results ?? d))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch("/api/v1/residents/?is_active=true&page_size=200", { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setResidents((d.results ?? []).map((r: { id: number; full_name: string }) => ({ id: r.id, full_name: r.full_name }))))
      .catch(console.error);
  }, []);

  async function handleCreate() {
    if (!form.name || !form.external_id) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: form.name, device_type: form.device_type, external_id: form.external_id, manufacturer: form.manufacturer,
      };
      if (form.resident) body.resident = Number(form.resident);
      const res = await fetch("/api/v1/devices/", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ name: "", device_type: "wearable", external_id: "", manufacturer: "", resident: "" });
        toast("Device registered.", "success");
        load();
      } else {
        const err = await res.json().catch(() => null);
        toast(err?.external_id?.[0] || "Could not register device.", "error");
      }
    } catch { toast("Network error — please try again.", "error"); }
    finally { setSaving(false); }
  }

  async function assignResident(device: Device, residentId: string) {
    try {
      const res = await fetch(`/api/v1/devices/${device.id}/`, {
        method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resident: residentId ? Number(residentId) : null }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDevices(prev => prev.map(d => d.id === device.id ? updated : d));
      } else { toast("Could not update assignment.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
  }

  async function handleRemove(device: Device) {
    try {
      const res = await fetch(`/api/v1/devices/${device.id}/`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setDevices(prev => prev.filter(d => d.id !== device.id));
        toast("Device removed.", "success");
      } else { toast("Could not remove device.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
  }

  const fallDetections = devices.filter(d => d.latest_reading?.reading_type === "fall_detected").length;
  const onlineCount = devices.filter(d => !isStale(d.last_seen_at)).length;

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.2)" }}>
            <Watch size={16} style={{ color: "#818cf8" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Devices &amp; Sensors</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Wearables, fall sensors, and ambient monitoring — falls auto-log to Incidents, vitals auto-log to Vitals</p>
          </div>
        </div>
        {can("devices.manage") && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white"
            style={{ background: "#0d9488" }}>
            <Plus size={14} /> Register Device
          </button>
        )}
      </div>

      {!loading && devices.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Devices", value: devices.length, color: "#818cf8" },
            { label: "Online (last 6h)", value: onlineCount, color: "var(--c-green)" },
            { label: "Fall Alerts", value: fallDetections, color: "var(--c-red)" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl p-4 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-hover)" }}>
              <div className="text-2xl font-bold" style={{ color }}>{value}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" /></div>
      ) : devices.length === 0 ? (
        <EmptyState icon={Watch} title="No devices registered" description="Register a wearable or sensor to start receiving fall alerts and vitals automatically."
          action={{ label: "Register Device", onClick: () => setShowModal(true) }} />
      ) : (
        <div className="space-y-2">
          {devices.map(d => {
            const stale = isStale(d.last_seen_at);
            const fallAlert = d.latest_reading?.reading_type === "fall_detected";
            return (
              <div key={d.id} className="rounded-2xl p-4"
                style={{ background: "rgba(var(--fg-rgb),0.03)", border: fallAlert ? "1px solid rgba(239,68,68,0.35)" : "1px solid rgba(var(--fg-rgb),0.07)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{d.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(129,140,248,0.12)", color: "#818cf8" }}>
                        {d.device_type_display}
                      </span>
                      {fallAlert && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(239,68,68,0.15)", color: "var(--c-red)" }}>
                          <AlertTriangle size={10} /> Fall detected
                        </span>
                      )}
                      {stale ? (
                        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}><WifiOff size={11} /> Offline</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--c-green)" }}><Wifi size={11} /> Online</span>
                      )}
                      {batteryIcon(d.battery_level)}
                      {d.battery_level != null && <span className="text-xs" style={{ color: "var(--text-muted)" }}>{d.battery_level}%</span>}
                    </div>
                    <div className="text-xs mt-1 font-mono" style={{ color: "var(--text-muted)" }}>{d.external_id}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(var(--fg-rgb),0.35)" }}>
                      {d.last_seen_at ? `Last check-in ${new Date(d.last_seen_at).toLocaleString("en-GB")}` : "Never reported in"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {can("devices.manage") ? (
                      <select value={d.resident ?? ""} onChange={e => assignResident(d, e.target.value)}
                        className="text-xs px-2.5 py-1.5 rounded-lg outline-none" style={inputStyle}>
                        <option value="">Unassigned</option>
                        {residents.map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
                      </select>
                    ) : (
                      <span className="text-xs px-2.5 py-1.5 rounded-lg" style={{ background: "var(--input-bg)", color: "var(--text-secondary)" }}>
                        {d.resident_name || "Unassigned"}
                      </span>
                    )}
                    {can("devices.manage") && (
                      <button onClick={() => setRemoveTarget(d)} aria-label={`Remove ${d.name}`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(239,68,68,0.08)", color: "var(--c-red)" }}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div role="dialog" aria-modal="true" aria-labelledby="device-modal-title" className="rounded-2xl p-6 w-full max-w-sm" style={{ background: "var(--bg-elevated)", border: "1px solid rgba(129,140,248,0.25)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 id="device-modal-title" className="text-base font-bold text-white">Register Device</h3>
              <button onClick={() => setShowModal(false)} aria-label="Close" style={{ color: "var(--text-muted)" }}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Margaret's fall pendant" className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Type</label>
                <select value={form.device_type} onChange={e => setForm(f => ({ ...f, device_type: e.target.value as DeviceType }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                  {DEVICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Device ID *</label>
                <input value={form.external_id} onChange={e => setForm(f => ({ ...f, external_id: e.target.value }))} placeholder="Serial number / gateway ID" className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} />
                <p className="text-xs mt-1" style={{ color: "rgba(var(--fg-rgb),0.35)" }}>Must match the ID the device sends when reporting data.</p>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Manufacturer</label>
                <input value={form.manufacturer} onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))} placeholder="Optional" className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Assign to resident</label>
                <select value={form.resident} onChange={e => setForm(f => ({ ...f, resident: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                  <option value="">Unassigned for now</option>
                  {residents.map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{ background: "rgba(var(--fg-rgb),0.06)", color: "rgba(var(--fg-rgb),0.7)", border: "1px solid rgba(var(--fg-rgb),0.08)" }}>Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.name || !form.external_id} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{ background: "#0d9488" }}>{saving ? "Saving…" : "Register"}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={removeTarget !== null}
        title="Remove device?"
        message={removeTarget ? `"${removeTarget.name}" will stop reporting and its history will remain on record. This cannot be undone.` : ""}
        confirmLabel="Remove"
        danger
        onConfirm={() => { if (removeTarget) { handleRemove(removeTarget); setRemoveTarget(null); } }}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
