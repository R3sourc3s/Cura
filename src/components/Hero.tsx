"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";

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

        {/* Right: Care home photo mosaic */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex-1 hidden lg:grid gap-3"
          style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", height: "520px" }}
        >
          {/* Top-left large: carer holding elderly resident's hands in care home lounge */}
          <div
            className="relative rounded-2xl overflow-hidden row-span-2"
            style={{ border: "1px solid rgba(124,58,237,0.2)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1773227055624-07b515ba87c5?w=600&h=900&fit=crop&crop=center&auto=format&q=80"
              alt="Carer holding hands with a smiling elderly resident in a care home lounge"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(5,9,20,0.6) 0%, transparent 60%)" }} />
            <span className="absolute bottom-3 left-3 text-xs text-gray-300 font-medium">Person-centred care</span>
          </div>

          {/* Top-right: carer in uniform smiling with elderly resident */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(59,130,246,0.2)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1765896387387-0538bc9f997e?w=600&h=400&fit=crop&crop=faces&auto=format&q=80"
              alt="Care home nurse in blue scrubs smiling warmly with an elderly resident"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(5,9,20,0.6) 0%, transparent 60%)" }} />
            <span className="absolute bottom-3 left-3 text-xs text-gray-300 font-medium">Dedicated care teams</span>
          </div>

          {/* Bottom-right: live dashboard glass card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="rounded-2xl p-4 flex flex-col justify-between"
            style={{
              background: "rgba(5,9,20,0.75)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(124,58,237,0.35)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-400 font-medium">Live Dashboard</span>
            </div>
            <div className="grid grid-cols-2 gap-2 flex-1">
              {[
                { label: "Residents", value: "127", color: "#7c3aed" },
                { label: "Meds", value: "On Time", color: "#10b981" },
                { label: "Staff", value: "48 active", color: "#3b82f6" },
                { label: "Tasks", value: "92% done", color: "#06b6d4" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="text-xs text-gray-500 mb-1">{s.label}</div>
                  <div className="text-sm font-bold" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
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
