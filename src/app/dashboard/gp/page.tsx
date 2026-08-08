"use client";

import { useEffect, useState, useCallback } from "react";
import { Stethoscope, Plus, X, Search, Filter, ChevronDown, Phone, Mail, MapPin, Building2, User, AlertCircle } from "lucide-react";
import { useToast } from "@/components/Toast";
import EmptyState from "@/components/ui/EmptyState";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Referral {
  id: number;
  resident: number;
  resident_name?: string;
  referral_type: string;
  referred_to: string;
  reason: string;
  urgency: "routine" | "urgent" | "emergency";
  status: string;
  referred_by: number | null;
  referred_by_name?: string;
  referral_date: string;
  appointment_date?: string | null;
  outcome: string;
  created_at: string;
}

interface DischargeSummary {
  id: number;
  resident: number;
  resident_name?: string;
  hospital: number | null;
  hospital_name?: string;
  admission_date: string;
  discharge_date: string;
  diagnosis: string;
  treatment_summary: string;
  follow_up_actions: string;
  status: string;
  reviewed_by: number | null;
  reviewed_by_name?: string;
  received_at: string;
  created_at: string;
}

interface GPContact {
  id: number;
  care_home: number;
  practice_name: string;
  gp_name: string;
  phone: string;
  fax: string;
  email: string;
  address: string;
  is_active: boolean;
}

interface HospitalContact {
  id: number;
  care_home: number;
  hospital_name: string;
  department: string;
  phone: string;
  address: string;
  notes: string;
  is_active: boolean;
}

interface Resident { id: number; full_name: string; }

// ─── Config ───────────────────────────────────────────────────────────────────

const REFERRAL_STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending:           { label: "Pending",           color: "var(--c-amber)", bg: "rgba(251,191,36,0.12)" },
  sent:              { label: "Sent",               color: "var(--c-teal2)", bg: "rgba(45, 212, 191,0.12)" },
  acknowledged:      { label: "Acknowledged",       color: "var(--c-teal)", bg: "rgba(13, 148, 136,0.12)" },
  appointment_booked:{ label: "Appt Booked",        color: "var(--c-orange)", bg: "rgba(251,146,60,0.12)" },
  completed:         { label: "Completed",          color: "var(--c-green)", bg: "rgba(52,211,153,0.12)" },
  rejected:          { label: "Rejected",           color: "var(--c-red)", bg: "rgba(239,68,68,0.12)" },
};

const URGENCY_CFG: Record<string, { label: string; color: string; bg: string }> = {
  routine:   { label: "Routine",   color: "#9ca3af", bg: "rgba(107,114,128,0.1)" },
  urgent:    { label: "Urgent",    color: "var(--c-orange)", bg: "rgba(251,146,60,0.12)" },
  emergency: { label: "Emergency", color: "var(--c-red)", bg: "rgba(239,68,68,0.12)" },
};

const DISCHARGE_STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  received:        { label: "Received",        color: "var(--c-teal2)", bg: "rgba(45, 212, 191,0.12)" },
  reviewed:        { label: "Reviewed",        color: "var(--c-teal)", bg: "rgba(13, 148, 136,0.12)" },
  action_required: { label: "Action Required", color: "var(--c-red)", bg: "rgba(239,68,68,0.12)" },
  completed:       { label: "Completed",       color: "var(--c-green)", bg: "rgba(52,211,153,0.12)" },
};

const REFERRAL_TYPES = ["gp","specialist","hospital","community","mental_health","physio","other"];
const REFERRAL_TYPE_LABEL: Record<string, string> = {
  gp: "GP", specialist: "Specialist", hospital: "Hospital",
  community: "Community Service", mental_health: "Mental Health",
  physio: "Physiotherapy", other: "Other",
};

const inputStyle = {
  background: "rgba(var(--fg-rgb),0.05)",
  border: "1px solid rgba(var(--fg-rgb),0.1)",
  color: "rgba(var(--fg-rgb),0.8)",
} as const;

type Tab = "referrals" | "discharge" | "gp_contacts" | "hospital_contacts";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GPIntegrationPage() {
  const [tab, setTab] = useState<Tab>("referrals");

  // data
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [discharges, setDischarges] = useState<DischargeSummary[]>([]);
  const [gpContacts, setGpContacts] = useState<GPContact[]>([]);
  const [hospitalContacts, setHospitalContacts] = useState<HospitalContact[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);

  // loading
  const [loadingReferrals, setLoadingReferrals] = useState(true);
  const [loadingDischarges, setLoadingDischarges] = useState(true);
  const [loadingGP, setLoadingGP] = useState(true);
  const [loadingHospital, setLoadingHospital] = useState(true);

  // filters — referrals
  const [searchRef, setSearchRef] = useState("");
  const [filterRefStatus, setFilterRefStatus] = useState("");
  const [filterRefUrgency, setFilterRefUrgency] = useState("");

  // filters — discharge
  const [searchDis, setSearchDis] = useState("");
  const [filterDisStatus, setFilterDisStatus] = useState("");

  // filters — gp contacts
  const [searchGP, setSearchGP] = useState("");

  // filters — hospital contacts
  const [searchHosp, setSearchHosp] = useState("");

  // modals
  const [showNewReferral, setShowNewReferral] = useState(false);
  const [showNewGP, setShowNewGP] = useState(false);
  const [showNewHospital, setShowNewHospital] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // new referral form
  const [refForm, setRefForm] = useState({
    resident: "", referral_type: "gp", referred_to: "", reason: "",
    urgency: "routine", referral_date: new Date().toISOString().slice(0, 10),
    appointment_date: "",
  });

  // new GP contact form
  const [gpForm, setGpForm] = useState({
    practice_name: "", gp_name: "", phone: "", fax: "", email: "", address: "",
  });

  // new Hospital contact form
  const [hospForm, setHospForm] = useState({
    hospital_name: "", department: "", phone: "", address: "", notes: "",
  });

  // ── Fetchers ──────────────────────────────────────────────────────────────

  const loadReferrals = useCallback(() => {
    setLoadingReferrals(true);
    const qs = new URLSearchParams({ ordering: "-referral_date", page_size: "100" });
    if (filterRefStatus) qs.set("status", filterRefStatus);
    if (filterRefUrgency) qs.set("urgency", filterRefUrgency);
    fetch(`/api/v1/gp/referrals/?${qs}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setReferrals(d.results ?? d))
      .catch(console.error)
      .finally(() => setLoadingReferrals(false));
  }, [filterRefStatus, filterRefUrgency]);

  const loadDischarges = useCallback(() => {
    setLoadingDischarges(true);
    const qs = new URLSearchParams({ ordering: "-discharge_date", page_size: "100" });
    if (filterDisStatus) qs.set("status", filterDisStatus);
    fetch(`/api/v1/gp/discharge-summaries/?${qs}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setDischarges(d.results ?? d))
      .catch(console.error)
      .finally(() => setLoadingDischarges(false));
  }, [filterDisStatus]);

  const loadGPContacts = useCallback(() => {
    setLoadingGP(true);
    fetch("/api/v1/gp/gp-contacts/?page_size=100", { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setGpContacts(d.results ?? d))
      .catch(console.error)
      .finally(() => setLoadingGP(false));
  }, []);

  const loadHospitalContacts = useCallback(() => {
    setLoadingHospital(true);
    fetch("/api/v1/gp/hospital-contacts/?page_size=100", { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setHospitalContacts(d.results ?? d))
      .catch(console.error)
      .finally(() => setLoadingHospital(false));
  }, []);

  useEffect(() => { loadReferrals(); }, [loadReferrals]);
  useEffect(() => { loadDischarges(); }, [loadDischarges]);
  useEffect(() => { loadGPContacts(); }, [loadGPContacts]);
  useEffect(() => { loadHospitalContacts(); }, [loadHospitalContacts]);

  useEffect(() => {
    fetch("/api/v1/residents/?is_active=true&page_size=200", { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setResidents(d.results ?? []));
  }, []);

  // ── Stats ─────────────────────────────────────────────────────────────────

  const totalReferrals = referrals.length;
  const pendingReferrals = referrals.filter(r => r.status === "pending" || r.status === "sent").length;
  const totalDischarges = discharges.length;
  const actionRequired = discharges.filter(d => d.status === "action_required").length;

  // ── Filtered lists ────────────────────────────────────────────────────────

  const filteredReferrals = referrals.filter(r => {
    if (!searchRef.trim()) return true;
    const q = searchRef.toLowerCase();
    return (r.resident_name ?? "").toLowerCase().includes(q) || r.referred_to.toLowerCase().includes(q);
  });

  const filteredDischarges = discharges.filter(d => {
    if (!searchDis.trim()) return true;
    const q = searchDis.toLowerCase();
    return (d.resident_name ?? "").toLowerCase().includes(q) || d.diagnosis.toLowerCase().includes(q);
  });

  const filteredGP = gpContacts.filter(g => {
    if (!searchGP.trim()) return true;
    const q = searchGP.toLowerCase();
    return g.practice_name.toLowerCase().includes(q) || g.gp_name.toLowerCase().includes(q);
  });

  const filteredHospital = hospitalContacts.filter(h => {
    if (!searchHosp.trim()) return true;
    const q = searchHosp.toLowerCase();
    return h.hospital_name.toLowerCase().includes(q) || h.department.toLowerCase().includes(q);
  });

  // ── Save handlers ─────────────────────────────────────────────────────────

  async function handleSaveReferral() {
    if (!refForm.resident || !refForm.referred_to || !refForm.reason || !refForm.referral_date) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        ...refForm,
        resident: Number(refForm.resident),
      };
      if (!refForm.appointment_date) delete body.appointment_date;
      const res = await fetch("/api/v1/gp/referrals/", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const n = await res.json();
        setReferrals(p => [n, ...p]);
        setShowNewReferral(false);
        setRefForm({ resident: "", referral_type: "gp", referred_to: "", reason: "", urgency: "routine", referral_date: new Date().toISOString().slice(0, 10), appointment_date: "" });
        toast("Referral created.", "success");
      } else { toast("Could not create referral.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
    finally { setSaving(false); }
  }

  async function handleSaveGPContact() {
    if (!gpForm.practice_name || !gpForm.gp_name) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/gp/gp-contacts/", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gpForm),
      });
      if (res.ok) {
        const n = await res.json();
        setGpContacts(p => [...p, n]);
        setShowNewGP(false);
        setGpForm({ practice_name: "", gp_name: "", phone: "", fax: "", email: "", address: "" });
        toast("GP contact added.", "success");
      } else { toast("Could not add GP contact.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
    finally { setSaving(false); }
  }

  async function handleSaveHospitalContact() {
    if (!hospForm.hospital_name) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/gp/hospital-contacts/", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hospForm),
      });
      if (res.ok) {
        const n = await res.json();
        setHospitalContacts(p => [...p, n]);
        setShowNewHospital(false);
        setHospForm({ hospital_name: "", department: "", phone: "", address: "", notes: "" });
        toast("Hospital contact added.", "success");
      } else { toast("Could not add hospital contact.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
    finally { setSaving(false); }
  }

  // ─────────────────────────────────────────────────────────────────────────

  const TABS: { key: Tab; label: string }[] = [
    { key: "referrals",         label: "Referrals" },
    { key: "discharge",         label: "Discharge Summaries" },
    { key: "gp_contacts",       label: "GP Contacts" },
    { key: "hospital_contacts", label: "Hospital Contacts" },
  ];

  return (
    <div className="space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.2)" }}>
            <Stethoscope size={16} style={{ color: "var(--c-green)" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">GP &amp; Hospital Integration</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Referrals, discharge summaries and contacts</p>
          </div>
        </div>
        {tab === "referrals" && (
          <button onClick={() => setShowNewReferral(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white"
            style={{ background: "#0d9488" }}>
            <Plus size={14} /> New Referral
          </button>
        )}
        {tab === "gp_contacts" && (
          <button onClick={() => setShowNewGP(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white"
            style={{ background: "#0d9488" }}>
            <Plus size={14} /> Add GP
          </button>
        )}
        {tab === "hospital_contacts" && (
          <button onClick={() => setShowNewHospital(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white"
            style={{ background: "#0d9488" }}>
            <Plus size={14} /> Add Hospital
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Referrals",      value: totalReferrals,   color: "var(--c-teal)" },
          { label: "Pending Referrals",    value: pendingReferrals, color: "var(--c-amber)" },
          { label: "Discharge Summaries",  value: totalDischarges,  color: "var(--c-teal2)" },
          { label: "Action Required",      value: actionRequired,   color: "var(--c-red)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4 text-center"
            style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-hover)" }}>
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-hover)" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
            style={{
              background: tab === t.key ? "rgba(13, 148, 136,0.2)" : "transparent",
              color: tab === t.key ? "var(--c-teal)" : "var(--text-muted)",
              border: tab === t.key ? "1px solid rgba(13, 148, 136,0.3)" : "1px solid transparent",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Referrals Tab ── */}
      {tab === "referrals" && (
        <div className="space-y-3">
          {/* filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input type="text" placeholder="Search resident or referred to…" value={searchRef} onChange={e => setSearchRef(e.target.value)}
                className="w-full text-sm pl-9 pr-4 py-2 rounded-xl outline-none"
                style={{ background: "var(--input-bg)", border: "1px solid var(--bg-card-hover)", color: "var(--text-secondary)" }} />
            </div>
            {[
              { value: filterRefStatus, set: setFilterRefStatus, opts: [["","All Status"],["pending","Pending"],["sent","Sent"],["acknowledged","Acknowledged"],["appointment_booked","Appt Booked"],["completed","Completed"],["rejected","Rejected"]] },
              { value: filterRefUrgency, set: setFilterRefUrgency, opts: [["","All Urgency"],["routine","Routine"],["urgent","Urgent"],["emergency","Emergency"]] },
            ].map((f, i) => (
              <div key={i} className="relative">
                <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(var(--fg-rgb),0.25)" }} />
                <select value={f.value} onChange={e => f.set(e.target.value)}
                  className="text-sm pl-8 pr-8 py-2 rounded-xl outline-none appearance-none"
                  style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.08)", color: "rgba(var(--fg-rgb),0.6)" }}>
                  {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(var(--fg-rgb),0.3)" }} />
              </div>
            ))}
          </div>

          {loadingReferrals ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div>
          ) : filteredReferrals.length === 0 ? (
            <EmptyState icon={Stethoscope} title="No referrals found" description="Create a new referral to get started." action={{ label: "New Referral", onClick: () => setShowNewReferral(true) }} />
          ) : (
            <div className="space-y-2">
              {filteredReferrals.map(ref => {
                const sc = REFERRAL_STATUS_CFG[ref.status] ?? REFERRAL_STATUS_CFG.pending;
                const uc = URGENCY_CFG[ref.urgency] ?? URGENCY_CFG.routine;
                return (
                  <div key={ref.id} className="rounded-2xl p-4"
                    style={{ background: "rgba(var(--fg-rgb),0.03)", border: "1px solid rgba(var(--fg-rgb),0.07)" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="text-sm font-semibold text-white">{ref.resident_name ?? `Resident #${ref.resident}`}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: uc.bg, color: uc.color }}>{uc.label}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(var(--fg-rgb),0.05)", color: "rgba(var(--fg-rgb),0.45)" }}>
                            {REFERRAL_TYPE_LABEL[ref.referral_type] ?? ref.referral_type}
                          </span>
                        </div>
                        <p className="text-sm font-medium mb-0.5" style={{ color: "rgba(var(--fg-rgb),0.75)" }}>
                          To: {ref.referred_to}
                        </p>
                        <p className="text-xs leading-relaxed" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>{ref.reason}</p>
                        {ref.outcome && (
                          <p className="text-xs mt-1.5 italic" style={{ color: "rgba(52,211,153,0.7)" }}>Outcome: {ref.outcome}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs" style={{ color: "rgba(var(--fg-rgb),0.4)" }}>
                          {new Date(ref.referral_date).toLocaleDateString("en-GB")}
                        </div>
                        {ref.appointment_date && (
                          <div className="text-xs mt-0.5" style={{ color: "var(--c-amber)" }}>
                            Appt: {new Date(ref.appointment_date).toLocaleDateString("en-GB")}
                          </div>
                        )}
                        {ref.referred_by_name && (
                          <div className="text-xs mt-1" style={{ color: "rgba(var(--fg-rgb),0.3)" }}>{ref.referred_by_name}</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Discharge Summaries Tab ── */}
      {tab === "discharge" && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input type="text" placeholder="Search resident or diagnosis…" value={searchDis} onChange={e => setSearchDis(e.target.value)}
                className="w-full text-sm pl-9 pr-4 py-2 rounded-xl outline-none"
                style={{ background: "var(--input-bg)", border: "1px solid var(--bg-card-hover)", color: "var(--text-secondary)" }} />
            </div>
            <div className="relative">
              <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(var(--fg-rgb),0.25)" }} />
              <select value={filterDisStatus} onChange={e => setFilterDisStatus(e.target.value)}
                className="text-sm pl-8 pr-8 py-2 rounded-xl outline-none appearance-none"
                style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.08)", color: "rgba(var(--fg-rgb),0.6)" }}>
                {[["","All Status"],["received","Received"],["reviewed","Reviewed"],["action_required","Action Required"],["completed","Completed"]].map(([v,l]) =>
                  <option key={v} value={v}>{l}</option>
                )}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(var(--fg-rgb),0.3)" }} />
            </div>
          </div>

          {loadingDischarges ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div>
          ) : filteredDischarges.length === 0 ? (
            <EmptyState icon={AlertCircle} title="No discharge summaries found" description="Discharge summaries will appear here when received." />
          ) : (
            <div className="space-y-2">
              {filteredDischarges.map(ds => {
                const sc = DISCHARGE_STATUS_CFG[ds.status] ?? DISCHARGE_STATUS_CFG.received;
                return (
                  <div key={ds.id} className="rounded-2xl p-4"
                    style={{ background: "rgba(var(--fg-rgb),0.03)", border: "1px solid rgba(var(--fg-rgb),0.07)" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="text-sm font-semibold text-white">{ds.resident_name ?? `Resident #${ds.resident}`}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                          {ds.hospital_name && (
                            <span className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(45, 212, 191,0.1)", color: "var(--c-teal2)" }}>
                              {ds.hospital_name}
                            </span>
                          )}
                        </div>
                        {ds.diagnosis && (
                          <p className="text-sm font-medium mb-0.5" style={{ color: "rgba(var(--fg-rgb),0.75)" }}>
                            {ds.diagnosis.length > 120 ? ds.diagnosis.slice(0, 120) + "…" : ds.diagnosis}
                          </p>
                        )}
                        {ds.follow_up_actions && (
                          <p className="text-xs mt-1" style={{ color: "rgba(251,191,36,0.8)" }}>
                            Follow-up: {ds.follow_up_actions.length > 100 ? ds.follow_up_actions.slice(0, 100) + "…" : ds.follow_up_actions}
                          </p>
                        )}
                        {ds.reviewed_by_name && (
                          <p className="text-xs mt-1" style={{ color: "rgba(var(--fg-rgb),0.3)" }}>Reviewed by {ds.reviewed_by_name}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0 text-xs" style={{ color: "rgba(var(--fg-rgb),0.4)" }}>
                        <div>Admitted: {new Date(ds.admission_date).toLocaleDateString("en-GB")}</div>
                        <div>Discharged: {new Date(ds.discharge_date).toLocaleDateString("en-GB")}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── GP Contacts Tab ── */}
      {tab === "gp_contacts" && (
        <div className="space-y-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input type="text" placeholder="Search practice or GP name…" value={searchGP} onChange={e => setSearchGP(e.target.value)}
              className="w-full text-sm pl-9 pr-4 py-2 rounded-xl outline-none"
              style={{ background: "var(--input-bg)", border: "1px solid var(--bg-card-hover)", color: "var(--text-secondary)" }} />
          </div>

          {loadingGP ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div>
          ) : filteredGP.length === 0 ? (
            <EmptyState icon={User} title="No GP contacts" description="Add GP practices and contacts for this care home." action={{ label: "Add GP", onClick: () => setShowNewGP(true) }} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredGP.map(gp => (
                <div key={gp.id} className="rounded-2xl p-4"
                  style={{ background: "rgba(var(--fg-rgb),0.03)", border: "1px solid rgba(var(--fg-rgb),0.07)" }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{gp.practice_name}</p>
                      <p className="text-xs" style={{ color: "var(--c-teal)" }}>{gp.gp_name}</p>
                    </div>
                    {!gp.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(107,114,128,0.15)", color: "#9ca3af" }}>Inactive</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {gp.phone && (
                      <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>
                        <Phone size={11} />{gp.phone}
                      </div>
                    )}
                    {gp.email && (
                      <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>
                        <Mail size={11} />{gp.email}
                      </div>
                    )}
                    {gp.address && (
                      <div className="flex items-start gap-2 text-xs" style={{ color: "rgba(var(--fg-rgb),0.4)" }}>
                        <MapPin size={11} className="mt-0.5 flex-shrink-0" />{gp.address}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Hospital Contacts Tab ── */}
      {tab === "hospital_contacts" && (
        <div className="space-y-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input type="text" placeholder="Search hospital or department…" value={searchHosp} onChange={e => setSearchHosp(e.target.value)}
              className="w-full text-sm pl-9 pr-4 py-2 rounded-xl outline-none"
              style={{ background: "var(--input-bg)", border: "1px solid var(--bg-card-hover)", color: "var(--text-secondary)" }} />
          </div>

          {loadingHospital ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div>
          ) : filteredHospital.length === 0 ? (
            <EmptyState icon={Building2} title="No hospital contacts" description="Add hospitals and departments for referrals and discharge coordination." action={{ label: "Add Hospital", onClick: () => setShowNewHospital(true) }} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredHospital.map(h => (
                <div key={h.id} className="rounded-2xl p-4"
                  style={{ background: "rgba(var(--fg-rgb),0.03)", border: "1px solid rgba(var(--fg-rgb),0.07)" }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{h.hospital_name}</p>
                      {h.department && <p className="text-xs" style={{ color: "var(--c-teal2)" }}>{h.department}</p>}
                    </div>
                    {!h.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(107,114,128,0.15)", color: "#9ca3af" }}>Inactive</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {h.phone && (
                      <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>
                        <Phone size={11} />{h.phone}
                      </div>
                    )}
                    {h.address && (
                      <div className="flex items-start gap-2 text-xs" style={{ color: "rgba(var(--fg-rgb),0.4)" }}>
                        <MapPin size={11} className="mt-0.5 flex-shrink-0" />{h.address}
                      </div>
                    )}
                    {h.notes && (
                      <p className="text-xs mt-1.5 italic" style={{ color: "rgba(var(--fg-rgb),0.35)" }}>{h.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── New Referral Modal ── */}
      {showNewReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            style={{ background: "var(--bg-elevated)", border: "1px solid rgba(13, 148, 136,0.25)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">New Referral</h3>
              <button onClick={() => setShowNewReferral(false)} style={{ color: "rgba(var(--fg-rgb),0.4)" }}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: "Resident *", el: <select value={refForm.resident} onChange={e => setRefForm(f => ({ ...f, resident: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}><option value="">Select resident…</option>{residents.map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}</select> },
                { label: "Referral Type", el: <select value={refForm.referral_type} onChange={e => setRefForm(f => ({ ...f, referral_type: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>{REFERRAL_TYPES.map(t => <option key={t} value={t}>{REFERRAL_TYPE_LABEL[t]}</option>)}</select> },
                { label: "Referred To *", el: <input value={refForm.referred_to} onChange={e => setRefForm(f => ({ ...f, referred_to: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="Dr Smith / City Hospital Cardiology…" /> },
                { label: "Urgency", el: <select value={refForm.urgency} onChange={e => setRefForm(f => ({ ...f, urgency: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}><option value="routine">Routine</option><option value="urgent">Urgent</option><option value="emergency">Emergency</option></select> },
                { label: "Referral Date *", el: <input type="date" value={refForm.referral_date} onChange={e => setRefForm(f => ({ ...f, referral_date: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} /> },
                { label: "Appointment Date (if known)", el: <input type="datetime-local" value={refForm.appointment_date} onChange={e => setRefForm(f => ({ ...f, appointment_date: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} /> },
                { label: "Reason *", el: <textarea rows={3} placeholder="Reason for referral…" value={refForm.reason} onChange={e => setRefForm(f => ({ ...f, reason: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={inputStyle} /> },
              ].map(({ label, el }) => (
                <div key={label}><label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>{label}</label>{el}</div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNewReferral(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
                style={{ background: "rgba(var(--fg-rgb),0.06)", color: "rgba(var(--fg-rgb),0.7)", border: "1px solid rgba(var(--fg-rgb),0.08)" }}>
                Cancel
              </button>
              <button onClick={handleSaveReferral} disabled={saving || !refForm.resident || !refForm.referred_to || !refForm.reason}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
                style={{ background: "#0d9488" }}>
                {saving ? "Saving…" : "Save Referral"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── New GP Contact Modal ── */}
      {showNewGP && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-lg"
            style={{ background: "var(--bg-elevated)", border: "1px solid rgba(13, 148, 136,0.25)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Add GP Contact</h3>
              <button onClick={() => setShowNewGP(false)} style={{ color: "rgba(var(--fg-rgb),0.4)" }}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: "Practice Name *", key: "practice_name", placeholder: "Riverside Medical Centre" },
                { label: "GP Name *",       key: "gp_name",       placeholder: "Dr Jane Smith" },
                { label: "Phone",           key: "phone",         placeholder: "01234 567890" },
                { label: "Fax",             key: "fax",           placeholder: "01234 567891" },
                { label: "Email",           key: "email",         placeholder: "admin@practise.nhs.uk" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}><label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>{label}</label>
                  <input value={gpForm[key as keyof typeof gpForm]} onChange={e => setGpForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder={placeholder} />
                </div>
              ))}
              <div><label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>Address</label>
                <textarea rows={2} value={gpForm.address} onChange={e => setGpForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={inputStyle} placeholder="123 High Street, London…" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNewGP(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
                style={{ background: "rgba(var(--fg-rgb),0.06)", color: "rgba(var(--fg-rgb),0.7)", border: "1px solid rgba(var(--fg-rgb),0.08)" }}>
                Cancel
              </button>
              <button onClick={handleSaveGPContact} disabled={saving || !gpForm.practice_name || !gpForm.gp_name}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
                style={{ background: "#0d9488" }}>
                {saving ? "Saving…" : "Save Contact"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── New Hospital Contact Modal ── */}
      {showNewHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-lg"
            style={{ background: "var(--bg-elevated)", border: "1px solid rgba(13, 148, 136,0.25)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Add Hospital Contact</h3>
              <button onClick={() => setShowNewHospital(false)} style={{ color: "rgba(var(--fg-rgb),0.4)" }}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: "Hospital Name *", key: "hospital_name", placeholder: "City General Hospital" },
                { label: "Department",      key: "department",    placeholder: "Cardiology, A&E, Orthopaedics…" },
                { label: "Phone",           key: "phone",         placeholder: "01234 567890" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}><label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>{label}</label>
                  <input value={hospForm[key as keyof typeof hospForm]} onChange={e => setHospForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder={placeholder} />
                </div>
              ))}
              <div><label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>Address</label>
                <textarea rows={2} value={hospForm.address} onChange={e => setHospForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={inputStyle} placeholder="Hospital Road, London…" />
              </div>
              <div><label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>Notes</label>
                <textarea rows={2} value={hospForm.notes} onChange={e => setHospForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={inputStyle} placeholder="Any additional notes…" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNewHospital(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
                style={{ background: "rgba(var(--fg-rgb),0.06)", color: "rgba(var(--fg-rgb),0.7)", border: "1px solid rgba(var(--fg-rgb),0.08)" }}>
                Cancel
              </button>
              <button onClick={handleSaveHospitalContact} disabled={saving || !hospForm.hospital_name}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
                style={{ background: "#0d9488" }}>
                {saving ? "Saving…" : "Save Contact"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
