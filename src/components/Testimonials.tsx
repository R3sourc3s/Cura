"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Before Cura, I was spending the first two hours of every shift chasing paperwork. Now I can actually be present with residents from the moment I arrive.",
    name: "Sandra Okafor",
    role: "Senior Carer",
    home: "Elmbridge Care Home, Surrey",
    initials: "SO",
  },
  {
    quote: "Our last CQC inspection was our best yet. The inspector commented on how well-organised our records were — that's Cura doing its job.",
    name: "David Hargreaves",
    role: "Registered Manager",
    home: "Thornbury House, Bristol",
    initials: "DH",
  },
  {
    quote: "The medication module flagged a potential interaction I'd missed during a busy shift. It's a safety net I didn't know I needed until it caught something.",
    name: "Priya Mehta",
    role: "Lead Nurse",
    home: "Maple Gardens Nursing Home, Leicester",
    initials: "PM",
  },
];

export default function Testimonials() {
  return (
    <section className="py-28" style={{ background: "var(--bg-secondary)" }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <h2 className="lp-serif text-3xl lg:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            From the people who use it every day
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
            Cura is trusted by care teams across the UK — from small family-run homes to large residential facilities.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="lp-card rounded-2xl p-8 flex flex-col"
            >
              <Quote size={20} style={{ color: "#10b981", marginBottom: "16px" }} />
              <p className="text-sm leading-relaxed flex-1 mb-6" style={{ color: "var(--text-secondary)" }}>&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: "rgba(13, 148, 136,0.12)", color: "#0d9488" }}>
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.name}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{t.role}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{t.home}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
