import { serverApi } from "@/lib/server-api";
import Link from "next/link";
import type { Resident, MAREntry, ComplianceAudit } from "@/types";
import { Users, Pill, ShieldCheck, ClipboardList, AlertTriangle, TrendingUp, Activity } from "lucide-react";
import DashboardAlerts from "@/components/dashboard/DashboardAlerts";

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-6 ${className}`}
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color, trend }: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; color: string; trend?: string;
}) {
  return (
    <div className="rounded-2xl p-6 relative stat-card transition-all duration-200"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <div className="flex items-center justify-between mb-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
          <Icon size={16} style={{ color }} />
        </div>
        {trend && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "rgba(22,163,74,0.12)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}>
            {trend}
          </span>
        )}
      </div>
      <div className="text-4xl font-bold tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>{value}</div>
      <div className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{label}</div>
      <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</div>
    </div>
  );
}

const RISK_COLOR: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: "rgba(239,68,68,0.15)", text: "var(--c-red)", label: "Critical" },
  high:     { bg: "rgba(251,146,60,0.15)", text: "var(--c-orange)", label: "High" },
  medium:   { bg: "rgba(250,204,21,0.12)", text: "var(--c-amber)", label: "Medium" },
  low:      { bg: "rgba(52,211,153,0.12)", text: "var(--c-green)", label: "Low" },
};

const DOMAIN_LABELS: Record<string, string> = {
  safe: "Safe", effective: "Effective", caring: "Caring",
  responsive: "Responsive", well_led: "Well-Led",
};

export default async function DashboardPage() {
  const [resResult, marResult, compResult, planResult] = await Promise.allSettled([
    serverApi.residents.list({ is_active: "true" }),
    serverApi.medications.marList({ status: "pending" }),
    serverApi.compliance.audits(),
    serverApi.carePlans.list({ status: "active" }),
  ]);
  const empty = { results: [], count: 0 };
  const resData  = resResult.status  === "fulfilled" ? resResult.value  : empty;
  const marData  = marResult.status  === "fulfilled" ? marResult.value  : empty;
  const compData = compResult.status === "fulfilled" ? compResult.value : empty;
  const planData = planResult.status === "fulfilled" ? planResult.value : empty;

  const highRisk = resData.results.filter(
    (r: Resident) => r.fall_risk === "high" || r.fall_risk === "critical"
  );
  const avgScore = compData.results.length
    ? Math.round(compData.results.reduce((a: number, b: ComplianceAudit) => a + b.score, 0) / compData.results.length)
    : 0;

  const pendingMeds = marData.results.slice(0, 6) as MAREntry[];
  const audits = compData.results as ComplianceAudit[];

  return (
    <div className="space-y-6">
      <DashboardAlerts />
      <div>
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Residents" value={resData.count} sub="Currently active" icon={Users} color="#0d9488" trend="+2 this week" />
        <StatCard label="High Risk" value={highRisk.length} sub="Needs attention" icon={AlertTriangle} color="#dc2626" />
        <StatCard label="Meds Pending" value={marData.count} sub="Awaiting administration" icon={Pill} color="#d97706" />
        <StatCard label="Compliance" value={`${avgScore}%`} sub="Average CQC score" icon={ShieldCheck} color="#16a34a" trend="Good" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard>
          <div className="flex items-center gap-3 mb-1">
            <ClipboardList size={16} style={{ color: "var(--c-teal2)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Active Care Plans</span>
          </div>
          <div className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>{planData.count}</div>
          <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Plans currently in progress</div>
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} style={{ color: "var(--c-green)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>CQC Domain Scores</h2>
          </div>
          <div className="space-y-3">
            {audits.map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <span className="text-xs w-24 flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                  {DOMAIN_LABELS[a.domain] ?? a.domain}
                </span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${a.score}%`, background: a.score >= 85 ? "var(--c-green)" : a.score >= 70 ? "var(--c-teal2)" : "var(--c-orange)" }} />
                </div>
                <span className="text-xs font-medium w-8 text-right" style={{ color: "var(--text-secondary)" }}>
                  {a.score}%
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={16} style={{ color: "var(--c-red)" }} />
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>High Risk Residents</h2>
            </div>
            <Link href="/dashboard/residents" className="text-xs" style={{ color: "#0d9488" }}>View all →</Link>
          </div>
          {highRisk.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No high-risk residents.</p>
          ) : (
            <div className="space-y-2">
              {highRisk.slice(0, 5).map((r: Resident) => {
                const riskStyle = RISK_COLOR[r.fall_risk] ?? RISK_COLOR.low;
                return (
                  <div key={r.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ background: riskStyle.bg, color: riskStyle.text }}>
                        {r.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{r.full_name}</div>
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>Room {r.room_number}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: riskStyle.bg, color: riskStyle.text }}>
                        {riskStyle.label}
                      </span>
                      <span className="text-xs font-bold"
                        style={{ color: r.ai_risk_score >= 80 ? "var(--c-red)" : "var(--text-secondary)" }}>
                        {r.ai_risk_score}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Pill size={16} style={{ color: "var(--c-orange)" }} />
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Medications Pending</h2>
            </div>
            <a href="/dashboard/medications" className="text-xs" style={{ color: "#0d9488" }}>View all →</a>
          </div>
          {pendingMeds.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No pending medications.</p>
          ) : (
            <div className="space-y-2">
              {pendingMeds.map((m: MAREntry) => (
                <div key={m.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {m.drug_name ?? `Med #${m.medication}`}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {m.resident_name && <span className="mr-2">{m.resident_name}</span>}
                      {new Date(m.scheduled_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{ background: "rgba(251,146,60,0.15)", color: "var(--c-orange)" }}>
                    Pending
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
