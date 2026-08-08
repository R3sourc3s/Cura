import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Zap, Star, Wrench, TrendingUp } from "lucide-react";

const releases = [
  {
    version: "v2.4.0",
    date: "May 2025",
    type: "feature",
    changes: [
      "New: Pharmacy module — supplier management, medication stock, controlled drug register",
      "New: Billing & invoicing module with funding source tracking",
      "New: Skills matrix — staff competency and certification management",
      "New: Family Portal — family member profiles and messaging",
      "Improvement: Dashboard KPIs now update in real time via WebSocket",
      "Fix: Resolved race condition in concurrent medication administration",
    ],
  },
  {
    version: "v2.3.0",
    date: "April 2025",
    type: "feature",
    changes: [
      "New: GP & Hospital integration — referrals, discharge summaries, contact directory",
      "New: Enquiries & pre-admission assessment module",
      "New: Leave management with approval workflow and balance tracking",
      "Improvement: Resident search now supports phonetic matching",
      "Improvement: Mobile app performance improvements — 40% faster load times",
      "Fix: MAR chart export now correctly handles PRN entries",
    ],
  },
  {
    version: "v2.2.0",
    date: "March 2025",
    type: "feature",
    changes: [
      "New: Recruitment module — job postings, applicant tracking, right-to-work workflow",
      "New: Task board with priority, category, and resident linking",
      "New: Handover report improvements — structured sections and shift summary AI",
      "Improvement: Rota now supports split shifts and zero-hour contracts",
      "Fix: Body map annotations now persist correctly on Safari",
    ],
  },
  {
    version: "v2.1.0",
    date: "February 2025",
    type: "improvement",
    changes: [
      "New: AI-generated compliance reports with CQC key line mapping",
      "New: CQC Toolkit — checklist, evidence pack generator",
      "New: Overnight checks module with non-contact observation logging",
      "Improvement: Audit trail now includes API access events",
      "Improvement: Notification preferences per user per module",
      "Fix: PDF export encoding issue on Windows systems resolved",
    ],
  },
  {
    version: "v2.0.0",
    date: "January 2025",
    type: "major",
    changes: [
      "Complete platform redesign — warm theme with CSS variable theming",
      "New: AI Assistant with natural language query support",
      "New: Role-based permission system with granular module access",
      "New: Real-time notifications via WebSocket",
      "New: Multi-care-home support for care groups",
      "Performance: API response times improved by 60% with query optimisation",
    ],
  },
];

const typeConfig = {
  major:       { label: "Major release", color: "#0d9488", icon: Star },
  feature:     { label: "Feature update", color: "#10b981", icon: Zap },
  improvement: { label: "Improvement",   color: "#0d9488", icon: TrendingUp },
  fix:         { label: "Bug fix",       color: "#10b981", icon: Wrench },
} as const;

export default function ChangelogPage() {
  return (
    <main style={{ background: "var(--bg-secondary)", minHeight: "100vh" }}>
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#0d9488" }}>Changelog</p>
            <h1 className="lp-serif text-4xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>What&apos;s new in Cura</h1>
            <p style={{ color: "var(--text-muted)" }}>New features, improvements, and fixes — delivered every few weeks.</p>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px" style={{ background: "var(--border)" }} />

            <div className="space-y-12">
              {releases.map((release) => {
                const cfg = typeConfig[release.type as keyof typeof typeConfig] ?? typeConfig.feature;
                const Icon = cfg.icon;
                return (
                  <div key={release.version} className="relative pl-12">
                    <div className="absolute left-0 w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: `${cfg.color}12`, border: `2px solid ${cfg.color}` }}>
                      <Icon size={14} style={{ color: cfg.color }} />
                    </div>

                    <div className="lp-card rounded-2xl p-6">
                      <div className="flex items-center gap-3 flex-wrap mb-4">
                        <span className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>{release.version}</span>
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ background: `${cfg.color}12`, color: cfg.color }}>{cfg.label}</span>
                        <span className="text-sm ml-auto" style={{ color: "var(--text-muted)" }}>{release.date}</span>
                      </div>
                      <ul className="space-y-2">
                        {release.changes.map((change, i) => {
                          const prefix = change.split(":")[0];
                          const rest = change.includes(":") ? change.slice(prefix.length + 1) : change;
                          const prefixColor =
                            prefix === "New"         ? "#0d9488" :
                            prefix === "Fix"         ? "#b91c1c" :
                            prefix === "Improvement" ? "#10b981" : undefined;
                          return (
                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                              <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: "var(--border)" }} />
                              {prefixColor && change.includes(":") ? (
                                <span><span className="font-semibold" style={{ color: prefixColor }}>{prefix}:</span>{rest}</span>
                              ) : (
                                <span>{change}</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-16 lp-card rounded-2xl p-8 text-center">
            <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Stay up to date</h3>
            <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>Get release notes delivered to your inbox.</p>
            <div className="flex gap-2 max-w-sm mx-auto">
              <input type="email" placeholder="your@email.com" className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "#0d9488" }}>Subscribe</button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
