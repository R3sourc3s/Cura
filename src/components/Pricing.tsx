"use client";

import { motion } from "framer-motion";
import { CheckCircle, Zap, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Starter",
    tagline: "For single homes getting started",
    price: "£299",
    per: "/month",
    color: "#3b82f6",
    features: [
      "Up to 50 residents",
      "Medication management (eMAR)",
      "Basic care planning",
      "Shift & rota management",
      "Task management",
      "Email & chat support",
      "Standard compliance reports",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    tagline: "For homes serious about excellence",
    price: "£599",
    per: "/month",
    color: "#7c3aed",
    features: [
      "Unlimited residents",
      "Full eMAR with pharmacy sync",
      "AI-powered care planning",
      "HR & recruitment module",
      "Advanced analytics dashboard",
      "CQC compliance autopilot",
      "Priority 24/7 support",
      "Staff mobile app",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    tagline: "For groups managing multiple homes",
    price: "Custom",
    per: "",
    color: "#06b6d4",
    features: [
      "Everything in Professional",
      "Multi-site management",
      "Custom AI model training",
      "Dedicated account manager",
      "SLA guarantee",
      "White-label option",
      "API access & integrations",
      "Bespoke onboarding",
    ],
    cta: "Talk to Sales",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-32 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(124,58,237,0.07), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#a78bfa" }}>
            Simple Pricing
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Transparent. No surprises.
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            All plans include a 30-day free trial. No credit card required.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
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
                  style={{ background: `linear-gradient(135deg, ${plan.color}, #3b82f6)` }}
                >
                  <Zap size={10} /> Most Popular
                </div>
              )}

              {/* Header */}
              <div className="mb-8">
                <div
                  className="text-sm font-semibold mb-1"
                  style={{ color: plan.color }}
                >
                  {plan.name}
                </div>
                <div className="text-white text-sm mb-6">{plan.tagline}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-gray-400 text-sm">{plan.per}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-gray-300 text-sm">
                    <CheckCircle size={14} style={{ color: plan.color, flexShrink: 0 }} />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="#demo"
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
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-gray-500 text-sm mt-10"
        >
          All prices exclude VAT. Billed annually for best value — monthly options available.
          <br />
          Questions?{" "}
          <a href="mailto:info@cura.com" className="text-violet-400 hover:text-violet-300 transition-colors">
            Talk to our team
          </a>
        </motion.p>
      </div>
    </section>
  );
}
