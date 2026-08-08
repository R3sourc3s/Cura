"use client";

import { useEffect, useState, useCallback } from "react";
import { Receipt, Plus, X, Search, Filter, ChevronDown, CreditCard, Users } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

interface Invoice {
  id: number;
  resident: number;
  resident_name?: string;
  invoice_number: string;
  period_start: string;
  period_end: string;
  issue_date: string;
  due_date: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  subtotal: string;
  tax: string;
  total: string;
  notes: string;
  created_by_name?: string;
  created_at: string;
  items: InvoiceItem[];
  payments: Payment[];
}

interface InvoiceItem {
  id: number;
  description: string;
  quantity: string;
  unit_price: string;
  line_total: string;
}

interface Payment {
  id: number;
  amount: string;
  payment_method: string;
  payment_date: string;
  reference: string;
}

interface FundingSource {
  id: number;
  resident: number;
  resident_name?: string;
  funding_type: string;
  funder_name: string;
  weekly_rate: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  notes: string;
}

const STATUS_CFG = {
  draft:     { label: "Draft",     color: "#9ca3af", bg: "rgba(156,163,175,0.12)" },
  sent:      { label: "Sent",      color: "var(--c-teal2)", bg: "rgba(45, 212, 191,0.12)" },
  paid:      { label: "Paid",      color: "var(--c-green)", bg: "rgba(52,211,153,0.12)" },
  overdue:   { label: "Overdue",   color: "var(--c-red)", bg: "rgba(248,113,113,0.12)" },
  cancelled: { label: "Cancelled", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
} as const;

const FUNDING_TYPE_LABEL: Record<string, string> = {
  self_funded:     "Self-Funded",
  local_authority: "Local Authority",
  nhs:             "NHS Continuing Healthcare",
  mixed:           "Mixed",
};

const FUNDING_TYPE_CFG: Record<string, { color: string; bg: string }> = {
  self_funded:     { color: "var(--c-amber)", bg: "rgba(251,191,36,0.12)" },
  local_authority: { color: "var(--c-teal2)", bg: "rgba(45, 212, 191,0.12)" },
  nhs:             { color: "var(--c-green)", bg: "rgba(52,211,153,0.12)" },
  mixed:           { color: "var(--c-teal)", bg: "rgba(13, 148, 136,0.12)" },
};

function fmt(value: string | number): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(n)) return "£0.00";
  return "£" + n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const today = new Date().toISOString().slice(0, 10);

export default function BillingPage() {
  const [tab, setTab] = useState<"invoices" | "funding">("invoices");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [funding, setFunding] = useState<FundingSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    resident: "",
    invoice_number: "",
    period_start: "",
    period_end: "",
    issue_date: today,
    due_date: "",
    notes: "",
  });

  const loadInvoices = useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams({ page_size: "100" });
    if (filterStatus) qs.set("status", filterStatus);
    fetch(`/api/v1/billing/invoices/?${qs}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setInvoices(d.results ?? d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterStatus]);

  const loadFunding = useCallback(() => {
    fetch("/api/v1/billing/funding-sources/?page_size=100", { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setFunding(d.results ?? d))
      .catch(console.error);
  }, []);

  useEffect(() => { loadInvoices(); }, [loadInvoices]);
  useEffect(() => { loadFunding(); }, [loadFunding]);

  async function handleSave() {
    if (!form.resident || !form.invoice_number || !form.period_start || !form.period_end || !form.issue_date || !form.due_date) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/billing/invoices/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, resident: Number(form.resident) }),
      });
      if (res.ok) {
        const inv = await res.json();
        setInvoices(p => [inv, ...p]);
        setShowModal(false);
        setForm({ resident: "", invoice_number: "", period_start: "", period_end: "", issue_date: today, due_date: "", notes: "" });
      }
    } finally {
      setSaving(false);
    }
  }

  const filteredInvoices = invoices.filter(inv => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (inv.resident_name ?? "").toLowerCase().includes(q) ||
      inv.invoice_number.toLowerCase().includes(q)
    );
  });

  const totalInvoices = invoices.length;
  const outstanding = invoices.filter(i => i.status === "sent" || i.status === "overdue").length;
  const totalRevenue = invoices
    .filter(i => i.status === "paid")
    .reduce((sum, i) => sum + parseFloat(i.total || "0"), 0);
  const overdueCount = invoices.filter(i => i.status === "overdue").length;

  // Group funding sources by resident
  const fundingByResident: Record<string, FundingSource[]> = {};
  for (const f of funding) {
    const key = f.resident_name ?? `Resident #${f.resident}`;
    if (!fundingByResident[key]) fundingByResident[key] = [];
    fundingByResident[key].push(f);
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(13, 148, 136,0.12)", border: "1px solid rgba(13, 148, 136,0.2)" }}
          >
            <Receipt size={16} style={{ color: "var(--c-teal)" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Billing</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Invoices and funding arrangements</p>
          </div>
        </div>
        {tab === "invoices" && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white"
            style={{ background: "#0d9488" }}
          >
            <Plus size={14} /> New Invoice
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Invoices",  value: totalInvoices,              color: "var(--c-teal)", display: String(totalInvoices) },
          { label: "Outstanding",     value: outstanding,                color: "var(--c-teal2)", display: String(outstanding) },
          { label: "Total Revenue",   value: totalRevenue,               color: "var(--c-green)", display: fmt(totalRevenue) },
          { label: "Overdue",         value: overdueCount,               color: "var(--c-red)", display: String(overdueCount) },
        ].map(({ label, color, display }) => (
          <div
            key={label}
            className="rounded-2xl p-4 text-center"
            style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-hover)" }}
          >
            <div className="text-2xl font-bold" style={{ color }}>{display}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        {(["invoices", "funding"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all"
            style={
              tab === t
                ? { background: "rgba(13, 148, 136,0.2)", color: "var(--c-teal)", border: "1px solid rgba(13, 148, 136,0.3)" }
                : { color: "var(--text-muted)", border: "1px solid transparent" }
            }
          >
            {t === "invoices" ? <CreditCard size={14} /> : <Users size={14} />}
            {t === "invoices" ? "Invoices" : "Funding Sources"}
          </button>
        ))}
      </div>

      {/* Invoices Tab */}
      {tab === "invoices" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search resident or invoice number…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full text-sm pl-9 pr-4 py-2 rounded-xl outline-none"
                style={{ background: "var(--input-bg)", border: "1px solid var(--bg-card-hover)", color: "var(--text-secondary)" }}
              />
            </div>
            <div className="relative">
              <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(var(--fg-rgb),0.25)" }} />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="text-sm pl-8 pr-8 py-2 rounded-xl outline-none appearance-none"
                style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.08)", color: "rgba(var(--fg-rgb),0.6)" }}
              >
                <option value="">All Statuses</option>
                {(["draft", "sent", "paid", "overdue", "cancelled"] as const).map(s => (
                  <option key={s} value={s}>{STATUS_CFG[s].label}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(var(--fg-rgb),0.3)" }} />
            </div>
          </div>

          {/* Invoice list */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
          ) : filteredInvoices.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No invoices found"
              description="Create a new invoice to get started."
              action={{ label: "New Invoice", onClick: () => setShowModal(true) }}
            />
          ) : (
            <div className="space-y-3">
              {filteredInvoices.map(inv => {
                const cfg = STATUS_CFG[inv.status] ?? STATUS_CFG.draft;
                const isOverdue = inv.status === "overdue" || (inv.status !== "paid" && inv.status !== "cancelled" && inv.due_date < today);
                return (
                  <div
                    key={inv.id}
                    className="rounded-2xl p-4"
                    style={{ background: "rgba(var(--fg-rgb),0.03)", border: "1px solid rgba(var(--fg-rgb),0.07)" }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="text-sm font-semibold text-white">
                            INV-{inv.invoice_number}
                          </span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            {cfg.label}
                          </span>
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {inv.resident_name ?? `Resident #${inv.resident}`}
                          </span>
                        </div>
                        <div className="text-xs" style={{ color: "rgba(var(--fg-rgb),0.4)" }}>
                          Period: {new Date(inv.period_start).toLocaleDateString("en-GB")} – {new Date(inv.period_end).toLocaleDateString("en-GB")}
                        </div>
                        {inv.notes && (
                          <div className="text-xs mt-1" style={{ color: "rgba(var(--fg-rgb),0.3)" }}>
                            {inv.notes}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-base font-bold text-white">{fmt(inv.total)}</div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: isOverdue ? "var(--c-red)" : "rgba(var(--fg-rgb),0.35)" }}
                        >
                          Due {new Date(inv.due_date).toLocaleDateString("en-GB")}
                        </div>
                        {inv.created_by_name && (
                          <div className="text-xs mt-1" style={{ color: "rgba(var(--fg-rgb),0.25)" }}>
                            {inv.created_by_name}
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

      {/* Funding Sources Tab */}
      {tab === "funding" && (
        <>
          {funding.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No funding sources found"
              description="Funding arrangements for residents will appear here."
            />
          ) : (
            <div className="space-y-4">
              {Object.entries(fundingByResident).map(([residentName, sources]) => (
                <div
                  key={residentName}
                  className="rounded-2xl p-4"
                  style={{ background: "rgba(var(--fg-rgb),0.03)", border: "1px solid rgba(var(--fg-rgb),0.07)" }}
                >
                  <div className="text-sm font-semibold text-white mb-3">{residentName}</div>
                  <div className="space-y-2">
                    {sources.map(src => {
                      const ftCfg = FUNDING_TYPE_CFG[src.funding_type] ?? { color: "var(--c-teal)", bg: "rgba(13, 148, 136,0.12)" };
                      return (
                        <div key={src.id} className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ background: ftCfg.bg, color: ftCfg.color }}
                            >
                              {FUNDING_TYPE_LABEL[src.funding_type] ?? src.funding_type}
                            </span>
                            {src.funder_name && (
                              <span className="text-xs" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>
                                {src.funder_name}
                              </span>
                            )}
                            {!src.is_active && (
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(107,114,128,0.15)", color: "#6b7280" }}>
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-white">{fmt(src.weekly_rate)}<span className="text-xs font-normal ml-1" style={{ color: "var(--text-muted)" }}>/wk</span></div>
                            <div className="text-xs" style={{ color: "rgba(var(--fg-rgb),0.3)" }}>
                              From {new Date(src.start_date).toLocaleDateString("en-GB")}
                              {src.end_date ? ` – ${new Date(src.end_date).toLocaleDateString("en-GB")}` : ""}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* New Invoice Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-lg"
            style={{ background: "var(--bg-elevated)", border: "1px solid rgba(13, 148, 136,0.25)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">New Invoice</h3>
              <button onClick={() => setShowModal(false)} style={{ color: "rgba(var(--fg-rgb),0.4)" }}>
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                {
                  label: "Resident *",
                  el: (
                    <input
                      type="text"
                      placeholder="Resident name or ID"
                      value={form.resident}
                      onChange={e => setForm(f => ({ ...f, resident: e.target.value }))}
                      className="w-full text-sm px-3 py-2 rounded-xl outline-none"
                      style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}
                    />
                  ),
                },
                {
                  label: "Invoice Number *",
                  el: (
                    <input
                      type="text"
                      placeholder="e.g. 2024-001"
                      value={form.invoice_number}
                      onChange={e => setForm(f => ({ ...f, invoice_number: e.target.value }))}
                      className="w-full text-sm px-3 py-2 rounded-xl outline-none"
                      style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}
                    />
                  ),
                },
                {
                  label: "Period Start *",
                  el: (
                    <input
                      type="date"
                      value={form.period_start}
                      onChange={e => setForm(f => ({ ...f, period_start: e.target.value }))}
                      className="w-full text-sm px-3 py-2 rounded-xl outline-none"
                      style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}
                    />
                  ),
                },
                {
                  label: "Period End *",
                  el: (
                    <input
                      type="date"
                      value={form.period_end}
                      onChange={e => setForm(f => ({ ...f, period_end: e.target.value }))}
                      className="w-full text-sm px-3 py-2 rounded-xl outline-none"
                      style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}
                    />
                  ),
                },
                {
                  label: "Issue Date *",
                  el: (
                    <input
                      type="date"
                      value={form.issue_date}
                      onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))}
                      className="w-full text-sm px-3 py-2 rounded-xl outline-none"
                      style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}
                    />
                  ),
                },
                {
                  label: "Due Date *",
                  el: (
                    <input
                      type="date"
                      value={form.due_date}
                      onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                      className="w-full text-sm px-3 py-2 rounded-xl outline-none"
                      style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}
                    />
                  ),
                },
                {
                  label: "Notes",
                  el: (
                    <textarea
                      rows={3}
                      placeholder="Optional notes…"
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none"
                      style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}
                    />
                  ),
                },
              ].map(({ label, el }) => (
                <div key={label}>
                  <label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>{label}</label>
                  {el}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
                style={{ background: "rgba(var(--fg-rgb),0.06)", color: "rgba(var(--fg-rgb),0.7)", border: "1px solid rgba(var(--fg-rgb),0.08)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.resident || !form.invoice_number || !form.period_start || !form.period_end || !form.issue_date || !form.due_date}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
                style={{ background: "#0d9488" }}
              >
                {saving ? "Saving…" : "Create Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
