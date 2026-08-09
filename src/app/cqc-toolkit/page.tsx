import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  FileDown,
  Star,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Users,
  Heart,
  BarChart3,
  Award,
  FileText,
  BookOpen,
  MessageSquare,
} from "lucide-react";

const kloes = [
  {
    key: "Safe",
    color: "#ef4444",
    icon: ShieldCheck,
    score: 94,
    desc: "People are protected from abuse and avoidable harm.",
    howCura: [
      "Real-time incident logging with root-cause analysis",
      "Medication error tracking and near-miss reporting",
      "Body map & wound monitoring with photographic evidence",
      "Safeguarding workflows aligned to Care Act 2014",
    ],
  },
  {
    key: "Effective",
    color: "#f59e0b",
    icon: BarChart3,
    score: 91,
    desc: "People's care, treatment and support achieves good outcomes and promotes quality of life.",
    howCura: [
      "Outcome-focused care plans with measurable goals",
      "Automated vitals trend analysis and alerts",
      "MUST screening, nutrition monitoring and fluid balance",
      "GP & community health integration (EMIS, SystmOne)",
    ],
  },
  {
    key: "Caring",
    color: "#ec4899",
    icon: Heart,
    score: 97,
    desc: "Staff involve and treat people with compassion, kindness and respect.",
    howCura: [
      "Personalised resident profiles with life histories",
      "Family portal for transparent communication",
      "Activities and meaningful engagement records",
      "Resident and family feedback capture and reporting",
    ],
  },
  {
    key: "Responsive",
    color: "#14b8a6",
    icon: ClipboardList,
    score: 89,
    desc: "Services meet people's needs and they can access support when needed.",
    howCura: [
      "Digital handover with priority flagging",
      "Appointment and referral tracking",
      "Complaint and compliment management",
      "Person-centred care reviews with review history",
    ],
  },
  {
    key: "Well-Led",
    color: "#7c3aed",
    icon: Users,
    score: 93,
    desc: "The leadership, management and governance of the organisation drives improvement.",
    howCura: [
      "CQC compliance dashboard with live readiness score",
      "Automated audit trails for every action",
      "Management reporting suite with board-ready outputs",
      "Training matrix, supervision records and appraisals",
    ],
  },
];

const downloads = [
  {
    icon: ClipboardList,
    title: "CQC Pre-Inspection Checklist",
    desc: "A comprehensive 80-point checklist to run through before every CQC visit.",
    format: "PDF",
    pages: "12 pages",
    color: "#7c3aed",
  },
  {
    icon: FileText,
    title: "Evidence Pack Template",
    desc: "Ready-to-fill template for organising your evidence across all five KLOEs.",
    format: "DOCX",
    pages: "24 pages",
    color: "#14b8a6",
  },
  {
    icon: BookOpen,
    title: "Staff Interview Preparation Guide",
    desc: "Common CQC inspector questions with guidance on confident, evidence-backed answers.",
    format: "PDF",
    pages: "8 pages",
    color: "#10b981",
  },
  {
    icon: MessageSquare,
    title: "Mock Inspection Questionnaire",
    desc: "Simulate a full CQC inspection with scored self-assessment across all domains.",
    format: "PDF",
    pages: "16 pages",
    color: "#f59e0b",
  },
];

export default function CQCToolkitPage() {
  return (
    <main id="main-content" style={{ background: "#050914", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -5%, rgba(124,58,237,0.2), transparent)",
          }}
        />
        <div className="dot-grid absolute inset-0 opacity-25 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium text-purple-300 mb-6"
            style={{
              border: "1px solid rgba(124,58,237,0.35)",
              background: "rgba(124,58,237,0.1)",
            }}
          >
            <Award size={12} />
            Free Resource
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Your CQC{" "}
            <span className="gradient-text">Inspection Toolkit</span>
          </h1>
          <p className="text-xl text-gray-400 mb-4 max-w-2xl mx-auto">
            Walk into every inspection with confidence.
          </p>
          <p className="text-gray-500 max-w-xl mx-auto mb-10">
            Practical resources, evidence templates, and a real-time compliance dashboard — everything
            a care home manager needs to achieve Outstanding.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#downloads"
              className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold glow-button"
              style={{ background: "linear-gradient(135deg, #7c3aed, #14b8a6)" }}
            >
              Download Free Resources
              <FileDown size={16} />
            </a>
            <a
              href="#toolkit"
              className="flex items-center gap-2 px-8 py-3.5 rounded-full text-gray-300 hover:text-white font-medium transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            >
              See the Dashboard
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* 5 KLOEs */}
      <section className="pb-24 max-w-7xl mx-auto px-6" id="toolkit">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            The Five Key Lines of Enquiry
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Cura maps every feature to the CQC framework so you always know where your evidence
            lives.
          </p>
        </div>

        <div className="space-y-4">
          {kloes.map(({ key, color, icon: Icon, score, desc, howCura }) => (
            <div
              key={key}
              className="glass rounded-2xl p-6 md:p-8"
              style={{ border: `1px solid ${color}25` }}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* KLOE header */}
                <div className="md:w-64 shrink-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${color}22` }}
                    >
                      <Icon size={18} style={{ color }} />
                    </div>
                    <span className="text-lg font-bold text-white">{key}</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>

                {/* How Cura helps */}
                <div className="flex-1">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color }}
                  >
                    How Cura helps
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                    {howCura.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-gray-400">
                        <CheckCircle2
                          size={14}
                          className="shrink-0 mt-0.5"
                          style={{ color }}
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Score */}
                <div className="md:w-28 shrink-0 flex flex-row md:flex-col items-center md:items-end gap-3">
                  <div className="text-right">
                    <div className="text-3xl font-bold" style={{ color }}>
                      {score}
                      <span className="text-lg">%</span>
                    </div>
                    <div className="text-xs text-gray-500">avg score</div>
                  </div>
                  <div
                    className="h-1.5 w-20 md:w-full rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${score}%`, background: color }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live compliance score preview */}
      <section className="pb-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">Live Compliance Score</h2>
          <p className="text-gray-400">
            Cura surfaces your readiness score in real time — no scrambling the night before inspection.
          </p>
        </div>

        <div
          className="glass rounded-3xl p-8 max-w-2xl mx-auto"
          style={{ border: "1px solid rgba(124,58,237,0.2)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Overall CQC Readiness</p>
              <p className="text-4xl font-bold gradient-text">93%</p>
            </div>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(124,58,237,0.15)" }}
            >
              <ShieldCheck size={28} className="text-purple-400" />
            </div>
          </div>

          <div className="space-y-3">
            {kloes.map(({ key, color, score }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-24 shrink-0">{key}</span>
                <div
                  className="flex-1 h-2 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${score}%`, background: color }}
                  />
                </div>
                <span className="text-sm font-semibold w-10 text-right" style={{ color }}>
                  {score}%
                </span>
              </div>
            ))}
          </div>

          <div
            className="mt-6 pt-6 flex items-center justify-between text-xs text-gray-500"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span>Last audit: 14 May 2025</span>
            <span className="flex items-center gap-1 text-green-400">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Live
            </span>
          </div>
        </div>
      </section>

      {/* Downloads */}
      <section className="pb-24 max-w-7xl mx-auto px-6" id="downloads">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">Free Toolkit Downloads</h2>
          <p className="text-gray-400">
            Practical resources used by over 800 care homes across the UK.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {downloads.map(({ icon: Icon, title, desc, format, pages, color }) => (
            <div
              key={title}
              className="glass glass-hover rounded-2xl p-6 flex flex-col"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${color}22`, border: `1px solid ${color}44` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <h3 className="text-white font-semibold text-sm mb-2 leading-snug">{title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed mb-4 flex-1">{desc}</p>
              <div className="flex items-center justify-between mb-4">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ background: `${color}22`, color }}
                >
                  {format}
                </span>
                <span className="text-xs text-gray-600">{pages}</span>
              </div>
              <button
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ background: `${color}33`, border: `1px solid ${color}44` }}
              >
                <FileDown size={14} style={{ color }} />
                <span style={{ color }}>Download Free</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="pb-24 max-w-4xl mx-auto px-6">
        <div
          className="glass rounded-3xl p-10 text-center relative overflow-hidden"
          style={{ border: "1px solid rgba(124,58,237,0.2)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(124,58,237,0.1), transparent)",
            }}
          />
          <div className="relative">
            <div className="flex items-center justify-center gap-0.5 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className="text-yellow-400" fill="#facc15" />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl font-medium text-white mb-6 leading-relaxed">
              &ldquo;We went from Requires Improvement to Good in 6 months with Cura. The compliance
              dashboard made it so easy to see exactly where we needed to focus.&rdquo;
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: "linear-gradient(135deg, #7c3aed, #14b8a6)" }}
              >
                SM
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">Sandra M.</p>
                <p className="text-gray-500 text-xs">Home Manager, Sheffield</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 max-w-7xl mx-auto px-6">
        <div
          className="glass rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
          style={{ border: "1px solid rgba(124,58,237,0.25)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 80% at 50% 100%, rgba(124,58,237,0.12), transparent)",
            }}
          />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to achieve Outstanding?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">
              Join over 800 UK care homes using Cura to maintain continuous CQC readiness — not just
              at inspection time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/contact"
                className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold glow-button"
                style={{ background: "linear-gradient(135deg, #7c3aed, #14b8a6)" }}
              >
                Book a Free Demo
                <ArrowRight size={16} />
              </a>
              <a
                href="/pricing"
                className="flex items-center gap-2 px-8 py-3.5 rounded-full text-gray-300 hover:text-white font-medium transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
