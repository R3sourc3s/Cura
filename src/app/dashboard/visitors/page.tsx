"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Plus, X, Search, CheckCircle, XCircle, LogOut } from "lucide-react";

interface VisitorLog {
  id: number; resident: number; resident_name?: string;
  visitor_name: string; relationship: string; phone: string;
  signed_in: string; signed_out: string | null;
  purpose: string; health_screening_passed: boolean;
  screening_notes: string; logged_by: number | null; logged_by_name?: string;
  is_signed_out: boolean;
}
interface Resident { id: number; full_name: string; }

export default function VisitorsPage() {
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterResident, setFilterResident] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState<number | null>(null);
  const [form, setForm] = useState({
    resident: "", visitor_name: "", relationship: "", phone: "",
    purpose: "", health_screening_passed: true, screening_notes: "",
    signed_in: new Date().toISOString().slice(0, 16),
  });

  const load = useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams({ ordering: "-signed_in", page_size: "100" });
    if (filterResident) qs.set("resident", filterResident);
    fetch(`/api/v1/visitors/?${qs}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setLogs(d.results ?? d))
      .catch(console.error).finally(() => setLoading(false));
  }, [filterResident]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    fetch("/api/v1/residents/?is_active=true&page_size=100", { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setResidents(d.results ?? []));
  }, []);

  async function handleSignOut(id: number) {
    setSigningOut(id);
    try {
      const res = await fetch(`/api/v1/visitors/${id}/sign-out/`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      if (res.ok) { const updated = await res.json(); setLogs(p => p.map(l => l.id === id ? updated : l)); }
    } finally { setSigningOut(null); }
  }

  async function handleSave() {
    if (!form.resident || !form.visitor_name) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/visitors/", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, resident: Number(form.resident) }),
      });
      if (res.ok) { const n = await res.json(); setLogs(p => [n, ...p]); setShowModal(false); setForm({ resident: "", visitor_name: "", relationship: "", phone: "", purpose: "", health_screening_passed: true, screening_notes: "", signed_in: new Date().toISOString().slice(0, 16) }); }
    } finally { setSaving(false); }
  }

  const filtered = logs.filter(l => {
    if (filterDate && !l.signed_in.startsWith(filterDate)) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return l.visitor_name.toLowerCase().includes(q) || (l.resident_name ?? "").toLowerCase().includes(q);
  });

  const today = new Date().toISOString().slice(0, 10);
  const currentlyIn = logs.filter(l => !l.is_signed_out);
  const todayVisits = logs.filter(l => l.signed_in.startsWith(today)).length;
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const weekVisits = logs.filter(l => l.signed_in >= weekAgo).length;

  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.2)" }}>
            <Users size={16} style={{ color: "#34d399" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Visitor Log</h1>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Sign in / sign out tracking</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white" style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
          <Plus size={14} /> Log Visitor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Currently Inside", value: currentlyIn.length, color: "#34d399" },
          { label: "Visits Today", value: todayVisits, color: "#60a5fa" },
          { label: "This Week", value: weekVisits, color: "#a78bfa" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Currently in */}
      {currentlyIn.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.15)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "#34d399" }}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Currently Signed In
          </p>
          <div className="space-y-2">
            {currentlyIn.map(v => (
              <div key={v.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>{v.visitor_name[0]}</div>
                  <div>
                    <div className="text-sm font-medium text-white">{v.visitor_name}</div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{v.relationship} of {v.resident_name} · in since {new Date(v.signed_in).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
                <button onClick={() => handleSignOut(v.id)} disabled={signingOut === v.id}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg disabled:opacity-50"
                  style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <LogOut size={12} />{signingOut === v.id ? "…" : "Sign Out"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.25)" }} />
          <input type="text" placeholder="Search visitor or resident…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full text-sm pl-9 pr-4 py-2 rounded-xl outline-none" style={{ ...inputStyle, border: "1px solid rgba(255,255,255,0.08)" }} />
        </div>
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="text-sm px-3 py-2 rounded-xl outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }} />
        <select value={filterResident} onChange={e => setFilterResident(e.target.value)} className="text-sm px-3 py-2 rounded-xl outline-none appearance-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
          <option value="">All Residents</option>
          {residents.map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
        </select>
      </div>

      {/* Log table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
        <table className="w-full min-w-[640px]">
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Visitor","Resident","Signed In","Signed Out","Purpose","Health Screen"].map(h => (
                <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-3" style={{ color: "rgba(255,255,255,0.35)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody style={{ background: "rgba(5,9,20,0.6)" }}>
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No visitor records found</td></tr>
            ) : filtered.map(v => (
              <tr key={v.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-white">{v.visitor_name}</div>
                  {v.relationship && <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{v.relationship}</div>}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>{v.resident_name ?? `#${v.resident}`}</td>
                <td className="px-4 py-3 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {new Date(v.signed_in).toLocaleDateString("en-GB")} {new Date(v.signed_in).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-4 py-3 text-xs">
                  {v.signed_out
                    ? <span style={{ color: "rgba(255,255,255,0.5)" }}>{new Date(v.signed_out).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                    : <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}>Still in</span>}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{v.purpose || "—"}</td>
                <td className="px-4 py-3">
                  {v.health_screening_passed
                    ? <CheckCircle size={16} style={{ color: "#34d399" }} />
                    : <XCircle size={16} style={{ color: "#f87171" }} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "#0f1629", border: "1px solid rgba(124,58,237,0.25)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Log Visitor</h3>
              <button onClick={() => setShowModal(false)} style={{ color: "rgba(255,255,255,0.4)" }}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: "Resident *", el: <select value={form.resident} onChange={e => setForm(f => ({ ...f, resident: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}><option value="">Select…</option>{residents.map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}</select> },
                { label: "Visitor Name *", el: <input value={form.visitor_name} onChange={e => setForm(f => ({ ...f, visitor_name: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="Full name" /> },
                { label: "Relationship", el: <input value={form.relationship} onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="e.g. Daughter" /> },
                { label: "Phone", el: <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="Optional" /> },
                { label: "Purpose", el: <input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="Social visit, medical…" /> },
                { label: "Signed In *", el: <input type="datetime-local" value={form.signed_in} onChange={e => setForm(f => ({ ...f, signed_in: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} /> },
              ].map(({ label, el }) => (
                <div key={label}><label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</label>{el}</div>
              ))}
              <div className="flex items-center gap-3">
                <input type="checkbox" id="health" checked={form.health_screening_passed} onChange={e => setForm(f => ({ ...f, health_screening_passed: e.target.checked }))} className="w-4 h-4 rounded" />
                <label htmlFor="health" className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>Health screening passed</label>
              </div>
              {!form.health_screening_passed && (
                <div><label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Screening Notes</label>
                <textarea rows={2} value={form.screening_notes} onChange={e => setForm(f => ({ ...f, screening_notes: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={inputStyle} /></div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.resident || !form.visitor_name} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>{saving ? "Saving…" : "Log Visitor"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
