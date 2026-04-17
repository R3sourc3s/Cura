"use client";

import { useEffect, useState } from "react";
import { carePlans } from "@/lib/api";
import type { CarePlan } from "@/types";
import { ClipboardList, Bot, Calendar, Filter } from "lucide-react";

const STATUS = {
  active:       { bg: "rgba(52,211,153,0.12)",  text: "#34d399",  label: "Active" },
  draft:        { bg: "rgba(255,255,255,0.06)",  text: "rgba(255,255,255,0.5)", label: "Draft" },
  under_review: { bg: "rgba(251,146,60,0.12)",   text: "#fb923c",  label: "Under Review" },
  archived:     { bg: "rgba(124,58,237,0.12)",   text: "#a78bfa",  label: "Archived" },
} as const;

export default function CarePlansPage() {
  const [plans, setPlans] = useState<CarePlan[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState<number | null>(null);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filter) params.status = filter;
    setLoading(true);
    carePlans.list(params)
      .then((d) => setPlans(d.results))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardList size={22} style={{ color: "#60a5fa" }} /> Care Plans
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            {plans.length} plan{plans.length !== 1 ? "s" : ""} {filter ? `· ${filter}` : ""}
          </p>
        </div>
        <button className="px-4 py-2 text-sm font-semibold rounded-xl text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
          + New Plan
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 p-4 rounded-2xl"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <Filter size={14} style={{ color: "rgba(255,255,255,0.35)" }} />
        {["", "active", "draft", "under_review", "archived"].map((v) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
            style={{
              background: filter === v ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
              color: filter === v ? "#a78bfa" : "rgba(255,255,255,0.45)",
              border: filter === v ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
            }}
          >
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const s = STATUS[plan.status] ?? STATUS.draft;
            const overdue = plan.next_review_date && new Date(plan.next_review_date) < new Date();
            return (
              <div key={plan.id} className="rounded-2xl p-5 flex flex-col gap-4 transition-all"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.25)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
              >
                {/* Plan header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Resident #{plan.resident}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Version {plan.version}</div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: s.bg, color: s.text }}>
                    {s.label}
                  </span>
                </div>

                {/* AI Summary */}
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
                  <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>No AI summary generated yet.</p>
                  </div>
                )}

                {/* Review date */}
                <div className="flex items-center gap-2">
                  <Calendar size={12} style={{ color: overdue ? "#f87171" : "rgba(255,255,255,0.3)" }} />
                  <span className="text-xs" style={{ color: overdue ? "#f87171" : "rgba(255,255,255,0.35)" }}>
                    {plan.next_review_date
                      ? `Review: ${new Date(plan.next_review_date).toLocaleDateString("en-GB")}${overdue ? " (overdue)" : ""}`
                      : "No review date set"}
                  </span>
                </div>

                {/* Sections */}
                {plan.sections && plan.sections.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {plan.sections.slice(0, 3).map((sec) => (
                      <span key={sec.id} className="text-xs px-2 py-0.5 rounded-md"
                        style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                        {sec.title}
                      </span>
                    ))}
                    {plan.sections.length > 3 && (
                      <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}>
                        +{plan.sections.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <button className="flex-1 py-2 text-xs font-semibold rounded-xl transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)" }}>
                    View Plan
                  </button>
                  <button
                    disabled={summaryLoading === plan.id}
                    onClick={async () => {
                      setSummaryLoading(plan.id);
                      try {
                        const r = await carePlans.generateSummary(plan.id);
                        setPlans((prev) => prev.map((p) => p.id === plan.id ? { ...p, ai_summary: r.summary } : p));
                      } catch (e) { console.error(e); }
                      finally { setSummaryLoading(null); }
                    }}
                    className="flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1"
                    style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}
                  >
                    <Bot size={11} />
                    {summaryLoading === plan.id ? "Generating…" : "AI Summary"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
