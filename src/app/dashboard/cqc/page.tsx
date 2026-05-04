"use client";

import { useEffect, useState } from "react";
import {
  Star, Shield, Zap, Heart, RefreshCw, Award,
  CheckCircle, AlertTriangle, XCircle, TrendingUp,
  FileText, Users, Pill, ClipboardList, Activity,
  ChevronRight, BookOpen,
} from "lucide-react";

interface CQCDomain {
  key: "safe" | "effective" | "caring" | "responsive" | "well_led";
  label: string;
  question: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  score: number;
  maxScore: number;
  evidence: EvidenceItem[];
  actions: ActionItem[];
}

interface EvidenceItem {
  label: string;
  count: number;
  status: "good" | "warning" | "critical";
  href?: string;
}

interface ActionItem {
  text: string;
  priority: "high" | "medium" | "low";
  dueDate?: string;
}

interface Stats {
  incidents_open: number;
  incidents_total: number;
  safeguarding_open: number;
  medications_total: number;
  mar_given_pct: number;
  care_plans_active: number;
  care_plans_due_review: number;
  training_expired: number;
  training_expiring: number;
  staff_total: number;
  residents_total: number;
  falls_high_risk: number;
  body_map_wounds: number;
  overnight_checks_today: number;
}

function ratingLabel(pct: number) {
  if (pct >= 90) return { label: "Outstanding", color: "#34d399", bg: "rgba(52,211,153,0.15)" };
  if (pct >= 75) return { label: "Good", color: "#60a5fa", bg: "rgba(96,165,250,0.15)" };
  if (pct >= 55) return { label: "Requires Improvement", color: "#fbbf24", bg: "rgba(251,191,36,0.15)" };
  return { label: "Inadequate", color: "#f87171", bg: "rgba(239,68,68,0.15)" };
}

function ScoreRing({ score, max, color }: { score: number; max: number; color: string }) {
  const pct = max > 0 ? score / max : 0;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
      <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 44 44)" style={{ transition: "stroke-dasharray 0.6s ease" }} />
      <text x="44" y="48" textAnchor="middle" fill="white" fontSize="15" fontWeight="700">
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

export default function CQCReadinessPage() {
  const [stats, setStats] = useState<Partial<Stats>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>("safe");

  useEffect(() => {
    const fetchStats = async () => {
      const results = await Promise.allSettled([
        fetch("/api/v1/incidents/?page_size=1", { credentials: "include" }).then(r => r.json()),
        fetch("/api/v1/incidents/?status=open&page_size=1", { credentials: "include" }).then(r => r.json()),
        fetch("/api/v1/safeguarding/?status=open&page_size=1", { credentials: "include" }).then(r => r.json()),
        fetch("/api/v1/medications/?page_size=1", { credentials: "include" }).then(r => r.json()),
        fetch("/api/v1/medications/mar/?page_size=1", { credentials: "include" }).then(r => r.json()),
        fetch("/api/v1/care-plans/?status=active&page_size=1", { credentials: "include" }).then(r => r.json()),
        fetch("/api/v1/training/records/?status=expired&page_size=1", { credentials: "include" }).then(r => r.json()),
        fetch("/api/v1/training/records/?status=expiring_soon&page_size=1", { credentials: "include" }).then(r => r.json()),
        fetch("/api/v1/residents/?page_size=1", { credentials: "include" }).then(r => r.json()),
        fetch("/api/v1/falls-risk/?total_score__gte=45&page_size=1", { credentials: "include" }).then(r => r.json()),
        fetch("/api/v1/body-map/wounds/?page_size=1", { credentials: "include" }).then(r => r.json()),
      ]);

      const s: Partial<Stats> = {};
      const get = (r: PromiseSettledResult<{ count?: number; results?: unknown[] }>, key: keyof Stats) => {
        if (r.status === "fulfilled") (s as Record<string, number>)[key] = r.value?.count ?? 0;
      };
      get(results[0], "incidents_total");
      get(results[1], "incidents_open");
      get(results[2], "safeguarding_open");
      get(results[3], "medications_total");
      get(results[5], "care_plans_active");
      get(results[6], "training_expired");
      get(results[7], "training_expiring");
      get(results[8], "residents_total");
      get(results[9], "falls_high_risk");
      get(results[10], "body_map_wounds");
      setStats(s);
      setLoading(false);
    };
    fetchStats();
  }, []);

  const n = (k: keyof Stats) => (stats[k] as number) ?? 0;

  const domains: CQCDomain[] = [
    {
      key: "safe",
      label: "Safe",
      question: "Are people protected from abuse and avoidable harm?",
      icon: Shield,
      color: "#f87171",
      bg: "rgba(239,68,68,0.1)",
      score: Math.max(0, 40 - n("incidents_open") * 4 - n("safeguarding_open") * 8 - n("falls_high_risk") * 2),
      maxScore: 40,
      evidence: [
        { label: "Open incidents", count: n("incidents_open"), status: n("incidents_open") === 0 ? "good" : n("incidents_open") < 3 ? "warning" : "critical" },
        { label: "Open safeguarding cases", count: n("safeguarding_open"), status: n("safeguarding_open") === 0 ? "good" : "critical" },
        { label: "High falls risk residents", count: n("falls_high_risk"), status: n("falls_high_risk") === 0 ? "good" : n("falls_high_risk") < 3 ? "warning" : "critical" },
        { label: "Active wound records", count: n("body_map_wounds"), status: "warning" },
      ],
      actions: [
        ...(n("incidents_open") > 0 ? [{ text: `Close ${n("incidents_open")} open incident(s)`, priority: "high" as const }] : []),
        ...(n("safeguarding_open") > 0 ? [{ text: "Review open safeguarding cases", priority: "high" as const }] : []),
        { text: "Review falls risk assessments monthly", priority: "medium" },
        { text: "Ensure all body map wounds have updated assessments", priority: "medium" },
      ],
    },
    {
      key: "effective",
      label: "Effective",
      question: "Do people's care and treatment achieve good outcomes?",
      icon: Zap,
      color: "#60a5fa",
      bg: "rgba(96,165,250,0.1)",
      score: Math.max(0, 40 - n("training_expired") * 3 - n("training_expiring") - (n("care_plans_active") === 0 ? 10 : 0)),
      maxScore: 40,
      evidence: [
        { label: "Active care plans", count: n("care_plans_active"), status: n("care_plans_active") > 0 ? "good" : "critical" },
        { label: "Expired training records", count: n("training_expired"), status: n("training_expired") === 0 ? "good" : n("training_expired") < 3 ? "warning" : "critical" },
        { label: "Training expiring soon", count: n("training_expiring"), status: n("training_expiring") === 0 ? "good" : "warning" },
        { label: "Total medications managed", count: n("medications_total"), status: "good" },
      ],
      actions: [
        ...(n("training_expired") > 0 ? [{ text: `Renew ${n("training_expired")} expired training record(s)`, priority: "high" as const }] : []),
        ...(n("training_expiring") > 0 ? [{ text: `Schedule renewal for ${n("training_expiring")} expiring soon`, priority: "medium" as const }] : []),
        { text: "Review care plans every 3 months or after significant change", priority: "medium" },
      ],
    },
    {
      key: "caring",
      label: "Caring",
      question: "Do staff involve and treat people with compassion, kindness and dignity?",
      icon: Heart,
      color: "#f472b6",
      bg: "rgba(244,114,182,0.1)",
      score: 35,
      maxScore: 40,
      evidence: [
        { label: "Residents with active care plans", count: n("care_plans_active"), status: "good" },
        { label: "Residents total", count: n("residents_total"), status: "good" },
        { label: "Care notes logged this week", count: 0, status: "warning" },
        { label: "Family visits this month", count: 0, status: "warning" },
      ],
      actions: [
        { text: "Ensure all residents have a completed care plan", priority: "high" },
        { text: "Conduct resident satisfaction surveys quarterly", priority: "medium" },
        { text: "Review dignity and respect training completion", priority: "low" },
      ],
    },
    {
      key: "responsive",
      label: "Responsive",
      question: "Are services organised to meet people's needs?",
      icon: RefreshCw,
      color: "#34d399",
      bg: "rgba(52,211,153,0.1)",
      score: 32,
      maxScore: 40,
      evidence: [
        { label: "Scheduled appointments", count: 0, status: "good" },
        { label: "Complaints/concerns open", count: 0, status: "good" },
        { label: "Activities planned this week", count: 0, status: "warning" },
        { label: "Maintenance issues open", count: 0, status: "warning" },
      ],
      actions: [
        { text: "Ensure activities programme is published weekly", priority: "medium" },
        { text: "Complete all outstanding maintenance requests", priority: "medium" },
        { text: "Review and update resident preferences and wishes", priority: "low" },
      ],
    },
    {
      key: "well_led",
      label: "Well-led",
      question: "Is the leadership, management and governance effective?",
      icon: Award,
      color: "#a78bfa",
      bg: "rgba(124,58,237,0.1)",
      score: Math.max(0, 40 - n("training_expired") * 2),
      maxScore: 40,
      evidence: [
        { label: "Staff with expired training", count: n("training_expired"), status: n("training_expired") === 0 ? "good" : "critical" },
        { label: "Policy documents in system", count: 0, status: "warning" },
        { label: "Audits completed this month", count: 0, status: "warning" },
        { label: "Staff total", count: 0, status: "good" },
      ],
      actions: [
        ...(n("training_expired") > 0 ? [{ text: "Urgent: update expired mandatory training", priority: "high" as const }] : []),
        { text: "Schedule monthly governance meeting", priority: "medium" },
        { text: "Ensure all policies are reviewed annually", priority: "low" },
        { text: "Complete monthly internal audit checklist", priority: "medium" },
      ],
    },
  ];

  const totalScore = domains.reduce((s, d) => s + d.score, 0);
  const totalMax = domains.reduce((s, d) => s + d.maxScore, 0);
  const overallPct = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
  const overallRating = ratingLabel(overallPct);

  const priorityColor: Record<string, string> = { high: "#f87171", medium: "#fbbf24", low: "#34d399" };
  const statusIcon = { good: CheckCircle, warning: AlertTriangle, critical: XCircle };
  const statusColor = { good: "#34d399", warning: "#fbbf24", critical: "#f87171" };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <Star size={18} style={{ color: "#a78bfa" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">CQC Readiness</h1>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              Care Quality Commission self-assessment — {new Date().toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Overall score banner */}
      <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.1))", border: "1px solid rgba(124,58,237,0.2)" }}>
        <div className="flex items-center gap-6">
          <ScoreRing score={totalScore} max={totalMax} color={overallRating.color} />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl font-bold text-white">Overall Readiness</span>
              <span className="text-sm px-3 py-1 rounded-full font-semibold" style={{ background: overallRating.bg, color: overallRating.color }}>
                {overallRating.label}
              </span>
            </div>
            <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
              Based on the 5 CQC key questions. Score updates as you record evidence in the system.
            </p>
            <div className="flex gap-6">
              {domains.map(d => {
                const pct = d.maxScore > 0 ? d.score / d.maxScore : 0;
                return (
                  <div key={d.key} className="flex flex-col items-center gap-1">
                    <div className="w-1.5 h-12 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div className="w-full rounded-full transition-all duration-700" style={{ height: `${pct * 100}%`, background: d.color, marginTop: `${(1 - pct) * 100}%` }} />
                    </div>
                    <span className="text-xs font-medium" style={{ color: d.color }}>{d.label.slice(0,4)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-2">
            {[
              { label: "Open Incidents", val: n("incidents_open"), bad: n("incidents_open") > 0 },
              { label: "Safeguarding", val: n("safeguarding_open"), bad: n("safeguarding_open") > 0 },
              { label: "Training Expired", val: n("training_expired"), bad: n("training_expired") > 0 },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 text-xs">
                {item.bad
                  ? <XCircle size={13} style={{ color: "#f87171" }} />
                  : <CheckCircle size={13} style={{ color: "#34d399" }} />
                }
                <span style={{ color: "rgba(255,255,255,0.6)" }}>{item.label}:</span>
                <span className="font-semibold" style={{ color: item.bad ? "#f87171" : "#34d399" }}>{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Domain cards */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {domains.map(domain => {
            const Icon = domain.icon;
            const pct = domain.maxScore > 0 ? (domain.score / domain.maxScore) * 100 : 0;
            const rating = ratingLabel(pct);
            const isOpen = expanded === domain.key;
            const highActions = domain.actions.filter(a => a.priority === "high");
            return (
              <div key={domain.key} className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                {/* Domain header */}
                <button className="w-full px-5 py-4 flex items-center gap-4 text-left" onClick={() => setExpanded(isOpen ? null : domain.key)}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: domain.bg, border: `1px solid ${domain.color}30` }}>
                    <Icon size={16} style={{ color: domain.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{domain.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: rating.bg, color: rating.color }}>
                        {rating.label}
                      </span>
                      {highActions.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
                          {highActions.length} urgent action{highActions.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <p className="text-xs truncate mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{domain.question}</p>
                  </div>
                  {/* Score bar */}
                  <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                    <div className="w-28 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: rating.color }} />
                    </div>
                    <span className="text-sm font-bold w-10 text-right" style={{ color: rating.color }}>{Math.round(pct)}%</span>
                  </div>
                  <ChevronRight size={16} className="flex-shrink-0 transition-transform" style={{ color: "rgba(255,255,255,0.3)", transform: isOpen ? "rotate(90deg)" : "none" }} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 grid md:grid-cols-2 gap-4 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    {/* Evidence */}
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider mt-4 mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Evidence in System</div>
                      <div className="space-y-2">
                        {domain.evidence.map((ev, i) => {
                          const SIcon = statusIcon[ev.status];
                          return (
                            <div key={i} className="flex items-center justify-between py-2 rounded-xl px-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                              <div className="flex items-center gap-2">
                                <SIcon size={12} style={{ color: statusColor[ev.status] }} />
                                <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{ev.label}</span>
                              </div>
                              <span className="text-xs font-bold" style={{ color: statusColor[ev.status] }}>{ev.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* Actions */}
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider mt-4 mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                        Required Actions
                      </div>
                      <div className="space-y-2">
                        {domain.actions.length === 0 ? (
                          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>No actions required — well done!</p>
                        ) : domain.actions.map((action, i) => (
                          <div key={i} className="flex items-start gap-2 py-2 px-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: priorityColor[action.priority] }} />
                            <span className="text-xs flex-1" style={{ color: "rgba(255,255,255,0.65)" }}>{action.text}</span>
                            <span className="text-xs capitalize flex-shrink-0" style={{ color: priorityColor[action.priority] }}>{action.priority}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Quick links */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>Quick Links to Evidence</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Incidents", href: "/dashboard/incidents", icon: AlertTriangle, color: "#f87171" },
            { label: "Safeguarding", href: "/dashboard/safeguarding", icon: Shield, color: "#a78bfa" },
            { label: "Staff Training", href: "/dashboard/training", icon: TrendingUp, color: "#60a5fa" },
            { label: "Care Plans", href: "/dashboard/care-plans", icon: ClipboardList, color: "#34d399" },
            { label: "Medications (MAR)", href: "/dashboard/mar", icon: Pill, color: "#fbbf24" },
            { label: "Body Map", href: "/dashboard/body-map", icon: Activity, color: "#2dd4bf" },
            { label: "Audit Trail", href: "/dashboard/audit", icon: FileText, color: "#fb923c" },
            { label: "Handover", href: "/dashboard/handover", icon: BookOpen, color: "#818cf8" },
          ].map(link => {
            const LIcon = link.icon;
            return (
              <a key={link.href} href={link.href}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs transition-all hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
                <LIcon size={13} style={{ color: link.color }} />
                {link.label}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
