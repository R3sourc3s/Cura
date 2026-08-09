"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, XCircle, Zap, ArrowRight, ChevronDown, ChevronUp, Phone } from "lucide-react";

const plans = [
  {
    name: "Free",
    tagline: "For very small homes and pilots",
    monthlyPrice: 0,
    color: "#818cf8",
    popular: false,
    cta: "Start for Free",
    features: [
      "Up to 8 residents",
      "Medications / eMAR",
      "Care notes & handover",
      "Incidents",
      "1 admin user",
      "Community & email support",
    ],
  },
  {
    name: "Starter",
    tagline: "For single care homes getting started",
    monthlyPrice: 299,
    color: "var(--text-muted)",
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
    color: "#0d9488",
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
    color: "#10b981",
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

type FeatureRow = { label: string; free: boolean | string; starter: boolean | string; pro: boolean | string; enterprise: boolean | string };

const comparisonRows: FeatureRow[] = [
  { label: "Residents",              free: "Up to 8",     starter: "Up to 20",     pro: "Up to 60",       enterprise: "Unlimited" },
  { label: "Medications / eMAR",     free: true,          starter: true,           pro: true,             enterprise: true },
  { label: "Care Plans",             free: false,         starter: "Basic",        pro: "AI-powered",     enterprise: "AI + Custom" },
  { label: "Staff & HR",             free: false,         starter: false,          pro: true,             enterprise: true },
  { label: "AI Risk Scoring",        free: false,         starter: false,          pro: true,             enterprise: true },
  { label: "Family Portal",          free: false,         starter: false,          pro: true,             enterprise: true },
  { label: "Pharmacy Integration",   free: false,         starter: false,          pro: true,             enterprise: true },
  { label: "GP Integration",         free: false,         starter: false,          pro: false,            enterprise: true },
  { label: "Multi-site Management",  free: false,         starter: false,          pro: false,            enterprise: true },
  { label: "API Access",             free: false,         starter: false,          pro: false,            enterprise: true },
  { label: "On-premise Option",      free: false,         starter: false,          pro: false,            enterprise: true },
  { label: "Contract",               free: "1-month rolling", starter: "1-month rolling", pro: "1-month rolling", enterprise: "Annual/bespoke" },
  { label: "Support",                free: "Community & email", starter: "Email & Chat", pro: "Priority 24/7",  enterprise: "Dedicated CSM" },
  { label: "SLA Guarantee",          free: false,         starter: false,          pro: false,            enterprise: true },
];

const faqs = [
  {
    q: "Is the Free plan really free, forever?",
    a: "Yes. Up to 8 residents and 1 admin user, no time limit, no credit card required. It's there for very small homes and for anyone who wants to properly trial Cura on real data before committing to a paid plan.",
  },
  {
    q: "Do I need a credit card to start a free trial?",
    a: "No. Your 30-day free trial starts immediately with no credit card required. We'll remind you before the trial ends so you can decide whether to continue.",
  },
  {
    q: "Am I locked into a long contract?",
    a: "No. Free, Starter, and Professional are all 1-month rolling contracts — cancel any time with no penalty. Choosing annual billing is optional and just saves you 20%; it's never required.",
  },
  {
    q: "Can I change plans later?",
    a: "Yes — you can upgrade or downgrade at any time, including from Free to a paid plan as you grow past 8 residents. Upgrades take effect immediately; downgrades apply at the next billing cycle.",
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
    return <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{value}</span>;
  }
  return value ? (
    <CheckCircle size={18} style={{ color: "#0d9488" }} className="mx-auto" />
  ) : (
    <XCircle size={18} className="mx-auto" style={{ color: "var(--border)" }} />
  );
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const displayPrice = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === null) return "Custom";
    if (plan.monthlyPrice === 0) return "£0";
    const price = annual ? Math.round(plan.monthlyPrice * 0.8) : plan.monthlyPrice;
    return `£${price}`;
  };

  return (
    <main id="main-content" style={{ background: "var(--bg-secondary)", minHeight: "100vh" }}>
      <Navbar />

      <section className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#0d9488" }}>Pricing</p>
            <h1 className="lp-serif text-5xl lg:text-6xl font-extrabold mb-5 leading-tight" style={{ color: "var(--text-primary)" }}>
              Transparent.<br />
              <span style={{ color: "#0d9488" }}>No surprises.</span>
            </h1>
            <p className="text-xl max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
              A genuinely free tier for small homes, a 30-day free trial on everything else, and 1-month rolling contracts across the board — no annual lock-in required.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-medium`} style={{ color: !annual ? "var(--text-primary)" : "var(--text-muted)" }}>Monthly</span>
            <button onClick={() => setAnnual(!annual)}
              className="relative w-14 h-7 rounded-full transition-all duration-300 flex-shrink-0"
              style={{ background: annual ? "#0d9488" : "var(--border)", border: "1px solid #c8bfb0" }}>
              <span className="absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all duration-300"
                style={{ left: annual ? "calc(100% - 1.5rem)" : "0.25rem" }} />
            </button>
            <span className={`text-sm font-medium`} style={{ color: annual ? "var(--text-primary)" : "var(--text-muted)" }}>
              Annual
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: "rgba(13, 148, 136,0.1)", color: "#0d9488", border: "1px solid rgba(13, 148, 136,0.25)" }}>
                Save 20%
              </span>
            </span>
          </motion.div>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="relative rounded-3xl p-8 flex flex-col"
                style={{
                  background: plan.popular ? "#0d9488" : "var(--bg-card)",
                  border: plan.popular ? "none" : "1px solid var(--border)",
                  boxShadow: plan.popular ? "0 8px 32px rgba(13, 148, 136,0.2)" : "0 2px 8px rgba(15,23,42,0.06)",
                }}>
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold"
                    style={{ background: "#10b981", color: "#ffffff" }}>
                    <Zap size={10} /> Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <div className="text-sm font-semibold mb-1" style={{ color: plan.popular ? "rgba(255,255,255,0.7)" : plan.color }}>{plan.name}</div>
                  <div className="text-sm mb-5" style={{ color: plan.popular ? "rgba(255,255,255,0.65)" : "var(--text-muted)" }}>{plan.tagline}</div>
                  <div className="flex items-baseline gap-1">
                    <AnimatePresence mode="wait">
                      <motion.span key={`${plan.name}-${annual}`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}
                        className="lp-serif text-4xl font-extrabold" style={{ color: plan.popular ? "#ffffff" : "var(--text-primary)" }}>
                        {displayPrice(plan)}
                      </motion.span>
                    </AnimatePresence>
                    {plan.monthlyPrice && (
                      <span className="text-sm" style={{ color: plan.popular ? "rgba(255,255,255,0.6)" : "var(--text-muted)" }}>/month</span>
                    )}
                  </div>
                  {annual && plan.monthlyPrice && (
                    <p className="text-xs mt-1" style={{ color: plan.popular ? "rgba(255,255,255,0.7)" : "#10b981" }}>
                      Billed as £{Math.round(plan.monthlyPrice * 0.8 * 12)}/year
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm"
                      style={{ color: plan.popular ? "rgba(255,255,255,0.85)" : "var(--text-secondary)" }}>
                      <CheckCircle size={14} style={{ color: plan.popular ? "rgba(255,255,255,0.6)" : plan.color, flexShrink: 0, marginTop: "2px" }} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a href={plan.cta === "Talk to Sales" ? "mailto:info@cura.com" : "#"}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all"
                  style={plan.popular
                    ? { background: "#ffffff", color: "#0d9488" }
                    : { border: `1.5px solid ${plan.color}40`, color: plan.color, background: `${plan.color}08` }}>
                  {plan.cta} <ArrowRight size={14} />
                </a>
              </motion.div>
            ))}
          </div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-center text-sm mt-8" style={{ color: "var(--text-muted)" }}>
            All prices exclude VAT. Questions?{" "}
            <a href="mailto:info@cura.com" style={{ color: "#0d9488" }}>Talk to our team</a>
          </motion.p>
        </div>
      </section>

      <section className="py-20" style={{ background: "var(--bg-card)" }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="lp-serif text-3xl lg:text-4xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Full feature comparison</h2>
            <p style={{ color: "var(--text-muted)" }}>Everything that&apos;s included in each plan</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-3xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <div className="grid grid-cols-5 px-6 py-4" style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
              <div className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>Feature</div>
              {plans.map((p) => (
                <div key={p.name} className="text-center text-sm font-semibold" style={{ color: p.color }}>{p.name}</div>
              ))}
            </div>
            {comparisonRows.map((row, i) => (
              <div key={i} className="grid grid-cols-5 px-6 py-3.5 items-center"
                style={{ borderBottom: i < comparisonRows.length - 1 ? "1px solid var(--border)" : "none", background: i % 2 === 0 ? "#ffffff" : "var(--bg-secondary)" }}>
                <div className="text-sm" style={{ color: "var(--text-secondary)" }}>{row.label}</div>
                <div className="flex items-center justify-center"><FeatureCell value={row.free} /></div>
                <div className="flex items-center justify-center"><FeatureCell value={row.starter} /></div>
                <div className="flex items-center justify-center"><FeatureCell value={row.pro} /></div>
                <div className="flex items-center justify-center"><FeatureCell value={row.enterprise} /></div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="lp-serif text-3xl lg:text-4xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Frequently asked questions</h2>
            <p style={{ color: "var(--text-muted)" }}>
              Can&apos;t find the answer you&apos;re looking for?{" "}
              <a href="mailto:info@cura.com" style={{ color: "#0d9488" }}>Ask us directly</a>
            </p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05 }} className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left">
                  <span className="font-medium pr-4" style={{ color: "var(--text-primary)" }}>{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp size={18} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                    : <ChevronDown size={18} style={{ color: "var(--text-muted)", flexShrink: 0 }} />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                      <div className="px-6 pb-5 text-sm leading-relaxed" style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border)" }}>
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

      <section className="py-16 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden p-12 text-center" style={{ background: "#0d9488" }}>
            <h2 className="lp-serif text-3xl lg:text-4xl font-extrabold text-white mb-4">
              Not sure which plan is right for you?
            </h2>
            <p className="mb-8 max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.8)" }}>
              Talk to our team — we&apos;ll help you find the right plan for your home size, CQC requirements, and budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:info@cura.com"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold transition-all"
                style={{ background: "#ffffff", color: "#0d9488" }}>
                Start Free Trial <ArrowRight size={16} />
              </a>
              <a href="tel:+441234567890"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-white transition-all"
                style={{ border: "1.5px solid rgba(255,255,255,0.35)" }}>
                <Phone size={16} /> Speak to Sales
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
