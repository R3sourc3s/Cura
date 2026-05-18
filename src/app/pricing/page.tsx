"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  CheckCircle,
  XCircle,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Phone,
} from "lucide-react";

const plans = [
  {
    name: "Starter",
    tagline: "For single care homes getting started",
    monthlyPrice: 299,
    color: "#3b82f6",
    popular: false,
    cta: "Start Free Trial",
    features: [
      "Up to 20 residents",
      "Medications / eMAR",
      "Basic care plans",
      "Care notes & handover",
      "Rota management",
      "Task management",
      "Incidents & body map",
      "Email & chat support",
      "Standard compliance reports",
    ],
  },
  {
    name: "Professional",
    tagline: "For homes serious about excellence",
    monthlyPrice: 599,
    color: "#7c3aed",
    popular: true,
    cta: "Start Free Trial",
    features: [
      "Up to 60 residents",
      "All Starter features",
      "AI risk scoring & care plans",
      "Staff & HR module",
      "Training matrix",
      "Visitors & documents",
      "Nutrition & activities",
      "Pharmacy integration",
      "Family Portal",
      "Priority 24/7 support",
      "Advanced analytics",
    ],
  },
  {
    name: "Enterprise",
    tagline: "For groups managing multiple homes",
    monthlyPrice: null,
    color: "#06b6d4",
    popular: false,
    cta: "Talk to Sales",
    features: [
      "Unlimited residents",
      "All Professional features",
      "Multi-site management dashboard",
      "GP & NHS Spine integration",
      "Recruitment & billing modules",
      "Dedicated Customer Success Manager",
      "SLA guarantee",
      "On-premise deployment option",
      "Custom AI model training",
      "API access & custom integrations",
      "Bespoke onboarding & training",
    ],
  },
];

type FeatureRow = { label: string; starter: boolean | string; pro: boolean | string; enterprise: boolean | string };

const comparisonRows: FeatureRow[] = [
  { label: "Residents",              starter: "Up to 20",    pro: "Up to 60",       enterprise: "Unlimited" },
  { label: "Medications / eMAR",     starter: true,          pro: true,             enterprise: true },
  { label: "Care Plans",             starter: "Basic",       pro: "AI-powered",     enterprise: "AI + Custom" },
  { label: "Staff & HR",             starter: false,         pro: true,             enterprise: true },
  { label: "AI Risk Scoring",        starter: false,         pro: true,             enterprise: true },
  { label: "Family Portal",          starter: false,         pro: true,             enterprise: true },
  { label: "Pharmacy Integration",   starter: false,         pro: true,             enterprise: true },
  { label: "GP Integration",         starter: false,         pro: false,            enterprise: true },
  { label: "Multi-site Management",  starter: false,         pro: false,            enterprise: true },
  { label: "API Access",             starter: false,         pro: false,            enterprise: true },
  { label: "On-premise Option",      starter: false,         pro: false,            enterprise: true },
  { label: "Support",                starter: "Email & Chat", pro: "Priority 24/7", enterprise: "Dedicated CSM" },
  { label: "SLA Guarantee",          starter: false,         pro: false,            enterprise: true },
];

const faqs = [
  {
    q: "Do I need a credit card to start a free trial?",
    a: "No. Your 30-day free trial starts immediately with no credit card required. We'll remind you before the trial ends so you can decide whether to continue.",
  },
  {
    q: "Can I change plans later?",
    a: "Yes — you can upgrade or downgrade at any time. Upgrades take effect immediately; downgrades apply at the next billing cycle. There are no penalties or lock-in periods.",
  },
  {
    q: "How does annual billing work?",
    a: "Choosing annual billing saves you 20% compared to the monthly rate. You're billed once upfront for the year. If your care home closes or you need to cancel, we offer a pro-rated refund for unused months.",
  },
  {
    q: "What's included in onboarding?",
    a: "All plans include guided onboarding: data migration assistance, a live walkthrough for your team, and access to our help centre and video library. Enterprise customers receive bespoke onboarding with a dedicated implementation manager.",
  },
  {
    q: "Is the pricing inclusive of VAT?",
    a: "All prices shown are exclusive of VAT. VAT at the standard UK rate (currently 20%) will be added to your invoice. Care homes registered for VAT can reclaim this in the usual way.",
  },
];

function FeatureCell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-gray-300 text-sm">{value}</span>;
  }
  return value ? (
    <CheckCircle size={18} style={{ color: "#34d399" }} className="mx-auto" />
  ) : (
    <XCircle size={18} className="mx-auto text-gray-700" />
  );
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const displayPrice = (plan: typeof plans[0]) => {
    if (!plan.monthlyPrice) return "Custom";
    const price = annual ? Math.round(plan.monthlyPrice * 0.8) : plan.monthlyPrice;
    return `£${price}`;
  };

  return (
    <main style={{ background: "#050914", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,58,237,0.12), transparent)",
          }}
        />
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#a78bfa" }}>
              Pricing
            </p>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight">
              Transparent.
              <br />
              <span className="gradient-text">No surprises.</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-xl mx-auto">
              All plans include a 30-day free trial. No credit card required.
              Cancel or change at any time.
            </p>
          </motion.div>

          {/* Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center gap-4 mt-8"
          >
            <span className={`text-sm font-medium ${!annual ? "text-white" : "text-gray-500"}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className="relative w-14 h-7 rounded-full transition-all duration-300 flex-shrink-0"
              style={{
                background: annual
                  ? "linear-gradient(135deg, #7c3aed, #3b82f6)"
                  : "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <span
                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all duration-300"
                style={{ left: annual ? "calc(100% - 1.5rem)" : "0.25rem" }}
              />
            </button>
            <span className={`text-sm font-medium ${annual ? "text-white" : "text-gray-500"}`}>
              Annual
              <span
                className="ml-2 text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{
                  background: "rgba(52,211,153,0.15)",
                  color: "#34d399",
                  border: "1px solid rgba(52,211,153,0.3)",
                }}
              >
                Save 20%
              </span>
            </span>
          </motion.div>
        </div>
      </section>

      {/* Plan cards */}
      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-7">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative glass rounded-3xl p-8 flex flex-col"
                style={{
                  border: plan.popular
                    ? `1px solid ${plan.color}66`
                    : "1px solid rgba(255,255,255,0.07)",
                  background: plan.popular ? "rgba(124,58,237,0.08)" : undefined,
                }}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${plan.color}, #3b82f6)`,
                    }}
                  >
                    <Zap size={10} /> Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <div className="text-sm font-semibold mb-1" style={{ color: plan.color }}>
                    {plan.name}
                  </div>
                  <div className="text-gray-400 text-sm mb-5">{plan.tagline}</div>
                  <div className="flex items-baseline gap-1">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={`${plan.name}-${annual}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="text-4xl font-extrabold text-white"
                      >
                        {displayPrice(plan)}
                      </motion.span>
                    </AnimatePresence>
                    {plan.monthlyPrice && (
                      <span className="text-gray-400 text-sm">/month</span>
                    )}
                  </div>
                  {annual && plan.monthlyPrice && (
                    <p className="text-xs mt-1" style={{ color: "#34d399" }}>
                      Billed as £{Math.round(plan.monthlyPrice * 0.8 * 12)}/year
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3 text-gray-300 text-sm">
                      <CheckCircle
                        size={14}
                        style={{ color: plan.color, flexShrink: 0, marginTop: "2px" }}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.cta === "Talk to Sales" ? "mailto:info@cura.com" : "#"}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all"
                  style={
                    plan.popular
                      ? {
                          background: `linear-gradient(135deg, ${plan.color}, #3b82f6)`,
                          color: "white",
                          boxShadow: `0 0 30px ${plan.color}44`,
                        }
                      : {
                          border: `1px solid ${plan.color}44`,
                          color: plan.color,
                          background: `${plan.color}11`,
                        }
                  }
                >
                  {plan.cta} <ArrowRight size={14} />
                </a>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-gray-500 text-sm mt-8"
          >
            All prices exclude VAT. Questions?{" "}
            <a href="mailto:info@cura.com" className="text-violet-400 hover:text-violet-300 transition-colors">
              Talk to our team
            </a>
          </motion.p>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-20 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(59,130,246,0.04), transparent)",
          }}
        />
        <div className="max-w-5xl mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
              Full feature comparison
            </h2>
            <p className="text-gray-400">Everything that&apos;s included in each plan</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {/* Table header */}
            <div
              className="grid grid-cols-4 px-6 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="text-gray-500 text-sm font-semibold">Feature</div>
              {plans.map((p) => (
                <div key={p.name} className="text-center text-sm font-semibold" style={{ color: p.color }}>
                  {p.name}
                </div>
              ))}
            </div>

            {/* Rows */}
            {comparisonRows.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-4 px-6 py-3.5 items-center"
                style={{
                  borderBottom:
                    i < comparisonRows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                }}
              >
                <div className="text-gray-300 text-sm">{row.label}</div>
                <div className="flex items-center justify-center">
                  <FeatureCell value={row.starter} />
                </div>
                <div className="flex items-center justify-center">
                  <FeatureCell value={row.pro} />
                </div>
                <div className="flex items-center justify-center">
                  <FeatureCell value={row.enterprise} />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
              Frequently asked questions
            </h2>
            <p className="text-gray-400">
              Can&apos;t find the answer you&apos;re looking for?{" "}
              <a href="mailto:info@cura.com" className="text-violet-400 hover:text-violet-300 transition-colors">
                Ask us directly
              </a>
            </p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-white font-medium pr-4">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div
                        className="px-6 pb-5 text-gray-400 text-sm leading-relaxed"
                        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <div className="pt-4">{faq.a}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden p-12 text-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(59,130,246,0.15) 100%)",
              border: "1px solid rgba(124,58,237,0.25)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(124,58,237,0.15), transparent)",
              }}
            />
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
                Not sure which plan is right for you?
              </h2>
              <p className="text-gray-300 mb-8 max-w-lg mx-auto">
                Talk to our team — we&apos;ll help you find the right plan for your home size,
                CQC requirements, and budget.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:info@cura.com"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white glow-button"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
                >
                  Start Free Trial <ArrowRight size={16} />
                </a>
                <a
                  href="tel:+441234567890"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-white transition-all hover:bg-white/10"
                  style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  <Phone size={16} /> Speak to Sales
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
