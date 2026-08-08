"use client";

import { motion } from "framer-motion";
import { Shield, Lock, FileCheck, Award } from "lucide-react";

const badges = [
  {
    icon: Award,
    title: "Cyber Essentials+",
    description: "Government-backed certification for cyber security",
  },
  {
    icon: Shield,
    title: "ISO 27001",
    description: "International standard for information security management",
  },
  {
    icon: Lock,
    title: "GDPR Compliant",
    description: "Full compliance with UK & EU data protection regulations",
  },
  {
    icon: FileCheck,
    title: "NHS-Compatible",
    description: "Built to meet NHS Digital data security standards",
  },
];

export default function Compliance() {
  return (
    <section id="compliance" className="py-24" style={{ background: "var(--bg-secondary)" }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="lp-serif text-3xl lg:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Security you can trust with resident data
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
            Your residents&apos; data is protected by the same standards trusted by the NHS and government agencies.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {badges.map((badge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="lp-card rounded-2xl p-6 text-center"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(13, 148, 136,0.1)" }}
              >
                <badge.icon size={22} style={{ color: "#0d9488" }} />
              </div>
              <div className="font-semibold mb-2 text-sm" style={{ color: "var(--text-primary)" }}>{badge.title}</div>
              <div className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{badge.description}</div>
            </motion.div>
          ))}
        </div>

        {/* Uptime bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="lp-card rounded-2xl p-7"
          style={{ borderColor: "rgba(13, 148, 136,0.2)" }}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="font-bold text-lg mb-1" style={{ color: "var(--text-primary)" }}>Hosted in the UK</div>
              <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                Data stored in UK data centres, 24/7 monitoring, dedicated support included
              </div>
            </div>
            <div className="flex-1 max-w-lg w-full">
              <div className="flex items-center justify-between text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                <span>System status — last 90 days</span>
                <span className="font-semibold" style={{ color: "#0d9488" }}>All systems operational</span>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 90 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-7 rounded-sm"
                    style={{
                      background: i === 23 || i === 61
                        ? "rgba(16, 185, 129,0.45)"
                        : "rgba(13, 148, 136,0.45)",
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
