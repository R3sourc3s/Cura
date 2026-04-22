"use client";

import { motion } from "framer-motion";
import { ArrowRight, Shield, Brain, Users, ChevronDown } from "lucide-react";

const floatingCards = [
  {
    icon: Brain,
    title: "AI Care Plans",
    subtitle: "Adapts in real-time",
    color: "#7c3aed",
    delay: 0,
  },
  {
    icon: Shield,
    title: "CQC Ready",
    subtitle: "Always compliant",
    color: "#3b82f6",
    delay: 1.5,
  },
  {
    icon: Users,
    title: "1,200+ Homes",
    subtitle: "Trust Cura",
    color: "#06b6d4",
    delay: 3,
  },
];

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden animated-gradient dot-grid"
      style={{ paddingTop: "100px" }}
    >
      {/* Radial glow blobs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pulse-glow pointer-events-none"
        style={{ background: "rgba(124, 58, 237, 0.2)" }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl pulse-glow pointer-events-none"
        style={{ background: "rgba(59, 130, 246, 0.15)", animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full blur-3xl pulse-glow pointer-events-none"
        style={{ background: "rgba(6, 182, 212, 0.1)", animationDelay: "4s" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
        {/* Left: Text */}
        <div className="flex-1 text-center lg:text-left">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
            style={{
              background: "rgba(124, 58, 237, 0.15)",
              border: "1px solid rgba(124, 58, 237, 0.4)",
              color: "#c084fc",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            UK&apos;s #1 Care Home Management Platform
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6"
          >
            <span className="text-white">One Platform.</span>
            <br />
            <span className="gradient-text">Every Function.</span>
            <br />
            <span className="text-white">Total Clarity.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg lg:text-xl text-gray-400 max-w-xl mb-10 leading-relaxed"
          >
            Cura unifies medication management, AI care planning, HR, eMAR
            oversight, compliance, and staff coordination — all in one seamless
            flow designed for the future of care.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-white text-lg glow-button"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
            >
              Request a Free Demo
              <ArrowRight size={18} />
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-gray-300 text-lg transition-all hover:text-white hover:bg-white/5"
              style={{ border: "1px solid rgba(255,255,255,0.12)" }}
            >
              See How It Works
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex items-center gap-6 mt-10 justify-center lg:justify-start"
          >
            {["ISO 27001", "Cyber Essentials+", "NHS-Aligned", "GDPR"].map((badge) => (
              <span
                key={badge}
                className="text-xs font-medium text-gray-500 px-3 py-1 rounded-full"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {badge}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Right: Floating dashboard mockup */}
        <div className="flex-1 relative flex items-center justify-center min-h-[500px]">
          {/* Central dashboard card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative glass rounded-2xl p-6 w-80"
            style={{ border: "1px solid rgba(124, 58, 237, 0.3)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs text-gray-500 mb-1">Today&apos;s Overview</div>
                <div className="text-white font-bold text-lg">Care Dashboard</div>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(124, 58, 237, 0.3)" }}
              >
                <Brain size={18} style={{ color: "#c084fc" }} />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Residents", value: "127", change: "+3", color: "#7c3aed" },
                { label: "Meds Due", value: "34", change: "On time", color: "#06b6d4" },
                { label: "Staff Active", value: "48", change: "2 shifts", color: "#3b82f6" },
                { label: "Tasks Done", value: "92%", change: "↑ 4%", color: "#10b981" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl p-3"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs mt-1" style={{ color: stat.color }}>{stat.change}</div>
                </div>
              ))}
            </div>

            {/* AI alert */}
            <div
              className="rounded-xl p-3 flex items-start gap-3"
              style={{ background: "rgba(124, 58, 237, 0.1)", border: "1px solid rgba(124, 58, 237, 0.2)" }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "rgba(124, 58, 237, 0.3)" }}
              >
                <Brain size={12} style={{ color: "#c084fc" }} />
              </div>
              <div>
                <div className="text-xs font-semibold text-violet-300 mb-0.5">AI Alert</div>
                <div className="text-xs text-gray-400">
                  Resident 14 care plan updated — review recommended before 3pm shift.
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating mini cards */}
          {floatingCards.map((card, i) => {
            const positions = [
              { top: "5%", right: "-10%" },
              { bottom: "20%", right: "-15%" },
              { top: "40%", left: "-15%" },
            ];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + i * 0.2 }}
                className="absolute glass rounded-xl p-3 w-44 float"
                style={{
                  ...positions[i],
                  border: `1px solid ${card.color}33`,
                  animationDelay: `${card.delay}s`,
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${card.color}22` }}
                  >
                    <card.icon size={14} style={{ color: card.color }} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">{card.title}</div>
                    <div className="text-xs text-gray-500">{card.subtitle}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500"
      >
        <span className="text-xs">Scroll to explore</span>
        <ChevronDown size={16} className="animate-bounce" />
      </motion.div>
    </section>
  );
}
