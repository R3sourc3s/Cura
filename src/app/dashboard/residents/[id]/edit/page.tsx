"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { residents as residentsApi } from "@/lib/api";
import type { Resident } from "@/types";
import { Save, Upload } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 text-sm rounded-xl outline-none text-white";
const inputStyle = { background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "var(--text-primary)" };

export default function EditResidentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [wings, setWings] = useState<{ id: number; name: string }[]>([]);

  const [form, setForm] = useState({
    first_name: "", last_name: "", date_of_birth: "", nhs_number: "",
    room_number: "", wing: "", admission_date: "", discharge_date: "",
    fall_risk: "low", pressure_ulcer_risk: "low",
    next_of_kin_name: "", next_of_kin_phone: "",
    gp_name: "", gp_phone: "", is_active: true,
  });

  useEffect(() => {
    fetch("/api/v1/staff/wings/?page_size=100", { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setWings(d.results ?? d));
  }, []);

  useEffect(() => {
    residentsApi.get(Number(id)).then((r) => {
      setResident(r);
      setForm({
        first_name: r.first_name, last_name: r.last_name,
        date_of_birth: r.date_of_birth, nhs_number: r.nhs_number ?? "",
        room_number: r.room_number, wing: r.wing ? String(r.wing) : "", admission_date: r.admission_date,
        discharge_date: r.discharge_date ?? "",
        fall_risk: r.fall_risk, pressure_ulcer_risk: r.pressure_ulcer_risk,
        next_of_kin_name: r.next_of_kin_name ?? "", next_of_kin_phone: r.next_of_kin_phone ?? "",
        gp_name: r.gp_name ?? "", gp_phone: r.gp_phone ?? "",
        is_active: r.is_active,
      });
      if (r.photo) setPhotoPreview(r.photo);
    }).catch(() => router.replace("/dashboard/residents"))
      .finally(() => setLoading(false));
  }, [id, router]);

  function set(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== "" && v !== null && v !== undefined) fd.append(k, String(v));
      });
      if (photoFile) fd.append("photo", photoFile);
      await residentsApi.update(Number(id), fd);
      router.push(`/dashboard/residents/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
    </div>
  );
  if (!resident) return null;

  const riskOptions = ["low", "medium", "high", "critical"];

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-3xl mx-auto">
      <Breadcrumbs crumbs={[
        { label: "Residents", href: "/dashboard/residents" },
        { label: resident.full_name, href: `/dashboard/residents/${id}` },
        { label: "Edit" },
      ]} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Edit — {resident.full_name}</h1>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
          style={{ background: "#0d9488" }}>
          <Save size={14} />{saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm text-red-300"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          {error}
        </div>
      )}

      {/* Photo */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(var(--fg-rgb),0.03)", border: "1px solid rgba(var(--fg-rgb),0.08)" }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "rgba(var(--fg-rgb),0.35)" }}>Profile Photo</div>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center"
            style={{ background: "rgba(13, 148, 136,0.12)", border: "1px solid rgba(13, 148, 136,0.2)" }}>
            {photoPreview
              ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              : <span className="text-2xl font-bold" style={{ color: "var(--c-teal)" }}>
                  {resident.first_name[0]}{resident.last_name[0]}
                </span>
            }
          </div>
          <label className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl cursor-pointer transition-all"
            style={{ background: "rgba(var(--fg-rgb),0.06)", color: "rgba(var(--fg-rgb),0.7)", border: "1px solid rgba(var(--fg-rgb),0.08)" }}>
            <Upload size={14} /> Upload Photo
            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </label>
        </div>
      </div>

      {/* Personal */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(var(--fg-rgb),0.03)", border: "1px solid rgba(var(--fg-rgb),0.08)" }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(var(--fg-rgb),0.35)" }}>Personal Information</div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name" required>
            <input className={inputCls} style={inputStyle} value={form.first_name}
              onChange={(e) => set("first_name", e.target.value)} required />
          </Field>
          <Field label="Last Name" required>
            <input className={inputCls} style={inputStyle} value={form.last_name}
              onChange={(e) => set("last_name", e.target.value)} required />
          </Field>
          <Field label="Date of Birth" required>
            <input type="date" className={inputCls} style={inputStyle} value={form.date_of_birth}
              onChange={(e) => set("date_of_birth", e.target.value)} required />
          </Field>
          <Field label="NHS Number">
            <input className={inputCls} style={inputStyle} value={form.nhs_number}
              onChange={(e) => set("nhs_number", e.target.value)} />
          </Field>
          <Field label="Room Number" required>
            <input className={inputCls} style={inputStyle} value={form.room_number}
              onChange={(e) => set("room_number", e.target.value)} required />
          </Field>
          <Field label="Wing">
            <select className={inputCls} style={inputStyle} value={form.wing}
              onChange={(e) => set("wing", e.target.value)}>
              <option value="">— unassigned —</option>
              {wings.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </Field>
          <Field label="Admission Date" required>
            <input type="date" className={inputCls} style={inputStyle} value={form.admission_date}
              onChange={(e) => set("admission_date", e.target.value)} required />
          </Field>
          <Field label="Discharge Date">
            <input type="date" className={inputCls} style={inputStyle} value={form.discharge_date}
              onChange={(e) => set("discharge_date", e.target.value)} />
          </Field>
          <Field label="Status">
            <select className={inputCls} style={inputStyle} value={form.is_active ? "true" : "false"}
              onChange={(e) => set("is_active", e.target.value === "true")}>
              <option value="true">Active</option>
              <option value="false">Discharged</option>
            </select>
          </Field>
        </div>
      </div>

      {/* Risk */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(var(--fg-rgb),0.03)", border: "1px solid rgba(var(--fg-rgb),0.08)" }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(var(--fg-rgb),0.35)" }}>Risk Assessment</div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fall Risk" required>
            <select className={inputCls} style={inputStyle} value={form.fall_risk}
              onChange={(e) => set("fall_risk", e.target.value)}>
              {riskOptions.map((o) => <option key={o} value={o} className="capitalize">{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
            </select>
          </Field>
          <Field label="Pressure Ulcer Risk" required>
            <select className={inputCls} style={inputStyle} value={form.pressure_ulcer_risk}
              onChange={(e) => set("pressure_ulcer_risk", e.target.value)}>
              {riskOptions.map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
            </select>
          </Field>
        </div>
      </div>

      {/* Contacts */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(var(--fg-rgb),0.03)", border: "1px solid rgba(var(--fg-rgb),0.08)" }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(var(--fg-rgb),0.35)" }}>Key Contacts</div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Next of Kin Name">
            <input className={inputCls} style={inputStyle} value={form.next_of_kin_name}
              onChange={(e) => set("next_of_kin_name", e.target.value)} />
          </Field>
          <Field label="Next of Kin Phone">
            <input type="tel" className={inputCls} style={inputStyle} value={form.next_of_kin_phone}
              onChange={(e) => set("next_of_kin_phone", e.target.value)} />
          </Field>
          <Field label="GP Name">
            <input className={inputCls} style={inputStyle} value={form.gp_name}
              onChange={(e) => set("gp_name", e.target.value)} />
          </Field>
          <Field label="GP Phone">
            <input type="tel" className={inputCls} style={inputStyle} value={form.gp_phone}
              onChange={(e) => set("gp_phone", e.target.value)} />
          </Field>
        </div>
      </div>
    </form>
  );
}
