"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Essentials",
    desc: "For homes getting started with digital care records.",
    price: "£4",
    per: "per resident / month",
    cta: "Start free trial",
    ctaHref: "#demo",
    highlight: false,
    features: [
      "Digital care plans & risk assessments",
      "eMAR medication management",
      "Shift rota builder",
      "Document storage",
      "Email support",
    ],
  },
  {
    name: "Professional",
    desc: "For homes that want full compliance and reporting.",
    price: "£7",
    per: "per resident / month",
    cta: "Start free trial",
    ctaHref: "#demo",
    highlight: true,
    tag: "Most popular",
    features: [
      "Everything in Essentials",
      "Live CQC compliance dashboard",
      "Staff HR & recruitment module",
      "Incident & safeguarding reports",
      "Family portal",
      "Phone & chat support",
    ],
  },
  {
    name: "Enterprise",
    desc: "For groups managing multiple homes.",
    price: "Talk to us",
    per: "tailored pricing",
    cta: "Book a call",
    ctaHref: "/contact",
    highlight: false,
    features: [
      "Everything in Professional",
      "Multi-home group dashboard",
      "Single sign-on (SSO)",
      "Dedicated account manager",
      "Custom integrations & API access",
      "SLA-backed support",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-28" style={{ background: "#ffffff" }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <h2 className="lp-serif text-3xl lg:text-4xl font-bold mb-4" style={{ color: "#1c1a14" }}>
            Simple pricing, no surprises
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "#7a7468" }}>
            All plans include a 30-day free trial. No credit card required until you&apos;re ready.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-8 flex flex-col"
              style={{
                background: p.highlight ? "#2d5a3d" : "#ffffff",
                border: p.highlight ? "none" : "1px solid #dfd8cc",
                boxShadow: p.highlight ? "0 8px 40px rgba(45,90,61,0.25)" : "0 1px 3px rgba(28,25,20,0.06)",
              }}
            >
              {p.tag && (
                <span className="text-xs font-bold px-3 py-1 rounded-full self-start mb-4"
                  style={{ background: "rgba(184,146,58,0.2)", color: "#b8923a" }}>
                  {p.tag}
                </span>
              )}
              <h3 className="lp-serif text-xl font-bold mb-1" style={{ color: p.highlight ? "#ffffff" : "#1c1a14" }}>{p.name}</h3>
              <p className="text-sm mb-6" style={{ color: p.highlight ? "rgba(255,255,255,0.7)" : "#7a7468" }}>{p.desc}</p>

              <div className="mb-8">
                <span className="lp-serif text-4xl font-bold" style={{ color: p.highlight ? "#ffffff" : "#1c1a14" }}>{p.price}</span>
                <span className="text-sm ml-2" style={{ color: p.highlight ? "rgba(255,255,255,0.6)" : "#a89f94" }}>{p.per}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm"
                    style={{ color: p.highlight ? "rgba(255,255,255,0.85)" : "#4a4438" }}>
                    <Check size={14} style={{ color: p.highlight ? "#b8923a" : "#2d5a3d", marginTop: "2px", flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={p.ctaHref}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold transition-opacity"
                style={p.highlight
                  ? { background: "#ffffff", color: "#2d5a3d" }
                  : { background: "#2d5a3d", color: "#ffffff" }}
              >
                {p.cta} <ArrowRight size={13} />
              </a>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm mt-8" style={{ color: "#a89f94" }}>
          All prices exclude VAT. Billed monthly or annually (save 20%). Minimum 10 residents.
        </p>
      </div>
    </section>
  );
}
