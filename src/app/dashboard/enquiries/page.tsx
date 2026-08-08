"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ClipboardPlus, Plus, X, Search, Filter, ChevronDown,
  User, Phone, Mail, CalendarDays, CheckCircle2, ArrowRight,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

interface Enquiry {
  id: number;
  care_home: number;
  prospective_resident_name: string;
  date_of_birth: string | null;
  contact_name: string;
  contact_relationship: string;
  contact_phone: string;
  contact_email: string;
  care_needs: string;
  funding_type: string;
  status: string;
  enquiry_date: string;
  assessment_date: string | null;
  notes: string;
  assigned_to: number | null;
  assigned_to_name: string | null;
  has_assessment: boolean;
  created_at: string;
  updated_at: string;
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  new:               { label: "New",               color: "var(--c-teal2)", bg: "rgba(45, 212, 191,0.12)" },
  in_progress:       { label: "In Progress",       color: "var(--c-amber)", bg: "rgba(251,191,36,0.12)" },
  assessment_booked: { label: "Assessment Booked", color: "var(--c-teal)", bg: "rgba(167,139,250,0.12)" },
  waitlisted:        { label: "Waitlisted",        color: "var(--c-orange)", bg: "rgba(251,146,60,0.12)" },
  admitted:          { label: "Admitted",          color: "var(--c-green)", bg: "rgba(52,211,153,0.12)" },
  declined:          { label: "Declined",          color: "var(--c-red)", bg: "rgba(248,113,113,0.12)" },
  withdrawn:         { label: "Withdrawn",         color: "#9ca3af", bg: "rgba(156,163,175,0.12)" },
};

const FUNDING_LABELS: Record<string, string> = {
  self_funded:    "Self-Funded",
  local_authority:"Local Authority",
  nhs:            "NHS Continuing Healthcare",
  mixed:          "Mixed Funding",
  unknown:        "Unknown",
};

const PIPELINE_STEPS = [
  "new",
  "in_progress",
  "assessment_booked",
  "waitlisted",
  "admitted",
] as const;

const TERMINAL_STATUSES = ["declined", "withdrawn"];

const EMPTY_FORM = {
  prospective_resident_name: "",
  date_of_birth: "",
  contact_name: "",
  contact_relationship: "",
  contact_phone: "",
  contact_email: "",
  care_needs: "",
  funding_type: "unknown",
  status: "new",
  enquiry_date: new Date().toISOString().slice(0, 10),
  assessment_date: "",
  notes: "",
};

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFunding, setFilterFunding] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const load = useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams({ ordering: "-enquiry_date", page_size: "100" });
    if (filterStatus) qs.set("status", filterStatus);
    if (filterFunding) qs.set("funding_type", filterFunding);
    fetch(`/api/v1/enquiries/?${qs}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setEnquiries(d.results ?? d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterStatus, filterFunding]);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    if (!form.prospective_resident_name || !form.contact_name || !form.enquiry_date) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = { ...form };
      if (!body.date_of_birth) delete body.date_of_birth;
      if (!body.assessment_date) delete body.assessment_date;

      const res = await fetch("/api/v1/enquiries/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const created = await res.json();
        setEnquiries(prev => [created, ...prev]);
        setShowModal(false);
        setForm({ ...EMPTY_FORM });
      }
    } finally {
      setSaving(false);
    }
  }

  const filtered = enquiries.filter(e => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.prospective_resident_name.toLowerCase().includes(q) ||
      e.contact_name.toLowerCase().includes(q) ||
      e.contact_email.toLowerCase().includes(q)
    );
  });

  // Stats
  const total = enquiries.length;
  const newCount = enquiries.filter(e => e.status === "new").length;
  const assessmentBookedCount = enquiries.filter(e => e.status === "assessment_booked").length;
  const thisMonth = new Date();
  const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1).toISOString().slice(0, 10);
  const admittedThisMonth = enquiries.filter(e => e.status === "admitted" && e.enquiry_date >= monthStart).length;

  const pipelineCounts = Object.fromEntries(
    PIPELINE_STEPS.map(s => [s, enquiries.filter(e => e.status === s).length])
  );

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(13, 148, 136,0.12)", border: "1px solid rgba(13, 148, 136,0.2)" }}
          >
            <ClipboardPlus size={16} style={{ color: "var(--c-teal)" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Enquiries</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Manage prospective resident enquiries</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white"
          style={{ background: "#0d9488" }}
        >
          <Plus size={14} /> Add Enquiry
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Enquiries",       value: total,                color: "var(--c-teal)" },
          { label: "New",                   value: newCount,             color: "var(--c-teal2)" },
          { label: "Assessment Booked",     value: assessmentBookedCount,color: "var(--c-teal)" },
          { label: "Admitted This Month",   value: admittedThisMonth,    color: "var(--c-green)" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-2xl p-4 text-center"
            style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-hover)" }}
          >
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Status Pipeline */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-hover)" }}
      >
        <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-muted)" }}>PIPELINE</p>
        <div className="flex items-center gap-1 flex-wrap">
          {PIPELINE_STEPS.map((step, idx) => {
            const cfg = STATUS_CFG[step];
            const count = pipelineCounts[step] ?? 0;
            return (
              <div key={step} className="flex items-center gap-1">
                <div
                  className="flex flex-col items-center px-3 py-2 rounded-xl cursor-pointer transition-opacity hover:opacity-80"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.color}33`, minWidth: 90 }}
                  onClick={() => setFilterStatus(filterStatus === step ? "" : step)}
                >
                  <span className="text-lg font-bold" style={{ color: cfg.color }}>{count}</span>
                  <span className="text-xs text-center leading-tight mt-0.5" style={{ color: cfg.color }}>{cfg.label}</span>
                </div>
                {idx < PIPELINE_STEPS.length - 1 && (
                  <ArrowRight size={14} style={{ color: "rgba(var(--fg-rgb),0.2)", flexShrink: 0 }} />
                )}
              </div>
            );
          })}
          {/* Terminal statuses */}
          <div className="flex items-center gap-1 ml-2 pl-2" style={{ borderLeft: "1px solid rgba(var(--fg-rgb),0.08)" }}>
            {TERMINAL_STATUSES.map(step => {
              const cfg = STATUS_CFG[step];
              const count = enquiries.filter(e => e.status === step).length;
              return (
                <div
                  key={step}
                  className="flex flex-col items-center px-3 py-2 rounded-xl cursor-pointer transition-opacity hover:opacity-80"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.color}33`, minWidth: 80 }}
                  onClick={() => setFilterStatus(filterStatus === step ? "" : step)}
                >
                  <span className="text-lg font-bold" style={{ color: cfg.color }}>{count}</span>
                  <span className="text-xs text-center leading-tight mt-0.5" style={{ color: cfg.color }}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        {filterStatus && (
          <button
            className="mt-2 text-xs"
            style={{ color: "rgba(var(--fg-rgb),0.35)" }}
            onClick={() => setFilterStatus("")}
          >
            Clear filter &times;
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search name, contact, email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-sm pl-9 pr-4 py-2 rounded-xl outline-none"
            style={{ background: "var(--input-bg)", border: "1px solid var(--bg-card-hover)", color: "var(--text-secondary)" }}
          />
        </div>
        {[
          {
            value: filterStatus,
            set: setFilterStatus,
            opts: [
              ["", "All Statuses"],
              ...Object.entries(STATUS_CFG).map(([v, c]) => [v, c.label]),
            ],
          },
          {
            value: filterFunding,
            set: setFilterFunding,
            opts: [
              ["", "All Funding"],
              ...Object.entries(FUNDING_LABELS).map(([v, l]) => [v, l]),
            ],
          },
        ].map((f, i) => (
          <div key={i} className="relative">
            <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(var(--fg-rgb),0.25)" }} />
            <select
              value={f.value}
              onChange={e => f.set(e.target.value)}
              className="text-sm pl-8 pr-8 py-2 rounded-xl outline-none appearance-none"
              style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.08)", color: "rgba(var(--fg-rgb),0.6)" }}
            >
              {f.opts.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(var(--fg-rgb),0.3)" }} />
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardPlus}
          title="No enquiries found"
          description="Record a new enquiry to get started."
          action={{ label: "Add Enquiry", onClick: () => setShowModal(true) }}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(enq => {
            const statusCfg = STATUS_CFG[enq.status] ?? STATUS_CFG.new;
            return (
              <div
                key={enq.id}
                className="rounded-2xl p-4"
                style={{ background: "rgba(var(--fg-rgb),0.03)", border: "1px solid rgba(var(--fg-rgb),0.07)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Top row: name + badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-sm font-semibold text-white">{enq.prospective_resident_name}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: statusCfg.bg, color: statusCfg.color }}
                      >
                        {statusCfg.label}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(var(--fg-rgb),0.05)", color: "rgba(var(--fg-rgb),0.45)" }}
                      >
                        {FUNDING_LABELS[enq.funding_type] ?? enq.funding_type}
                      </span>
                      {enq.has_assessment && (
                        <span
                          className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(52,211,153,0.1)", color: "var(--c-green)" }}
                        >
                          <CheckCircle2 size={10} /> Assessment
                        </span>
                      )}
                    </div>

                    {/* Contact info */}
                    <div className="flex items-center flex-wrap gap-3 text-xs" style={{ color: "rgba(var(--fg-rgb),0.45)" }}>
                      <span className="flex items-center gap-1">
                        <User size={11} />
                        {enq.contact_name}
                        {enq.contact_relationship && ` (${enq.contact_relationship})`}
                      </span>
                      {enq.contact_phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={11} /> {enq.contact_phone}
                        </span>
                      )}
                      {enq.contact_email && (
                        <span className="flex items-center gap-1">
                          <Mail size={11} /> {enq.contact_email}
                        </span>
                      )}
                    </div>

                    {/* Care needs excerpt */}
                    {enq.care_needs && (
                      <p
                        className="text-xs mt-1.5 line-clamp-2"
                        style={{ color: "rgba(var(--fg-rgb),0.4)" }}
                      >
                        {enq.care_needs}
                      </p>
                    )}
                  </div>

                  {/* Right column */}
                  <div className="text-right flex-shrink-0 space-y-1">
                    <div className="flex items-center justify-end gap-1 text-xs" style={{ color: "rgba(var(--fg-rgb),0.35)" }}>
                      <CalendarDays size={11} />
                      {new Date(enq.enquiry_date).toLocaleDateString("en-GB")}
                    </div>
                    {enq.assigned_to_name && (
                      <div className="text-xs" style={{ color: "rgba(var(--fg-rgb),0.3)" }}>
                        {enq.assigned_to_name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Enquiry Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            style={{ background: "var(--bg-elevated)", border: "1px solid rgba(13, 148, 136,0.25)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Add Enquiry</h3>
              <button onClick={() => setShowModal(false)} style={{ color: "rgba(var(--fg-rgb),0.4)" }}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Prospective Resident */}
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>Prospective Resident Name *</label>
                <input
                  type="text"
                  placeholder="Full name…"
                  value={form.prospective_resident_name}
                  onChange={e => setForm(f => ({ ...f, prospective_resident_name: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none"
                  style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}
                />
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>Date of Birth</label>
                <input
                  type="date"
                  value={form.date_of_birth}
                  onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none"
                  style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}
                />
              </div>

              {/* Contact */}
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>Contact Name *</label>
                <input
                  type="text"
                  placeholder="Contact person…"
                  value={form.contact_name}
                  onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none"
                  style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}
                />
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>Relationship</label>
                <input
                  type="text"
                  placeholder="e.g. Son, Daughter, Social Worker…"
                  value={form.contact_relationship}
                  onChange={e => setForm(f => ({ ...f, contact_relationship: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none"
                  style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>Phone</label>
                  <input
                    type="tel"
                    placeholder="Contact phone…"
                    value={form.contact_phone}
                    onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none"
                    style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>Email</label>
                  <input
                    type="email"
                    placeholder="Contact email…"
                    value={form.contact_email}
                    onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none"
                    style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}
                  />
                </div>
              </div>

              {/* Funding & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>Funding Type</label>
                  <div className="relative">
                    <select
                      value={form.funding_type}
                      onChange={e => setForm(f => ({ ...f, funding_type: e.target.value }))}
                      className="w-full text-sm px-3 pr-8 py-2 rounded-xl outline-none appearance-none"
                      style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}
                    >
                      {Object.entries(FUNDING_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(var(--fg-rgb),0.3)" }} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>Status</label>
                  <div className="relative">
                    <select
                      value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full text-sm px-3 pr-8 py-2 rounded-xl outline-none appearance-none"
                      style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}
                    >
                      {Object.entries(STATUS_CFG).map(([v, c]) => (
                        <option key={v} value={v}>{c.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(var(--fg-rgb),0.3)" }} />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>Enquiry Date *</label>
                  <input
                    type="date"
                    value={form.enquiry_date}
                    onChange={e => setForm(f => ({ ...f, enquiry_date: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none"
                    style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>Assessment Date</label>
                  <input
                    type="datetime-local"
                    value={form.assessment_date}
                    onChange={e => setForm(f => ({ ...f, assessment_date: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none"
                    style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}
                  />
                </div>
              </div>

              {/* Care Needs */}
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>Care Needs</label>
                <textarea
                  rows={3}
                  placeholder="Describe care requirements…"
                  value={form.care_needs}
                  onChange={e => setForm(f => ({ ...f, care_needs: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none"
                  style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional notes…"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none"
                  style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setShowModal(false); setForm({ ...EMPTY_FORM }); }}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
                style={{ background: "rgba(var(--fg-rgb),0.06)", color: "rgba(var(--fg-rgb),0.7)", border: "1px solid rgba(var(--fg-rgb),0.08)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.prospective_resident_name || !form.contact_name || !form.enquiry_date}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
                style={{ background: "#0d9488" }}
              >
                {saving ? "Saving…" : "Save Enquiry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
