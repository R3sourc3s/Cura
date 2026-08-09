import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldCheck, Globe, Lock, Users, Award, Target,
  FileSearch, Eye, AlertCircle, ArrowRight, CheckCircle,
} from "lucide-react";

const pillars = [
  {
    icon: Award,
    title: "ISO 27001 Certified",
    color: "#0d9488",
    desc: "Our information security management system is independently certified to ISO 27001, the internationally recognised gold standard. Annual surveillance audits ensure continuous compliance.",
  },
  {
    icon: Globe,
    title: "UK Data Residency",
    color: "#10b981",
    desc: "All resident data is stored and processed exclusively within UK data centres. We never transfer personal data outside of England and Wales without explicit consent and legal basis.",
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    color: "#0d9488",
    desc: "Data is encrypted at rest using AES-256 and in transit using TLS 1.3. Encryption keys are managed via HSM hardware and rotated automatically every 90 days.",
  },
  {
    icon: Users,
    title: "Role-Based Access Control",
    color: "#10b981",
    desc: "Granular permissions ensure staff only see what they need. 46 distinct roles, from care assistant to registered manager, each with a tailored permission set. Full SSO support including NHS Identity.",
  },
  {
    icon: ShieldCheck,
    title: "SOC 2 Type II",
    color: "#0d9488",
    desc: "Independent SOC 2 Type II audits verify our security, availability, processing integrity, confidentiality, and privacy controls over rolling 12-month periods.",
  },
  {
    icon: Target,
    title: "Penetration Tested Annually",
    color: "#10b981",
    desc: "CREST-accredited penetration testers conduct adversarial testing every year. All critical and high findings are remediated within 30 days. Summaries available to enterprise customers on request.",
  },
];

const complianceBadges = [
  {
    label: "NHS DSP Toolkit",
    sublabel: "Standards Met",
    color: "#0d9488",
    desc: "Cura meets all mandatory requirements of the NHS Data Security and Protection Toolkit, including mandatory training, data flow mapping, and business continuity planning.",
  },
  {
    label: "Cyber Essentials+",
    sublabel: "Certified",
    color: "#10b981",
    desc: "Government-backed Cyber Essentials Plus certification, including independent technical testing of firewalls, secure configuration, access control, and malware protection.",
  },
  {
    label: "GDPR Article 32",
    sublabel: "Compliant",
    color: "#0d9488",
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
    <main id="main-content" style={{ background: "var(--bg-secondary)", minHeight: "100vh" }}>
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
            style={{ background: "rgba(13, 148, 136,0.1)", border: "1px solid rgba(13, 148, 136,0.25)", color: "#0d9488" }}>
            <ShieldCheck size={14} />
            Enterprise-grade security
          </div>
          <h1 className="lp-serif text-5xl lg:text-6xl font-extrabold mb-6 leading-tight" style={{ color: "var(--text-primary)" }}>
            Bank-grade security for the<br />
            <span style={{ color: "#0d9488" }}>UK&apos;s most sensitive data</span>
          </h1>
          <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Resident health records, medication histories, financial data. This is among the most
            sensitive personal information in existence. We protect it with the same rigour as a
            Tier 1 financial institution — and we can prove it.
          </p>
        </div>
      </section>

      <section className="pb-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#0d9488" }}>
              Security Architecture
            </p>
            <h2 className="lp-serif text-4xl lg:text-5xl font-bold" style={{ color: "var(--text-primary)" }}>
              Six pillars of protection
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map(({ icon: Icon, title, color, desc }, i) => (
              <div key={i} className="lp-card rounded-3xl p-7">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20" style={{ background: "var(--bg-card)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#0d9488" }}>
              UK Compliance
            </p>
            <h2 className="lp-serif text-4xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              Certified where it matters
            </h2>
            <p className="max-w-lg mx-auto" style={{ color: "var(--text-muted)" }}>
              The frameworks that UK regulators, commissioners, and CQC inspectors look for — all covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {complianceBadges.map(({ label, sublabel, color, desc }, i) => (
              <div key={i} className="lp-card rounded-3xl p-8 text-center">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm mb-5"
                  style={{ background: `${color}12`, border: `1px solid ${color}30`, color }}>
                  <CheckCircle size={14} /> {label}
                </div>
                <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color }}>
                  {sublabel}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#10b981" }}>
                Audit Trail
              </p>
              <h2 className="lp-serif text-4xl font-bold mb-5" style={{ color: "var(--text-primary)" }}>
                Every action.<br />Immutably logged.
              </h2>
              <p className="leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>
                Cura&apos;s tamper-proof audit log records every interaction with the platform.
                When a CQC inspector asks who changed a care plan at 2am, you have the answer
                in seconds — with a full chain of evidence exportable in one click.
              </p>
              <p className="leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Logs are replicated to isolated storage and retained for seven years, exceeding
                NHS and CQC guidance on records retention.
              </p>
            </div>
            <div className="lp-card rounded-3xl p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(16, 185, 129,0.12)", border: "1px solid rgba(16, 185, 129,0.25)" }}>
                  <FileSearch size={16} style={{ color: "#10b981" }} />
                </div>
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>What gets logged</span>
              </div>
              <ul className="space-y-3">
                {auditItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: "#10b981" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16" style={{ background: "var(--bg-card)" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="lp-card rounded-3xl p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(16, 185, 129,0.1)", border: "1px solid rgba(16, 185, 129,0.25)" }}>
              <AlertCircle size={22} style={{ color: "#10b981" }} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Responsible Disclosure</h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(16, 185, 129,0.1)", border: "1px solid rgba(16, 185, 129,0.25)", color: "#10b981" }}>
                  Security Researchers Welcome
                </span>
              </div>
              <p className="leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
                We operate a responsible disclosure programme and work collaboratively with security
                researchers who report potential vulnerabilities. If you believe you&apos;ve found a
                security issue in Cura, please email{" "}
                <a href="mailto:security@cura.com" style={{ color: "#0d9488" }}>security@cura.com</a>{" "}
                using our PGP key (available on request).
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                We commit to acknowledging your report within 24 hours, keeping you informed of
                progress, crediting you in our security advisories (if desired), and never taking
                legal action against researchers who act in good faith under this policy.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="lp-card rounded-3xl p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(13, 148, 136,0.1)", border: "1px solid rgba(13, 148, 136,0.2)" }}>
              <Eye size={22} style={{ color: "#0d9488" }} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Privacy by Design</h3>
              <p className="leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
                Privacy is not an afterthought at Cura — it&apos;s embedded into our architecture.
                We conduct Data Protection Impact Assessments for every new feature. Resident data
                is pseudonymised in non-production environments. Staff access is scoped to the
                minimum necessary for their role, reviewed quarterly.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Data minimisation","Purpose limitation","Storage limitation","Accuracy controls","Right to erasure","Portability exports"].map((item) => (
                  <span key={item} className="text-xs px-3 py-1.5 rounded-full"
                    style={{ border: "1px solid rgba(13, 148, 136,0.25)", background: "rgba(13, 148, 136,0.07)", color: "#0d9488" }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden p-12 text-center" style={{ background: "#0d9488" }}>
            <h2 className="lp-serif text-3xl lg:text-4xl font-extrabold text-white mb-4">
              Request our Security Pack
            </h2>
            <p className="mb-8 max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.8)" }}>
              ISO 27001 certificate, penetration test summary, GDPR documentation, and our
              data processing agreement — all available to prospective customers under NDA.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:security@cura.com"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold transition-all"
                style={{ background: "#ffffff", color: "#0d9488" }}>
                Request Security Pack <ArrowRight size={16} />
              </a>
              <a href="/integrations"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-white transition-all"
                style={{ border: "1.5px solid rgba(255,255,255,0.35)" }}>
                View Integrations
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
