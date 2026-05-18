import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  Globe,
  Lock,
  Users,
  Award,
  Target,
  FileSearch,
  Eye,
  AlertCircle,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const pillars = [
  {
    icon: Award,
    title: "ISO 27001 Certified",
    color: "#a78bfa",
    desc: "Our information security management system is independently certified to ISO 27001, the internationally recognised gold standard. Annual surveillance audits ensure continuous compliance.",
  },
  {
    icon: Globe,
    title: "UK Data Residency",
    color: "#60a5fa",
    desc: "All resident data is stored and processed exclusively within UK data centres. We never transfer personal data outside of England and Wales without explicit consent and legal basis.",
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    color: "#34d399",
    desc: "Data is encrypted at rest using AES-256 and in transit using TLS 1.3. Encryption keys are managed via HSM hardware and rotated automatically every 90 days.",
  },
  {
    icon: Users,
    title: "Role-Based Access Control",
    color: "#f59e0b",
    desc: "Granular permissions ensure staff only see what they need. 46 distinct roles, from care assistant to registered manager, each with a tailored permission set. Full SSO support including NHS Identity.",
  },
  {
    icon: ShieldCheck,
    title: "SOC 2 Type II",
    color: "#f472b6",
    desc: "Independent SOC 2 Type II audits verify our security, availability, processing integrity, confidentiality, and privacy controls over rolling 12-month periods.",
  },
  {
    icon: Target,
    title: "Penetration Tested Annually",
    color: "#06b6d4",
    desc: "CREST-accredited penetration testers conduct adversarial testing every year. All critical and high findings are remediated within 30 days. Summaries available to enterprise customers on request.",
  },
];

const complianceBadges = [
  {
    label: "NHS DSP Toolkit",
    sublabel: "Standards Met",
    color: "#3b82f6",
    desc: "Cura meets all mandatory requirements of the NHS Data Security and Protection Toolkit, including mandatory training, data flow mapping, and business continuity planning.",
  },
  {
    label: "Cyber Essentials+",
    sublabel: "Certified",
    color: "#7c3aed",
    desc: "Government-backed Cyber Essentials Plus certification, including independent technical testing of firewalls, secure configuration, access control, and malware protection.",
  },
  {
    label: "GDPR Article 32",
    sublabel: "Compliant",
    color: "#34d399",
    desc: "Full implementation of Article 32 technical and organisational security measures. Your DPO will find our GDPR documentation pack ready on the first day of your trial.",
  },
];

const auditItems = [
  "Every login attempt — successful or failed — with IP and device fingerprint",
  "All data access events: who viewed, edited, or exported which records and when",
  "Medication administration including witness confirmation and exception notes",
  "Care plan changes, approvals and version history retained for 7 years",
  "Staff permission changes with approver identity and justification",
  "AI decisions, risk score changes, and any automated actions taken",
];

export default function SecurityPage() {
  return (
    <main style={{ background: "#050914", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(52,211,153,0.1), transparent)",
          }}
        />
        <div className="dot-grid absolute inset-0 pointer-events-none opacity-20" />

        <div className="max-w-5xl mx-auto px-6 text-center relative">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
            style={{
              background: "rgba(52,211,153,0.08)",
              border: "1px solid rgba(52,211,153,0.25)",
              color: "#34d399",
            }}
          >
            <ShieldCheck size={14} />
            Enterprise-grade security
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Bank-grade security for the
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #34d399 0%, #60a5fa 50%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              UK&apos;s most sensitive data
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Resident health records, medication histories, financial data. This is among the most
            sensitive personal information in existence. We protect it with the same rigour as a
            Tier 1 financial institution — and we can prove it.
          </p>
        </div>
      </section>

      {/* 6 Security Pillars */}
      <section className="pb-28 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "#34d399" }}
            >
              Security Architecture
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              Six pillars of protection
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map(({ icon: Icon, title, color, desc }, i) => (
              <div
                key={i}
                className="glass glass-hover rounded-3xl p-7"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{
                    background: `${color}15`,
                    border: `1px solid ${color}30`,
                  }}
                >
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance badges */}
      <section className="py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(124,58,237,0.06), transparent)",
          }}
        />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center mb-14">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "#a78bfa" }}
            >
              UK Compliance
            </p>
            <h2 className="text-4xl font-bold text-white">
              Certified where it matters
            </h2>
            <p className="text-gray-400 mt-3 max-w-lg mx-auto">
              The frameworks that UK regulators, commissioners, and CQC inspectors look for — all covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {complianceBadges.map(({ label, sublabel, color, desc }, i) => (
              <div
                key={i}
                className="glass rounded-3xl p-8 text-center"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm mb-5"
                  style={{
                    background: `${color}18`,
                    border: `1px solid ${color}40`,
                    color: color,
                  }}
                >
                  <CheckCircle size={14} /> {label}
                </div>
                <div
                  className="text-xs font-semibold uppercase tracking-widest mb-4"
                  style={{ color }}
                >
                  {sublabel}
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audit trail */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p
                className="text-sm font-semibold uppercase tracking-widest mb-3"
                style={{ color: "#60a5fa" }}
              >
                Audit Trail
              </p>
              <h2 className="text-4xl font-bold text-white mb-5">
                Every action.
                <br />
                Immutably logged.
              </h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                Cura&apos;s tamper-proof audit log records every interaction with the platform.
                When a CQC inspector asks who changed a care plan at 2am, you have the answer
                in seconds — with a full chain of evidence exportable in one click.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Logs are replicated to isolated storage and retained for seven years, exceeding
                NHS and CQC guidance on records retention.
              </p>
            </div>
            <div
              className="glass rounded-3xl p-7"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: "rgba(96,165,250,0.15)",
                    border: "1px solid rgba(96,165,250,0.3)",
                  }}
                >
                  <FileSearch size={16} style={{ color: "#60a5fa" }} />
                </div>
                <span className="text-white font-semibold">What gets logged</span>
              </div>
              <ul className="space-y-3">
                {auditItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                      style={{ background: "#60a5fa" }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Responsible disclosure */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div
            className="glass rounded-3xl p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.25)",
              }}
            >
              <AlertCircle size={22} style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xl font-bold text-white">Responsible Disclosure</h3>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(245,158,11,0.12)",
                    border: "1px solid rgba(245,158,11,0.3)",
                    color: "#f59e0b",
                  }}
                >
                  Security Researchers Welcome
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-4">
                We operate a responsible disclosure programme and work collaboratively with security
                researchers who report potential vulnerabilities. If you believe you&apos;ve found a
                security issue in Cura, please email{" "}
                <a
                  href="mailto:security@cura.com"
                  className="text-violet-400 hover:text-violet-300 transition-colors"
                >
                  security@cura.com
                </a>{" "}
                using our PGP key (available on request).
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                We commit to acknowledging your report within 24 hours, keeping you informed of
                progress, crediting you in our security advisories (if desired), and never taking
                legal action against researchers who act in good faith under this policy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy by design */}
      <section className="py-12 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <div
            className="glass rounded-3xl p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(167,139,250,0.12)",
                border: "1px solid rgba(167,139,250,0.25)",
              }}
            >
              <Eye size={22} style={{ color: "#a78bfa" }} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Privacy by Design</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Privacy is not an afterthought at Cura — it&apos;s embedded into our architecture.
                We conduct Data Protection Impact Assessments for every new feature. Resident data
                is pseudonymised in non-production environments. Staff access is scoped to the
                minimum necessary for their role, reviewed quarterly.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  "Data minimisation",
                  "Purpose limitation",
                  "Storage limitation",
                  "Accuracy controls",
                  "Right to erasure",
                  "Portability exports",
                ].map((item) => (
                  <span
                    key={item}
                    className="text-xs text-gray-300 px-3 py-1.5 rounded-full"
                    style={{ border: "1px solid rgba(167,139,250,0.25)", background: "rgba(167,139,250,0.08)" }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <div
            className="relative rounded-3xl overflow-hidden p-12 text-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(52,211,153,0.12) 0%, rgba(96,165,250,0.1) 50%, rgba(124,58,237,0.15) 100%)",
              border: "1px solid rgba(52,211,153,0.2)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(52,211,153,0.08), transparent)",
              }}
            />
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
                Request our Security Pack
              </h2>
              <p className="text-gray-300 mb-8 max-w-lg mx-auto">
                ISO 27001 certificate, penetration test summary, GDPR documentation, and our
                data processing agreement — all available to prospective customers under NDA.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:security@cura.com"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white glow-button"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
                >
                  Request Security Pack <ArrowRight size={16} />
                </a>
                <a
                  href="/integrations"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-white transition-all hover:bg-white/10"
                  style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  View Integrations
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
