import { serverApi } from "@/lib/server-api";
import type { Resident, MAREntry, ComplianceAudit } from "@/types";
import { Users, Pill, ShieldCheck, ClipboardList, AlertTriangle, TrendingUp, Activity } from "lucide-react";

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`}
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color, trend }: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; color: string; trend?: string;
}) {
  return (
    <GlassCard>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon size={18} style={{ color }} />
        </div>
        {trend && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: "rgba(52,211,153,0.1)", color: "#34d399" }}>
            {trend}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>{label}</div>
      <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</div>
    </GlassCard>
  );
}

const RISK_COLOR: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: "rgba(239,68,68,0.15)", text: "#f87171", label: "Critical" },
  high:     { bg: "rgba(251,146,60,0.15)", text: "#fb923c", label: "High" },
  medium:   { bg: "rgba(250,204,21,0.12)", text: "#fbbf24", label: "Medium" },
  low:      { bg: "rgba(52,211,153,0.12)", text: "#34d399", label: "Low" },
};

const DOMAIN_LABELS: Record<string, string> = {
  safe: "Safe", effective: "Effective", caring: "Caring",
  responsive: "Responsive", well_led: "Well-Led",
};

export default async function DashboardPage() {
  const [resData, marData, compData, planData] = await Promise.all([
    serverApi.residents.list({ is_active: "true" }),
    serverApi.medications.marList({ status: "pending" }),
    serverApi.compliance.audits(),
    serverApi.carePlans.list({ status: "active" }),
  ]);

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
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Residents" value={resData.count} sub="Currently active" icon={Users} color="#7c3aed" trend="+2 this week" />
        <StatCard label="High Risk" value={highRisk.length} sub="Needs attention" icon={AlertTriangle} color="#f87171" />
        <StatCard label="Meds Pending" value={marData.count} sub="Awaiting administration" icon={Pill} color="#fb923c" />
        <StatCard label="Compliance" value={`${avgScore}%`} sub="Average CQC score" icon={ShieldCheck} color="#34d399" trend="Good" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard>
          <div className="flex items-center gap-3 mb-1">
            <ClipboardList size={16} style={{ color: "#60a5fa" }} />
            <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>Active Care Plans</span>
          </div>
          <div className="text-4xl font-bold text-white">{planData.count}</div>
          <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Plans currently in progress</div>
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} style={{ color: "#34d399" }} />
            <h2 className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>CQC Domain Scores</h2>
          </div>
          <div className="space-y-3">
            {audits.map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <span className="text-xs w-24 flex-shrink-0" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {DOMAIN_LABELS[a.domain] ?? a.domain}
                </span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${a.score}%`, background: a.score >= 85 ? "#34d399" : a.score >= 70 ? "#60a5fa" : "#fb923c" }} />
                </div>
                <span className="text-xs font-medium w-8 text-right" style={{ color: "rgba(255,255,255,0.6)" }}>
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
              <Activity size={16} style={{ color: "#f87171" }} />
              <h2 className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>High Risk Residents</h2>
            </div>
            <a href="/dashboard/residents" className="text-xs" style={{ color: "rgba(124,58,237,0.8)" }}>View all →</a>
          </div>
          {highRisk.length === 0 ? (
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No high-risk residents.</p>
          ) : (
            <div className="space-y-2">
              {highRisk.slice(0, 5).map((r: Resident) => {
                const riskStyle = RISK_COLOR[r.fall_risk] ?? RISK_COLOR.low;
                return (
                  <div key={r.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ background: riskStyle.bg, color: riskStyle.text }}>
                        {r.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{r.full_name}</div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Room {r.room_number}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: riskStyle.bg, color: riskStyle.text }}>
                        {riskStyle.label}
                      </span>
                      <span className="text-xs font-bold"
                        style={{ color: r.ai_risk_score >= 80 ? "#f87171" : "rgba(255,255,255,0.5)" }}>
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
              <Pill size={16} style={{ color: "#fb923c" }} />
              <h2 className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>Medications Pending</h2>
            </div>
            <a href="/dashboard/medications" className="text-xs" style={{ color: "rgba(124,58,237,0.8)" }}>View all →</a>
          </div>
          {pendingMeds.length === 0 ? (
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No pending medications.</p>
          ) : (
            <div className="space-y-2">
              {pendingMeds.map((m: MAREntry) => (
                <div key={m.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {m.drug_name ?? `Med #${m.medication}`}
                    </div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {m.resident_name && <span className="mr-2">{m.resident_name}</span>}
                      {new Date(m.scheduled_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{ background: "rgba(251,146,60,0.15)", color: "#fb923c" }}>
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
