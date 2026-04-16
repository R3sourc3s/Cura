"use client";

import { motion } from "framer-motion";
import { Shield, Lock, FileCheck, Award } from "lucide-react";

const badges = [
  {
    icon: Award,
    title: "Cyber Essentials+",
    description: "Government-backed certification for cyber security",
    color: "#7c3aed",
  },
  {
    icon: Shield,
    title: "ISO 27001",
    description: "International standard for information security management",
    color: "#3b82f6",
  },
  {
    icon: Lock,
    title: "GDPR Compliant",
    description: "Full compliance with UK & EU data protection regulations",
    color: "#06b6d4",
  },
  {
    icon: FileCheck,
    title: "NHS-Aligned",
    description: "Built to meet NHS Digital data security standards",
    color: "#10b981",
  },
];

export default function Compliance() {
  return (
    <section id="compliance" className="py-24 relative" style={{ background: "rgba(5,9,20,0.8)" }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 40% at 50% 100%, rgba(59,130,246,0.08), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#60a5fa" }}>
            Security & Compliance
          </p>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Enterprise-grade security,
            <br />
            <span className="gradient-text">built for care</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Your residents&apos; data is protected by the same standards trusted by the
            NHS and government agencies.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {badges.map((badge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass glass-hover rounded-2xl p-6 text-center"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: `${badge.color}22`, border: `1px solid ${badge.color}44` }}
              >
                <badge.icon size={24} style={{ color: badge.color }} />
              </div>
              <div className="text-white font-semibold mb-2">{badge.title}</div>
              <div className="text-gray-500 text-xs leading-relaxed">{badge.description}</div>
            </motion.div>
          ))}
        </div>

        {/* Uptime bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8"
          style={{ border: "1px solid rgba(16,185,129,0.2)" }}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-white font-bold text-xl mb-1">99.9% Uptime SLA</div>
              <div className="text-gray-400 text-sm">
                Enterprise reliability with 24/7 monitoring and dedicated support
              </div>
            </div>
            <div className="flex-1 max-w-lg">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>Last 90 days</span>
                <span className="text-green-400 font-semibold">All systems operational</span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 90 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-8 rounded-sm"
                    style={{
                      background: i === 23 || i === 61 ? "rgba(245,158,11,0.6)" : "rgba(16,185,129,0.7)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
