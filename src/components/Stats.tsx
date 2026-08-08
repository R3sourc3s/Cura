"use client";

import { motion } from "framer-motion";
import { Clock, ShieldCheck, FileCheck } from "lucide-react";

const points = [
  {
    icon: Clock,
    heading: "4 hours back, every day",
    body: "Care managers using Cura spend significantly less time on paperwork, leaving more time on the floor with the people who matter.",
  },
  {
    icon: ShieldCheck,
    heading: "Medication errors caught before they happen",
    body: "The eMAR system prompts staff before each administration window and flags missed or late doses in real time — reducing risk at the point of care.",
  },
  {
    icon: FileCheck,
    heading: "CQC inspection packs in one click",
    body: "Everything an inspector needs — audit trails, care plans, incident reports, staff records — organised and ready to share, whenever you need it.",
  },
];

export default function Stats() {
  return (
    <section className="py-20" style={{ background: "var(--bg-card)" }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="lp-serif text-3xl lg:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Built around what matters most
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
            Not features for their own sake — tools that make a measurable difference to your team and your residents.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {points.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="lp-card rounded-2xl p-8"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: "rgba(13, 148, 136,0.1)" }}>
                <p.icon size={22} style={{ color: "#0d9488" }} />
              </div>
              <h3 className="lp-serif text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>{p.heading}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{p.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
