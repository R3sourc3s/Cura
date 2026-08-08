"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Briefcase, Plus, X, Search, Filter, ChevronDown,
  Users, CheckCircle, UserCheck, Building2,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

// ─── Types ────────────────────────────────────────────────────────────────────

interface JobPosting {
  id: number;
  care_home: number;
  title: string;
  department: string;
  contract_type: "full_time" | "part_time" | "bank" | "agency";
  description: string;
  salary_range: string;
  status: "draft" | "open" | "closed" | "filled";
  posted_date: string | null;
  closing_date: string | null;
  created_by: number | null;
  created_by_name: string | null;
  created_at: string;
  applicant_count: number;
}

interface Applicant {
  id: number;
  job_posting: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: "applied" | "shortlisted" | "interviewed" | "offered" | "hired" | "rejected" | "withdrawn";
  applied_at: string;
  interview_date: string | null;
  notes: string;
  right_to_work_verified: boolean;
  dbs_check_requested: boolean;
  updated_by: number | null;
  updated_at: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const JOB_STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  open:   { label: "Open",   color: "var(--c-green)", bg: "rgba(52,211,153,0.12)" },
  draft:  { label: "Draft",  color: "var(--c-amber)", bg: "rgba(251,191,36,0.12)" },
  closed: { label: "Closed", color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  filled: { label: "Filled", color: "#c084fc", bg: "rgba(192,132,252,0.12)" },
};

const APP_STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  applied:     { label: "Applied",     color: "var(--c-teal2)", bg: "rgba(45, 212, 191,0.12)" },
  shortlisted: { label: "Shortlisted", color: "var(--c-amber)", bg: "rgba(251,191,36,0.12)" },
  interviewed: { label: "Interviewed", color: "var(--c-orange)", bg: "rgba(251,146,60,0.12)" },
  offered:     { label: "Offered",     color: "#c084fc", bg: "rgba(192,132,252,0.12)" },
  hired:       { label: "Hired",       color: "var(--c-green)", bg: "rgba(52,211,153,0.12)" },
  rejected:    { label: "Rejected",    color: "var(--c-red)", bg: "rgba(248,113,113,0.12)" },
  withdrawn:   { label: "Withdrawn",   color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
};

const CONTRACT_LABELS: Record<string, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  bank:      "Bank",
  agency:    "Agency",
};

const FIELD_STYLE = {
  background: "rgba(var(--fg-rgb),0.05)",
  border: "1px solid rgba(var(--fg-rgb),0.1)",
  color: "rgba(var(--fg-rgb),0.8)",
} as const;

const LABEL_STYLE = { color: "rgba(var(--fg-rgb),0.5)" } as const;

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RecruitmentPage() {
  const [tab, setTab] = useState<"jobs" | "applicants">("jobs");
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [appLoading, setAppLoading] = useState(true);

  // Filters – jobs
  const [jobSearch, setJobSearch] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("");
  const [jobContractFilter, setJobContractFilter] = useState("");

  // Filters – applicants
  const [appSearch, setAppSearch] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState("");
  const [selectedJob, setSelectedJob] = useState<number | "">("");

  // Modals
  const [showJobModal, setShowJobModal] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
  const [editingApp, setEditingApp] = useState<Applicant | null>(null);
  const [saving, setSaving] = useState(false);

  // Job form
  const [jobForm, setJobForm] = useState({
    title: "", department: "", contract_type: "full_time",
    description: "", salary_range: "", status: "draft",
    posted_date: "", closing_date: "",
  });

  // Applicant form
  const [appForm, setAppForm] = useState({
    job_posting: "", first_name: "", last_name: "",
    email: "", phone: "", status: "applied",
    interview_date: "", notes: "",
    right_to_work_verified: false, dbs_check_requested: false,
  });

  // ── Loaders ──────────────────────────────────────────────────────────────

  const loadJobs = useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams({ ordering: "-created_at", page_size: "100" });
    if (jobStatusFilter) qs.set("status", jobStatusFilter);
    if (jobContractFilter) qs.set("contract_type", jobContractFilter);
    fetch(`/api/v1/recruitment/jobs/?${qs}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setJobs(d.results ?? d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [jobStatusFilter, jobContractFilter]);

  const loadApplicants = useCallback(() => {
    setAppLoading(true);
    const qs = new URLSearchParams({ ordering: "-applied_at", page_size: "200" });
    if (appStatusFilter) qs.set("status", appStatusFilter);
    if (selectedJob !== "") qs.set("job_posting", String(selectedJob));
    fetch(`/api/v1/recruitment/applicants/?${qs}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setApplicants(d.results ?? d))
      .catch(console.error)
      .finally(() => setAppLoading(false));
  }, [appStatusFilter, selectedJob]);

  useEffect(() => { loadJobs(); }, [loadJobs]);
  useEffect(() => { loadApplicants(); }, [loadApplicants]);

  // ── Stats ────────────────────────────────────────────────────────────────

  const openCount = jobs.filter(j => j.status === "open").length;
  const totalApplicants = applicants.length;
  const shortlistedCount = applicants.filter(a => a.status === "shortlisted").length;
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const hiredThisMonth = applicants.filter(
    a => a.status === "hired" && new Date(a.applied_at) >= thisMonth
  ).length;

  // ── Filtered lists ───────────────────────────────────────────────────────

  const filteredJobs = jobs.filter(j => {
    if (!jobSearch.trim()) return true;
    const q = jobSearch.toLowerCase();
    return j.title.toLowerCase().includes(q) || j.department.toLowerCase().includes(q);
  });

  const filteredApplicants = applicants.filter(a => {
    if (!appSearch.trim()) return true;
    const q = appSearch.toLowerCase();
    const name = `${a.first_name} ${a.last_name}`.toLowerCase();
    return name.includes(q) || a.email.toLowerCase().includes(q);
  });

  // ── Save handlers ────────────────────────────────────────────────────────

  async function handleSaveJob() {
    if (!jobForm.title) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = { ...jobForm };
      if (!body.posted_date) delete body.posted_date;
      if (!body.closing_date) delete body.closing_date;
      const res = await fetch("/api/v1/recruitment/jobs/", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const j = await res.json();
        setJobs(p => [j, ...p]);
        setShowJobModal(false);
        setJobForm({ title: "", department: "", contract_type: "full_time", description: "", salary_range: "", status: "draft", posted_date: "", closing_date: "" });
      }
    } finally { setSaving(false); }
  }

  async function handleSaveApplicant() {
    if (!appForm.job_posting || !appForm.first_name || !appForm.last_name || !appForm.email) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        ...appForm,
        job_posting: Number(appForm.job_posting),
      };
      if (!body.interview_date) delete body.interview_date;

      if (editingApp) {
        const res = await fetch(`/api/v1/recruitment/applicants/${editingApp.id}/`, {
          method: "PATCH", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const updated = await res.json();
          setApplicants(p => p.map(a => a.id === updated.id ? updated : a));
          closeAppModal();
        }
      } else {
        const res = await fetch("/api/v1/recruitment/applicants/", {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const a = await res.json();
          setApplicants(p => [a, ...p]);
          closeAppModal();
        }
      }
    } finally { setSaving(false); }
  }

  function openEditApp(a: Applicant) {
    setEditingApp(a);
    setAppForm({
      job_posting: String(a.job_posting),
      first_name: a.first_name,
      last_name: a.last_name,
      email: a.email,
      phone: a.phone,
      status: a.status,
      interview_date: a.interview_date ? a.interview_date.slice(0, 16) : "",
      notes: a.notes,
      right_to_work_verified: a.right_to_work_verified,
      dbs_check_requested: a.dbs_check_requested,
    });
    setShowAppModal(true);
  }

  function closeAppModal() {
    setShowAppModal(false);
    setEditingApp(null);
    setAppForm({ job_posting: "", first_name: "", last_name: "", email: "", phone: "", status: "applied", interview_date: "", notes: "", right_to_work_verified: false, dbs_check_requested: false });
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(13, 148, 136,0.12)", border: "1px solid rgba(13, 148, 136,0.2)" }}>
            <Briefcase size={16} style={{ color: "var(--c-teal)" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Recruitment</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Job postings and applicant pipeline</p>
          </div>
        </div>
        <button
          onClick={() => tab === "jobs" ? setShowJobModal(true) : setShowAppModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white"
          style={{ background: "#0d9488" }}>
          <Plus size={14} />
          {tab === "jobs" ? "Add Job" : "Add Applicant"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Open Positions",  value: openCount,       color: "var(--c-green)", icon: <Building2 size={14} /> },
          { label: "Total Applicants", value: totalApplicants, color: "var(--c-teal2)", icon: <Users size={14} /> },
          { label: "Shortlisted",     value: shortlistedCount, color: "var(--c-amber)", icon: <Filter size={14} /> },
          { label: "Hired This Month", value: hiredThisMonth,  color: "#c084fc", icon: <UserCheck size={14} /> },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="rounded-2xl p-4 text-center"
            style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-hover)" }}>
            <div className="flex justify-center mb-1" style={{ color }}>{icon}</div>
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: "rgba(var(--fg-rgb),0.04)", border: "1px solid rgba(var(--fg-rgb),0.07)" }}>
        {(["jobs", "applicants"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-5 py-2 text-sm font-semibold rounded-lg transition-all"
            style={tab === t
              ? { background: "#0d9488", color: "#fff" }
              : { color: "rgba(var(--fg-rgb),0.45)" }}>
            {t === "jobs" ? "Job Postings" : "Applicants"}
          </button>
        ))}
      </div>

      {/* ── JOB POSTINGS TAB ── */}
      {tab === "jobs" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input type="text" placeholder="Search title or department…" value={jobSearch}
                onChange={e => setJobSearch(e.target.value)}
                className="w-full text-sm pl-9 pr-4 py-2 rounded-xl outline-none"
                style={{ background: "var(--input-bg)", border: "1px solid var(--bg-card-hover)", color: "var(--text-secondary)" }} />
            </div>
            {[
              { value: jobStatusFilter, set: setJobStatusFilter, opts: [["", "All Statuses"], ["open", "Open"], ["draft", "Draft"], ["closed", "Closed"], ["filled", "Filled"]] },
              { value: jobContractFilter, set: setJobContractFilter, opts: [["", "All Contracts"], ["full_time", "Full Time"], ["part_time", "Part Time"], ["bank", "Bank"], ["agency", "Agency"]] },
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

          {/* Job list */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
          ) : filteredJobs.length === 0 ? (
            <EmptyState icon={Briefcase} title="No job postings found"
              description="Create your first job posting to start recruiting."
              action={{ label: "Add Job", onClick: () => setShowJobModal(true) }} />
          ) : (
            <div className="space-y-3">
              {filteredJobs.map(job => {
                const sc = JOB_STATUS_CFG[job.status] ?? JOB_STATUS_CFG.draft;
                return (
                  <div key={job.id} className="rounded-2xl p-4 cursor-pointer transition-colors"
                    style={{ background: "rgba(var(--fg-rgb),0.03)", border: "1px solid rgba(var(--fg-rgb),0.07)" }}
                    onClick={() => { setSelectedJob(job.id); setTab("applicants"); }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-semibold text-white">{job.title}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(var(--fg-rgb),0.05)", color: "rgba(var(--fg-rgb),0.45)" }}>
                            {CONTRACT_LABELS[job.contract_type] ?? job.contract_type}
                          </span>
                          {job.department && (
                            <span className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(var(--fg-rgb),0.05)", color: "rgba(var(--fg-rgb),0.4)" }}>
                              {job.department}
                            </span>
                          )}
                        </div>
                        {job.description && (
                          <p className="text-sm leading-relaxed line-clamp-2 mt-1"
                            style={{ color: "rgba(var(--fg-rgb),0.55)" }}>{job.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-2">
                          {job.salary_range && (
                            <span className="text-xs" style={{ color: "rgba(var(--fg-rgb),0.4)" }}>
                              Salary: {job.salary_range}
                            </span>
                          )}
                          {job.closing_date && (
                            <span className="text-xs" style={{ color: "rgba(var(--fg-rgb),0.4)" }}>
                              Closes: {new Date(job.closing_date).toLocaleDateString("en-GB")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 justify-end"
                          style={{ color: "var(--c-teal2)" }}>
                          <Users size={13} />
                          <span className="text-sm font-bold">{job.applicant_count}</span>
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: "rgba(var(--fg-rgb),0.3)" }}>applicants</div>
                        <div className="text-xs mt-2" style={{ color: "rgba(var(--fg-rgb),0.25)" }}>
                          {new Date(job.created_at).toLocaleDateString("en-GB")}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── APPLICANTS TAB ── */}
      {tab === "applicants" && (
        <>
          {/* Pipeline summary */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(APP_STATUS_CFG).map(([key, cfg]) => {
              const count = applicants.filter(a => a.status === key).length;
              return (
                <button key={key}
                  onClick={() => setAppStatusFilter(appStatusFilter === key ? "" : key)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: appStatusFilter === key ? cfg.bg : "rgba(var(--fg-rgb),0.04)",
                    border: `1px solid ${appStatusFilter === key ? cfg.color + "40" : "rgba(var(--fg-rgb),0.07)"}`,
                    color: appStatusFilter === key ? cfg.color : "rgba(var(--fg-rgb),0.45)",
                  }}>
                  {cfg.label}
                  <span className="font-bold">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input type="text" placeholder="Search name or email…" value={appSearch}
                onChange={e => setAppSearch(e.target.value)}
                className="w-full text-sm pl-9 pr-4 py-2 rounded-xl outline-none"
                style={{ background: "var(--input-bg)", border: "1px solid var(--bg-card-hover)", color: "var(--text-secondary)" }} />
            </div>
            <div className="relative">
              <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(var(--fg-rgb),0.25)" }} />
              <select value={selectedJob} onChange={e => setSelectedJob(e.target.value === "" ? "" : Number(e.target.value))}
                className="text-sm pl-8 pr-8 py-2 rounded-xl outline-none appearance-none"
                style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.08)", color: "rgba(var(--fg-rgb),0.6)" }}>
                <option value="">All Jobs</option>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(var(--fg-rgb),0.3)" }} />
            </div>
          </div>

          {/* Applicant list */}
          {appLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
          ) : filteredApplicants.length === 0 ? (
            <EmptyState icon={Users} title="No applicants found"
              description="Add applicants to your job postings to track the recruitment pipeline."
              action={{ label: "Add Applicant", onClick: () => setShowAppModal(true) }} />
          ) : (
            <div className="space-y-3">
              {filteredApplicants.map(app => {
                const sc = APP_STATUS_CFG[app.status] ?? APP_STATUS_CFG.applied;
                const job = jobs.find(j => j.id === app.job_posting);
                return (
                  <div key={app.id}
                    className="rounded-2xl p-4 cursor-pointer transition-colors"
                    style={{ background: "rgba(var(--fg-rgb),0.03)", border: "1px solid rgba(var(--fg-rgb),0.07)" }}
                    onClick={() => openEditApp(app)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-semibold text-white">
                            {app.first_name} {app.last_name}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                          {app.right_to_work_verified && (
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(52,211,153,0.1)", color: "var(--c-green)" }}>
                              <CheckCircle size={10} /> RTW
                            </span>
                          )}
                          {app.dbs_check_requested && (
                            <span className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(251,191,36,0.1)", color: "var(--c-amber)" }}>
                              DBS
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-0.5">
                          <span className="text-xs" style={{ color: "rgba(var(--fg-rgb),0.4)" }}>{app.email}</span>
                          {app.phone && <span className="text-xs" style={{ color: "rgba(var(--fg-rgb),0.4)" }}>{app.phone}</span>}
                        </div>
                        {job && (
                          <div className="mt-1 text-xs" style={{ color: "rgba(var(--fg-rgb),0.3)" }}>
                            {job.title}
                          </div>
                        )}
                        {app.interview_date && (
                          <div className="mt-1 text-xs" style={{ color: "var(--c-orange)" }}>
                            Interview: {new Date(app.interview_date).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs" style={{ color: "rgba(var(--fg-rgb),0.3)" }}>
                          {new Date(app.applied_at).toLocaleDateString("en-GB")}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── ADD JOB MODAL ── */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            style={{ background: "var(--bg-elevated)", border: "1px solid rgba(13, 148, 136,0.25)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Add Job Posting</h3>
              <button onClick={() => setShowJobModal(false)} style={{ color: "rgba(var(--fg-rgb),0.4)" }}>
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                {
                  label: "Job Title *",
                  el: <input type="text" placeholder="e.g. Senior Care Assistant" value={jobForm.title}
                    onChange={e => setJobForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={FIELD_STYLE} />,
                },
                {
                  label: "Department",
                  el: <input type="text" placeholder="e.g. Dementia Care" value={jobForm.department}
                    onChange={e => setJobForm(f => ({ ...f, department: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={FIELD_STYLE} />,
                },
                {
                  label: "Contract Type",
                  el: (
                    <select value={jobForm.contract_type}
                      onChange={e => setJobForm(f => ({ ...f, contract_type: e.target.value }))}
                      className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={FIELD_STYLE}>
                      {Object.entries(CONTRACT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  ),
                },
                {
                  label: "Status",
                  el: (
                    <select value={jobForm.status}
                      onChange={e => setJobForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={FIELD_STYLE}>
                      {Object.entries(JOB_STATUS_CFG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                    </select>
                  ),
                },
                {
                  label: "Salary Range",
                  el: <input type="text" placeholder="e.g. £25,000–£28,000 pa" value={jobForm.salary_range}
                    onChange={e => setJobForm(f => ({ ...f, salary_range: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={FIELD_STYLE} />,
                },
                {
                  label: "Posted Date",
                  el: <input type="date" value={jobForm.posted_date}
                    onChange={e => setJobForm(f => ({ ...f, posted_date: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={FIELD_STYLE} />,
                },
                {
                  label: "Closing Date",
                  el: <input type="date" value={jobForm.closing_date}
                    onChange={e => setJobForm(f => ({ ...f, closing_date: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={FIELD_STYLE} />,
                },
                {
                  label: "Description",
                  el: <textarea rows={4} placeholder="Describe the role and requirements…" value={jobForm.description}
                    onChange={e => setJobForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={FIELD_STYLE} />,
                },
              ].map(({ label, el }) => (
                <div key={label}>
                  <label className="block text-xs mb-1" style={LABEL_STYLE}>{label}</label>
                  {el}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowJobModal(false)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
                style={{ background: "rgba(var(--fg-rgb),0.06)", color: "rgba(var(--fg-rgb),0.7)", border: "1px solid rgba(var(--fg-rgb),0.08)" }}>
                Cancel
              </button>
              <button onClick={handleSaveJob} disabled={saving || !jobForm.title}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
                style={{ background: "#0d9488" }}>
                {saving ? "Saving…" : "Create Posting"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT APPLICANT MODAL ── */}
      {showAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            style={{ background: "var(--bg-elevated)", border: "1px solid rgba(13, 148, 136,0.25)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">
                {editingApp ? "Edit Applicant" : "Add Applicant"}
              </h3>
              <button onClick={closeAppModal} style={{ color: "rgba(var(--fg-rgb),0.4)" }}>
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                {
                  label: "Job Posting *",
                  el: (
                    <select value={appForm.job_posting}
                      onChange={e => setAppForm(f => ({ ...f, job_posting: e.target.value }))}
                      className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={FIELD_STYLE}>
                      <option value="">Select job posting…</option>
                      {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                    </select>
                  ),
                },
                {
                  label: "First Name *",
                  el: <input type="text" placeholder="First name" value={appForm.first_name}
                    onChange={e => setAppForm(f => ({ ...f, first_name: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={FIELD_STYLE} />,
                },
                {
                  label: "Last Name *",
                  el: <input type="text" placeholder="Last name" value={appForm.last_name}
                    onChange={e => setAppForm(f => ({ ...f, last_name: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={FIELD_STYLE} />,
                },
                {
                  label: "Email *",
                  el: <input type="email" placeholder="email@example.com" value={appForm.email}
                    onChange={e => setAppForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={FIELD_STYLE} />,
                },
                {
                  label: "Phone",
                  el: <input type="tel" placeholder="+44 7700 000000" value={appForm.phone}
                    onChange={e => setAppForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={FIELD_STYLE} />,
                },
                {
                  label: "Status",
                  el: (
                    <select value={appForm.status}
                      onChange={e => setAppForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={FIELD_STYLE}>
                      {Object.entries(APP_STATUS_CFG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                    </select>
                  ),
                },
                {
                  label: "Interview Date",
                  el: <input type="datetime-local" value={appForm.interview_date}
                    onChange={e => setAppForm(f => ({ ...f, interview_date: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={FIELD_STYLE} />,
                },
                {
                  label: "Notes",
                  el: <textarea rows={3} placeholder="Interview notes, feedback…" value={appForm.notes}
                    onChange={e => setAppForm(f => ({ ...f, notes: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={FIELD_STYLE} />,
                },
              ].map(({ label, el }) => (
                <div key={label}>
                  <label className="block text-xs mb-1" style={LABEL_STYLE}>{label}</label>
                  {el}
                </div>
              ))}

              {/* Checkboxes */}
              <div className="flex gap-4 pt-1">
                {[
                  { key: "right_to_work_verified" as const, label: "Right to Work Verified" },
                  { key: "dbs_check_requested" as const, label: "DBS Check Requested" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={appForm[key]}
                      onChange={e => setAppForm(f => ({ ...f, [key]: e.target.checked }))}
                      className="rounded" />
                    <span className="text-xs" style={{ color: "rgba(var(--fg-rgb),0.6)" }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={closeAppModal}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
                style={{ background: "rgba(var(--fg-rgb),0.06)", color: "rgba(var(--fg-rgb),0.7)", border: "1px solid rgba(var(--fg-rgb),0.08)" }}>
                Cancel
              </button>
              <button
                onClick={handleSaveApplicant}
                disabled={saving || !appForm.job_posting || !appForm.first_name || !appForm.last_name || !appForm.email}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
                style={{ background: "#0d9488" }}>
                {saving ? "Saving…" : editingApp ? "Save Changes" : "Add Applicant"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
