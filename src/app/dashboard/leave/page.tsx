"use client";

import { useEffect, useState, useCallback } from "react";
import { CalendarOff, Plus, X, Filter, ChevronDown, Check, Ban } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

interface LeaveType {
  id: number;
  care_home: number;
  name: string;
  days_entitlement: number;
  color: string;
}

interface LeaveRequest {
  id: number;
  staff_member: number;
  staff_name?: string;
  leave_type: number;
  leave_type_name?: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason: string;
  status: "pending" | "approved" | "declined" | "cancelled";
  reviewed_by: number | null;
  reviewed_by_name?: string;
  reviewed_at: string | null;
  review_notes: string;
  created_at: string;
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pending",   color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  approved:  { label: "Approved",  color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  declined:  { label: "Declined",  color: "#f87171", bg: "rgba(239,68,68,0.12)" },
  cancelled: { label: "Cancelled", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
};

const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "rgba(255,255,255,0.8)",
} as const;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"requests" | "types">("requests");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");

  // Request modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [requestForm, setRequestForm] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    days_requested: "",
    reason: "",
  });

  // Leave type modal
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [savingType, setSavingType] = useState(false);
  const [typeForm, setTypeForm] = useState({
    name: "",
    days_entitlement: "28",
    color: "#7c3aed",
  });

  // Review notes modal
  const [reviewTarget, setReviewTarget] = useState<{ id: number; action: "approved" | "declined" } | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  const loadRequests = useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams({ page_size: "100", ordering: "-created_at" });
    if (filterStatus) qs.set("status", filterStatus);
    if (filterType) qs.set("leave_type", filterType);
    fetch(`/api/v1/leave/requests/?${qs}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setRequests(d.results ?? d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterStatus, filterType]);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  useEffect(() => {
    fetch("/api/v1/leave/types/?page_size=100", { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setLeaveTypes(d.results ?? d))
      .catch(console.error);
  }, []);

  async function handleSubmitRequest() {
    if (!requestForm.leave_type || !requestForm.start_date || !requestForm.end_date || !requestForm.days_requested) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/leave/requests/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leave_type: Number(requestForm.leave_type),
          start_date: requestForm.start_date,
          end_date: requestForm.end_date,
          days_requested: Number(requestForm.days_requested),
          reason: requestForm.reason,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setRequests(p => [created, ...p]);
        setShowRequestModal(false);
        setRequestForm({ leave_type: "", start_date: "", end_date: "", days_requested: "", reason: "" });
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitType() {
    if (!typeForm.name) return;
    setSavingType(true);
    try {
      const res = await fetch("/api/v1/leave/types/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: typeForm.name,
          days_entitlement: Number(typeForm.days_entitlement),
          color: typeForm.color,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setLeaveTypes(p => [...p, created]);
        setShowTypeModal(false);
        setTypeForm({ name: "", days_entitlement: "28", color: "#7c3aed" });
      }
    } finally {
      setSavingType(false);
    }
  }

  async function handleReview() {
    if (!reviewTarget) return;
    setSavingReview(true);
    try {
      const res = await fetch(`/api/v1/leave/requests/${reviewTarget.id}/`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: reviewTarget.action, review_notes: reviewNotes }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRequests(p => p.map(r => r.id === updated.id ? updated : r));
        setReviewTarget(null);
        setReviewNotes("");
      }
    } finally {
      setSavingReview(false);
    }
  }

  const total = requests.length;
  const pendingCount = requests.filter(r => r.status === "pending").length;
  const approvedCount = requests.filter(r => r.status === "approved").length;
  const declinedCount = requests.filter(r => r.status === "declined").length;

  const tabs = [
    { key: "requests" as const, label: "Leave Requests" },
    { key: "types" as const, label: "Leave Types" },
  ];

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}
          >
            <CalendarOff size={16} style={{ color: "#a78bfa" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Leave Management</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Manage staff leave requests and entitlements</p>
          </div>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
        >
          <Plus size={14} /> Request Leave
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Requests", value: total,         color: "#a78bfa" },
          { label: "Pending Approval", value: pendingCount,  color: "#fbbf24" },
          { label: "Approved",        value: approvedCount, color: "#34d399" },
          { label: "Declined",        value: declinedCount, color: "#f87171" },
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

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-hover)" }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
            style={
              activeTab === t.key
                ? { background: "linear-gradient(135deg, #7c3aed, #3b82f6)", color: "#fff" }
                : { color: "var(--text-muted)" }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Leave Requests Tab */}
      {activeTab === "requests" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.25)" }} />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="text-sm pl-8 pr-8 py-2 rounded-xl outline-none appearance-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.3)" }} />
            </div>
            <div className="relative">
              <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.25)" }} />
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="text-sm pl-8 pr-8 py-2 rounded-xl outline-none appearance-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
              >
                <option value="">All Types</option>
                {leaveTypes.map(lt => (
                  <option key={lt.id} value={lt.id}>{lt.name}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.3)" }} />
            </div>
          </div>

          {/* Requests List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <EmptyState
              icon={CalendarOff}
              title="No leave requests found"
              description="Submit a leave request to get started."
              action={{ label: "Request Leave", onClick: () => setShowRequestModal(true) }}
            />
          ) : (
            <div className="space-y-3">
              {requests.map(req => {
                const statusCfg = STATUS_CFG[req.status] ?? STATUS_CFG.pending;
                return (
                  <div
                    key={req.id}
                    className="rounded-2xl p-4"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="text-sm font-semibold text-white">
                            {req.staff_name ?? `Staff #${req.staff_member}`}
                          </span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: statusCfg.bg, color: statusCfg.color }}
                          >
                            {statusCfg.label}
                          </span>
                          {req.leave_type_name && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(124,58,237,0.12)", color: "#a78bfa" }}
                            >
                              {req.leave_type_name}
                            </span>
                          )}
                        </div>
                        <div className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                          {formatDate(req.start_date)} — {formatDate(req.end_date)}
                          <span className="ml-2 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                            ({req.days_requested} {req.days_requested === 1 ? "day" : "days"})
                          </span>
                        </div>
                        {req.reason && (
                          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{req.reason}</p>
                        )}
                        {req.reviewed_by_name && req.reviewed_at && (
                          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                            Reviewed by {req.reviewed_by_name} on {formatDate(req.reviewed_at)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                          {formatDate(req.created_at)}
                        </div>
                        {req.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setReviewTarget({ id: req.id, action: "approved" }); setReviewNotes(""); }}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg"
                              style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}
                            >
                              <Check size={11} /> Approve
                            </button>
                            <button
                              onClick={() => { setReviewTarget({ id: req.id, action: "declined" }); setReviewNotes(""); }}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg"
                              style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
                            >
                              <Ban size={11} /> Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Leave Types Tab */}
      {activeTab === "types" && (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => setShowTypeModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
            >
              <Plus size={14} /> Add Leave Type
            </button>
          </div>

          {leaveTypes.length === 0 ? (
            <EmptyState
              icon={CalendarOff}
              title="No leave types configured"
              description="Add a leave type to start managing leave entitlements."
              action={{ label: "Add Leave Type", onClick: () => setShowTypeModal(true) }}
            />
          ) : (
            <div className="space-y-3">
              {leaveTypes.map(lt => (
                <div
                  key={lt.id}
                  className="rounded-2xl p-4 flex items-center justify-between"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: lt.color }}
                    />
                    <span className="text-sm font-semibold text-white">{lt.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs px-3 py-1 rounded-full font-medium"
                      style={{ background: "rgba(124,58,237,0.12)", color: "#a78bfa" }}
                    >
                      {lt.days_entitlement} days/year
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Request Leave Modal */}
      {showRequestModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-lg"
            style={{ background: "#0f1629", border: "1px solid rgba(124,58,237,0.25)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Request Leave</h3>
              <button onClick={() => setShowRequestModal(false)} style={{ color: "rgba(255,255,255,0.4)" }}>
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Leave Type *</label>
                <select
                  value={requestForm.leave_type}
                  onChange={e => setRequestForm(f => ({ ...f, leave_type: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none"
                  style={inputStyle}
                >
                  <option value="">Select type…</option>
                  {leaveTypes.map(lt => (
                    <option key={lt.id} value={lt.id}>{lt.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Start Date *</label>
                  <input
                    type="date"
                    value={requestForm.start_date}
                    onChange={e => setRequestForm(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>End Date *</label>
                  <input
                    type="date"
                    value={requestForm.end_date}
                    onChange={e => setRequestForm(f => ({ ...f, end_date: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Days Requested *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 5"
                  value={requestForm.days_requested}
                  onChange={e => setRequestForm(f => ({ ...f, days_requested: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Reason (optional)</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe the reason for your leave…"
                  value={requestForm.reason}
                  onChange={e => setRequestForm(f => ({ ...f, reason: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none"
                  style={inputStyle}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={saving || !requestForm.leave_type || !requestForm.start_date || !requestForm.end_date || !requestForm.days_requested}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
              >
                {saving ? "Submitting…" : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Leave Type Modal */}
      {showTypeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-md"
            style={{ background: "#0f1629", border: "1px solid rgba(124,58,237,0.25)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Add Leave Type</h3>
              <button onClick={() => setShowTypeModal(false)} style={{ color: "rgba(255,255,255,0.4)" }}>
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Annual Leave"
                  value={typeForm.name}
                  onChange={e => setTypeForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Days Entitlement per Year</label>
                <input
                  type="number"
                  min="1"
                  value={typeForm.days_entitlement}
                  onChange={e => setTypeForm(f => ({ ...f, days_entitlement: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Colour</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={typeForm.color}
                    onChange={e => setTypeForm(f => ({ ...f, color: e.target.value }))}
                    className="w-10 h-10 rounded-lg cursor-pointer"
                    style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", padding: "2px" }}
                  />
                  <span className="text-sm font-mono" style={{ color: "rgba(255,255,255,0.5)" }}>{typeForm.color}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowTypeModal(false)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitType}
                disabled={savingType || !typeForm.name}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
              >
                {savingType ? "Saving…" : "Add Type"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review (Approve / Decline) Modal */}
      {reviewTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-md"
            style={{ background: "#0f1629", border: "1px solid rgba(124,58,237,0.25)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white capitalize">
                {reviewTarget.action === "approved" ? "Approve" : "Decline"} Leave Request
              </h3>
              <button onClick={() => setReviewTarget(null)} style={{ color: "rgba(255,255,255,0.4)" }}>
                <X size={18} />
              </button>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Review Notes (optional)</label>
              <textarea
                rows={4}
                placeholder="Add any notes for the staff member…"
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none"
                style={inputStyle}
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setReviewTarget(null)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                disabled={savingReview}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
                style={
                  reviewTarget.action === "approved"
                    ? { background: "linear-gradient(135deg, #059669, #34d399)" }
                    : { background: "linear-gradient(135deg, #dc2626, #f87171)" }
                }
              >
                {savingReview
                  ? "Saving…"
                  : reviewTarget.action === "approved"
                  ? "Confirm Approval"
                  : "Confirm Decline"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
