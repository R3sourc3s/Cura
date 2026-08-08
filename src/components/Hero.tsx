"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "var(--bg-secondary)", paddingTop: "100px" }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
        {/* Left */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
            style={{
              background: "rgba(13, 148, 136,0.08)",
              border: "1px solid rgba(13, 148, 136,0.25)",
              color: "#0d9488",
            }}
          >
            Made for UK care homes
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lp-serif text-5xl lg:text-6xl font-bold leading-tight mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Your care home,
            <br />
            <span style={{ color: "#0d9488" }}>running exactly</span>
            <br />
            as it should.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg lg:text-xl max-w-xl mb-10 leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Cura connects medication records, care plans, staff rotas, and
            compliance tracking — built around how care homes actually work,
            so your team spends more time with residents and less time on admin.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <a href="#demo" className="lp-btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-lg text-base">
              Request a Free Demo <ArrowRight size={16} />
            </a>
            <a href="#features" className="lp-btn-secondary inline-flex items-center gap-2 px-8 py-4 rounded-lg text-base">
              See how it works
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center gap-3 mt-10 justify-center lg:justify-start"
          >
            {["CQC-aligned", "GDPR compliant", "NHS compatible", "ISO 27001"].map((badge) => (
              <span
                key={badge}
                className="text-xs font-medium px-3 py-1.5 rounded-full"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
              >
                {badge}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Right: photo mosaic */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex-1 hidden lg:grid gap-3"
          style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", height: "520px" }}
        >
          <div className="relative rounded-2xl overflow-hidden row-span-2" style={{ border: "1px solid rgba(13, 148, 136,0.2)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1773227055624-07b515ba87c5?w=600&h=900&fit=crop&crop=center&auto=format&q=80" alt="Carer holding hands with a smiling elderly resident" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,23,42,0.6) 0%, transparent 55%)" }} />
            <span className="absolute bottom-3 left-3 text-xs text-white font-medium">Person-centred care</span>
          </div>

          <div className="relative rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(13, 148, 136,0.15)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1765896387387-0538bc9f997e?w=600&h=400&fit=crop&crop=faces&auto=format&q=80" alt="Care home nurse with elderly resident" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,23,42,0.6) 0%, transparent 55%)" }} />
            <span className="absolute bottom-3 left-3 text-xs text-white font-medium">Dedicated care teams</span>
          </div>

          <div className="lp-card rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-green-600" />
              <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Today at a glance</span>
            </div>
            <div className="grid grid-cols-2 gap-2 flex-1">
              {[
                { label: "Residents", value: "127", color: "#0d9488" },
                { label: "Meds on time", value: "100%", color: "#0d9488" },
                { label: "Staff on shift", value: "48", color: "#10b981" },
                { label: "Tasks done", value: "92%", color: "#10b981" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-2.5" style={{ background: "var(--bg-secondary)" }}>
                  <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{s.label}</div>
                  <div className="text-sm font-bold" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
