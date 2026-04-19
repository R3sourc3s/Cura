"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { carePlans, residents as residentsApi } from "@/lib/api";
import type { CarePlan, Resident } from "@/types";
import { ClipboardList, Bot, Calendar, Filter, Plus, X, Save } from "lucide-react";

const STATUS = {
  active:       { bg: "rgba(52,211,153,0.12)",  text: "#34d399",  label: "Active" },
  draft:        { bg: "rgba(255,255,255,0.06)",  text: "rgba(255,255,255,0.5)", label: "Draft" },
  under_review: { bg: "rgba(251,146,60,0.12)",   text: "#fb923c",  label: "Under Review" },
  archived:     { bg: "rgba(124,58,237,0.12)",   text: "#a78bfa",  label: "Archived" },
} as const;

const inputCls = "w-full px-3 py-2.5 text-sm rounded-xl outline-none";
const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" };

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function NewPlanModal({
  residents,
  onClose,
  onCreated,
}: {
  residents: Resident[];
  onClose: () => void;
  onCreated: (plan: CarePlan) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({
    resident: "",
    status: "draft",
    next_review_date: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        resident: Number(form.resident),
        status: form.status,
      };
      if (form.next_review_date) payload.next_review_date = form.next_review_date;
      const plan = await carePlans.create(payload as Parameters<typeof carePlans.create>[0]);
      onCreated(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create plan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-md rounded-2xl flex flex-col overflow-hidden"
        style={{ background: "#0d1526", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
              <ClipboardList size={14} className="text-white" />
            </div>
            <h2 className="text-base font-bold text-white">New Care Plan</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <X size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm text-red-300"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}
          <Field label="Resident" required>
            <select className={inputCls} style={inputStyle} value={form.resident}
              onChange={(e) => set("resident", e.target.value)} required>
              <option value="">— select resident —</option>
              {residents.map((r) => (
                <option key={r.id} value={r.id}>{r.full_name} (Room {r.room_number})</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select className={inputCls} style={inputStyle} value={form.status}
              onChange={(e) => set("status", e.target.value)}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="under_review">Under Review</option>
            </select>
          </Field>
          <Field label="Next Review Date">
            <input type="date" className={inputCls} style={inputStyle} value={form.next_review_date}
              onChange={(e) => set("next_review_date", e.target.value)} />
          </Field>
        </form>

        <div className="px-6 py-4 flex gap-3 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
            Cancel
          </button>
          <button onClick={() => formRef.current?.requestSubmit()} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
            <Save size={14} />{saving ? "Creating…" : "Create Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CarePlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<CarePlan[]>([]);
  const [residentList, setResidentList] = useState<Resident[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    residentsApi.list({ is_active: "true" })
      .then((d) => setResidentList(d.results))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filter) params.status = filter;
    setLoading(true);
    carePlans.list(params)
      .then((d) => setPlans(d.results))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  function handleCreated(plan: CarePlan) {
    setShowNew(false);
    router.push(`/dashboard/care-plans/${plan.id}`);
  }

  const residentMap = Object.fromEntries(residentList.map((r) => [r.id, r]));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardList size={22} style={{ color: "#60a5fa" }} /> Care Plans
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            {plans.length} plan{plans.length !== 1 ? "s" : ""} {filter ? `· ${filter}` : ""}
          </p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold rounded-xl text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
          <Plus size={14} /> <span className="hidden sm:inline">New Plan</span><span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 p-4 rounded-2xl"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <Filter size={14} style={{ color: "rgba(255,255,255,0.35)" }} />
        {["", "active", "draft", "under_review", "archived"].map((v) => (
          <button key={v} onClick={() => setFilter(v)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
            style={{
              background: filter === v ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
              color: filter === v ? "#a78bfa" : "rgba(255,255,255,0.45)",
              border: filter === v ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
            }}>
            {v === "" ? "All" : v.replace("_", " ").replace(/^\w/, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <ClipboardList size={32} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.2)" }} />
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No care plans found.</p>
          <button onClick={() => setShowNew(true)}
            className="mt-4 px-4 py-2 text-sm font-semibold rounded-xl text-white inline-flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
            <Plus size={14} /> Create First Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const s = STATUS[plan.status] ?? STATUS.draft;
            const overdue = plan.next_review_date && new Date(plan.next_review_date) < new Date();
            const resident = residentMap[plan.resident];
            return (
              <div key={plan.id} className="rounded-2xl p-5 flex flex-col gap-4 transition-all cursor-pointer"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.25)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                onClick={() => router.push(`/dashboard/care-plans/${plan.id}`)}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {resident?.full_name ?? `Resident #${plan.resident}`}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Version {plan.version}</div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0" style={{ background: s.bg, color: s.text }}>
                    {s.label}
                  </span>
                </div>

                {plan.ai_summary ? (
                  <div className="rounded-xl p-3" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Bot size={11} style={{ color: "#a78bfa" }} />
                      <span className="text-xs font-medium" style={{ color: "#a78bfa" }}>AI Summary</span>
                    </div>
                    <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {plan.ai_summary}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>No AI summary yet.</p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar size={12} style={{ color: overdue ? "#f87171" : "rgba(255,255,255,0.3)" }} />
                  <span className="text-xs" style={{ color: overdue ? "#f87171" : "rgba(255,255,255,0.35)" }}>
                    {plan.next_review_date
                      ? `Review: ${new Date(plan.next_review_date).toLocaleDateString("en-GB")}${overdue ? " (overdue)" : ""}`
                      : "No review date set"}
                  </span>
                </div>

                {plan.sections && plan.sections.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {plan.sections.slice(0, 3).map((sec) => (
                      <span key={sec.id} className="text-xs px-2 py-0.5 rounded-md"
                        style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                        {sec.title}
                      </span>
                    ))}
                    {plan.sections.length > 3 && (
                      <span className="text-xs px-2 py-0.5 rounded-md"
                        style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}>
                        +{plan.sections.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}
                  onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => router.push(`/dashboard/care-plans/${plan.id}`)}
                    className="flex-1 py-2 text-xs font-semibold rounded-xl transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)" }}>
                    View Plan
                  </button>
                  <button disabled={summaryLoading === plan.id}
                    onClick={async () => {
                      setSummaryLoading(plan.id);
                      try {
                        const r = await carePlans.generateSummary(plan.id);
                        setPlans((prev) => prev.map((p) => p.id === plan.id ? { ...p, ai_summary: r.summary } : p));
                      } catch (e) { console.error(e); }
                      finally { setSummaryLoading(null); }
                    }}
                    className="flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1"
                    style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}>
                    <Bot size={11} />
                    {summaryLoading === plan.id ? "Generating…" : "AI Summary"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showNew && (
        <NewPlanModal residents={residentList} onClose={() => setShowNew(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
