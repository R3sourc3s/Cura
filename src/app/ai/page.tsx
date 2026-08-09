"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  AlertCircle, Brain, FileText, Search, ArrowRight, Database, Sparkles, TrendingUp, ShieldCheck,
} from "lucide-react";

const capabilities = [
  {
    icon: AlertCircle,
    title: "AI Risk Scoring",
    color: "#10b981",
    desc: "Cura's predictive engine analyses vitals, care notes, medication changes and incident history to calculate a real-time risk score for every resident. Fall risks, pressure sore deterioration, and behavioural changes are flagged hours — not days — before they escalate. Your team gets a prioritised morning brief, not a wall of data.",
  },
  {
    icon: Brain,
    title: "AI Care Plans",
    color: "#0d9488",
    desc: "Care plans that write themselves — almost. Cura drafts person-centred care plans using structured assessment data, resident preferences, and clinical guidance. Staff review and approve, meaning plans are always up to date without consuming hours of nursing time. AI ensures no standard is missed, no outcome forgotten.",
  },
  {
    icon: FileText,
    title: "Compliance Reports",
    color: "#0d9488",
    desc: "CQC inspections no longer need to be a scramble. Cura's AI assembles evidence packs, flags gaps against the Key Lines of Enquiry, and generates draft narrative summaries across Safe, Effective, Caring, Responsive, and Well-Led. Inspectors receive thorough, consistent evidence — and your team stays calm.",
  },
  {
    icon: Search,
    title: "Natural Language Search",
    color: "#10b981",
    desc: "Ask Cura anything in plain English. \"Which residents haven't had their pain assessed this week?\" or \"Show me all falls involving residents on anticoagulants in the last 90 days.\" No filters, no SQL, no training required. The AI understands clinical context and surfaces the exact records your team needs.",
  },
];

const steps = [
  {
    num: "01",
    icon: Database,
    title: "Connect your data",
    desc: "Cura integrates with your existing systems — pharmacy, GP, HR, and finance. All data flows into a unified, encrypted care record. Nothing to migrate manually.",
  },
  {
    num: "02",
    icon: Sparkles,
    title: "AI analyses patterns",
    desc: "Our models, trained on UK care home data and clinical guidelines, continuously monitor every resident record. Anomalies, trends, and risks are identified automatically, 24/7.",
  },
  {
    num: "03",
    icon: TrendingUp,
    title: "Get actionable insights",
    desc: "Insights surface as prioritised tasks in your team's workflow — not buried in dashboards. The right person gets the right alert at the right time, with one-tap evidence attached.",
  },
];

export default function AIPage() {
  return (
    <main id="main-content" style={{ background: "var(--bg-secondary)", minHeight: "100vh" }}>
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
              style={{ background: "rgba(13, 148, 136,0.1)", border: "1px solid rgba(13, 148, 136,0.25)", color: "#0d9488" }}>
              <Sparkles size={14} /> Cura AI Platform
            </div>
            <h1 className="lp-serif text-5xl lg:text-6xl font-extrabold mb-6 leading-tight" style={{ color: "var(--text-primary)" }}>
              AI that thinks like<br />
              <span style={{ color: "#0d9488" }}>a senior carer</span>
            </h1>
            <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Not generic AI bolted onto a care system. Cura AI is trained on UK care home workflows,
              CQC frameworks, and real clinical patterns — so every insight it surfaces is relevant,
              contextual, and actionable.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <a href="mailto:info@cura.com"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white"
              style={{ background: "#0d9488" }}>
              See AI in Action <ArrowRight size={16} />
            </a>
            <a href="/features"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold transition-all"
              style={{ border: "1.5px solid var(--border)", color: "var(--text-primary)" }}>
              Explore All Features
            </a>
          </motion.div>
        </div>
      </section>

      <section className="pb-28" style={{ background: "var(--bg-card)" }}>
        <div className="max-w-6xl mx-auto px-6 pt-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#0d9488" }}>Core AI Capabilities</p>
            <h2 className="lp-serif text-4xl lg:text-5xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Four ways AI transforms care delivery
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
              Every AI feature is designed to reduce admin burden and improve resident outcomes — not add complexity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map(({ icon: Icon, title, color, desc }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }} className="lp-card rounded-3xl p-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>{title}</h3>
                <p className="leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#10b981" }}>How It Works</p>
            <h2 className="lp-serif text-4xl lg:text-5xl font-bold" style={{ color: "var(--text-primary)" }}>
              From data to decisions in seconds
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ num, icon: Icon, title, desc }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.15 }} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 h-px pointer-events-none"
                    style={{ background: "linear-gradient(90deg, var(--border), transparent)", width: "calc(100% - 3rem)", left: "calc(100% + 1.5rem)", top: "1.5rem" }} />
                )}
                <div className="lp-card rounded-3xl p-8 h-full">
                  <div className="lp-serif text-5xl font-black mb-5 leading-none" style={{ color: "var(--border)" }}>{num}</div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: "rgba(13, 148, 136,0.1)", border: "1px solid rgba(13, 148, 136,0.2)" }}>
                    <Icon size={18} style={{ color: "#0d9488" }} />
                  </div>
                  <h3 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12" style={{ background: "var(--bg-card)" }}>
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center gap-6 lp-card rounded-2xl p-6 sm:p-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(13, 148, 136,0.1)", border: "1px solid rgba(13, 148, 136,0.2)" }}>
              <ShieldCheck size={22} style={{ color: "#0d9488" }} />
            </div>
            <div>
              <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                All AI processing is GDPR-compliant, UK data residency
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Cura AI runs entirely within UK data centres. No resident data is ever sent to
                third-party AI providers. Our models are trained on anonymised, consented datasets
                and undergo annual penetration testing. Full audit logs of every AI decision are
                available to your Data Protection Officer on request.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden p-12 lg:p-16 text-center" style={{ background: "#0d9488" }}>
            <h2 className="lp-serif text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              See Cura AI live in<br />
              <span style={{ color: "#5eead4" }}>your own care home</span>
            </h2>
            <p className="text-lg mb-8 max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.8)" }}>
              Book a personalised demo and we&apos;ll show you exactly how Cura AI applies to
              your residents, your team structure, and your CQC requirements.
            </p>
            <a href="mailto:info@cura.com"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full font-bold text-lg transition-all"
              style={{ background: "#ffffff", color: "#0d9488" }}>
              Book a Free Demo <ArrowRight size={18} />
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
