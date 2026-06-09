"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, XCircle, Zap, ArrowRight, ChevronDown, ChevronUp, Phone } from "lucide-react";

const plans = [
  {
    name: "Starter",
    tagline: "For single care homes getting started",
    monthlyPrice: 299,
    color: "#7a7468",
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
    color: "#2d5a3d",
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
    color: "#b8923a",
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
  { label: "Residents",              starter: "Up to 20",     pro: "Up to 60",       enterprise: "Unlimited" },
  { label: "Medications / eMAR",     starter: true,           pro: true,             enterprise: true },
  { label: "Care Plans",             starter: "Basic",        pro: "AI-powered",     enterprise: "AI + Custom" },
  { label: "Staff & HR",             starter: false,          pro: true,             enterprise: true },
  { label: "AI Risk Scoring",        starter: false,          pro: true,             enterprise: true },
  { label: "Family Portal",          starter: false,          pro: true,             enterprise: true },
  { label: "Pharmacy Integration",   starter: false,          pro: true,             enterprise: true },
  { label: "GP Integration",         starter: false,          pro: false,            enterprise: true },
  { label: "Multi-site Management",  starter: false,          pro: false,            enterprise: true },
  { label: "API Access",             starter: false,          pro: false,            enterprise: true },
  { label: "On-premise Option",      starter: false,          pro: false,            enterprise: true },
  { label: "Support",                starter: "Email & Chat", pro: "Priority 24/7",  enterprise: "Dedicated CSM" },
  { label: "SLA Guarantee",          starter: false,          pro: false,            enterprise: true },
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
    return <span className="text-sm" style={{ color: "#4a4438" }}>{value}</span>;
  }
  return value ? (
    <CheckCircle size={18} style={{ color: "#2d5a3d" }} className="mx-auto" />
  ) : (
    <XCircle size={18} className="mx-auto" style={{ color: "#dfd8cc" }} />
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
    <main style={{ background: "#faf7f0", minHeight: "100vh" }}>
      <Navbar />

      <section className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#2d5a3d" }}>Pricing</p>
            <h1 className="lp-serif text-5xl lg:text-6xl font-extrabold mb-5 leading-tight" style={{ color: "#1c1a14" }}>
              Transparent.<br />
              <span style={{ color: "#2d5a3d" }}>No surprises.</span>
            </h1>
            <p className="text-xl max-w-xl mx-auto" style={{ color: "#7a7468" }}>
              All plans include a 30-day free trial. No credit card required. Cancel or change at any time.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-medium`} style={{ color: !annual ? "#1c1a14" : "#7a7468" }}>Monthly</span>
            <button onClick={() => setAnnual(!annual)}
              className="relative w-14 h-7 rounded-full transition-all duration-300 flex-shrink-0"
              style={{ background: annual ? "#2d5a3d" : "#dfd8cc", border: "1px solid #c8bfb0" }}>
              <span className="absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all duration-300"
                style={{ left: annual ? "calc(100% - 1.5rem)" : "0.25rem" }} />
            </button>
            <span className={`text-sm font-medium`} style={{ color: annual ? "#1c1a14" : "#7a7468" }}>
              Annual
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: "rgba(45,90,61,0.1)", color: "#2d5a3d", border: "1px solid rgba(45,90,61,0.25)" }}>
                Save 20%
              </span>
            </span>
          </motion.div>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-7">
            {plans.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="relative rounded-3xl p-8 flex flex-col"
                style={{
                  background: plan.popular ? "#2d5a3d" : "#ffffff",
                  border: plan.popular ? "none" : "1px solid #dfd8cc",
                  boxShadow: plan.popular ? "0 8px 32px rgba(45,90,61,0.2)" : "0 2px 8px rgba(28,26,20,0.06)",
                }}>
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold"
                    style={{ background: "#b8923a", color: "#ffffff" }}>
                    <Zap size={10} /> Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <div className="text-sm font-semibold mb-1" style={{ color: plan.popular ? "rgba(255,255,255,0.7)" : plan.color }}>{plan.name}</div>
                  <div className="text-sm mb-5" style={{ color: plan.popular ? "rgba(255,255,255,0.65)" : "#7a7468" }}>{plan.tagline}</div>
                  <div className="flex items-baseline gap-1">
                    <AnimatePresence mode="wait">
                      <motion.span key={`${plan.name}-${annual}`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}
                        className="lp-serif text-4xl font-extrabold" style={{ color: plan.popular ? "#ffffff" : "#1c1a14" }}>
                        {displayPrice(plan)}
                      </motion.span>
                    </AnimatePresence>
                    {plan.monthlyPrice && (
                      <span className="text-sm" style={{ color: plan.popular ? "rgba(255,255,255,0.6)" : "#7a7468" }}>/month</span>
                    )}
                  </div>
                  {annual && plan.monthlyPrice && (
                    <p className="text-xs mt-1" style={{ color: plan.popular ? "rgba(255,255,255,0.7)" : "#b8923a" }}>
                      Billed as £{Math.round(plan.monthlyPrice * 0.8 * 12)}/year
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm"
                      style={{ color: plan.popular ? "rgba(255,255,255,0.85)" : "#4a4438" }}>
                      <CheckCircle size={14} style={{ color: plan.popular ? "rgba(255,255,255,0.6)" : plan.color, flexShrink: 0, marginTop: "2px" }} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a href={plan.cta === "Talk to Sales" ? "mailto:info@cura.com" : "#"}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all"
                  style={plan.popular
                    ? { background: "#ffffff", color: "#2d5a3d" }
                    : { border: `1.5px solid ${plan.color}40`, color: plan.color, background: `${plan.color}08` }}>
                  {plan.cta} <ArrowRight size={14} />
                </a>
              </motion.div>
            ))}
          </div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-center text-sm mt-8" style={{ color: "#7a7468" }}>
            All prices exclude VAT. Questions?{" "}
            <a href="mailto:info@cura.com" style={{ color: "#2d5a3d" }}>Talk to our team</a>
          </motion.p>
        </div>
      </section>

      <section className="py-20" style={{ background: "#ffffff" }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="lp-serif text-3xl lg:text-4xl font-bold mb-3" style={{ color: "#1c1a14" }}>Full feature comparison</h2>
            <p style={{ color: "#7a7468" }}>Everything that&apos;s included in each plan</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-3xl overflow-hidden" style={{ border: "1px solid #dfd8cc" }}>
            <div className="grid grid-cols-4 px-6 py-4" style={{ borderBottom: "1px solid #dfd8cc", background: "#f3ede1" }}>
              <div className="text-sm font-semibold" style={{ color: "#7a7468" }}>Feature</div>
              {plans.map((p) => (
                <div key={p.name} className="text-center text-sm font-semibold" style={{ color: p.color }}>{p.name}</div>
              ))}
            </div>
            {comparisonRows.map((row, i) => (
              <div key={i} className="grid grid-cols-4 px-6 py-3.5 items-center"
                style={{ borderBottom: i < comparisonRows.length - 1 ? "1px solid #dfd8cc" : "none", background: i % 2 === 0 ? "#ffffff" : "#faf7f0" }}>
                <div className="text-sm" style={{ color: "#4a4438" }}>{row.label}</div>
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
            <h2 className="lp-serif text-3xl lg:text-4xl font-bold mb-3" style={{ color: "#1c1a14" }}>Frequently asked questions</h2>
            <p style={{ color: "#7a7468" }}>
              Can&apos;t find the answer you&apos;re looking for?{" "}
              <a href="mailto:info@cura.com" style={{ color: "#2d5a3d" }}>Ask us directly</a>
            </p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05 }} className="rounded-2xl overflow-hidden" style={{ border: "1px solid #dfd8cc", background: "#ffffff" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left">
                  <span className="font-medium pr-4" style={{ color: "#1c1a14" }}>{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp size={18} style={{ color: "#7a7468", flexShrink: 0 }} />
                    : <ChevronDown size={18} style={{ color: "#7a7468", flexShrink: 0 }} />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                      <div className="px-6 pb-5 text-sm leading-relaxed" style={{ color: "#7a7468", borderTop: "1px solid #dfd8cc" }}>
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
            className="relative rounded-3xl overflow-hidden p-12 text-center" style={{ background: "#2d5a3d" }}>
            <h2 className="lp-serif text-3xl lg:text-4xl font-extrabold text-white mb-4">
              Not sure which plan is right for you?
            </h2>
            <p className="mb-8 max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.8)" }}>
              Talk to our team — we&apos;ll help you find the right plan for your home size, CQC requirements, and budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:info@cura.com"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold transition-all"
                style={{ background: "#ffffff", color: "#2d5a3d" }}>
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
