"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";

export default function CTA() {
  return (
    <section id="demo" className="py-24 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden p-12 lg:p-20 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.3) 0%, rgba(59,130,246,0.2) 50%, rgba(6,182,212,0.15) 100%)",
            border: "1px solid rgba(124,58,237,0.3)",
          }}
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(124,58,237,0.2), transparent)",
            }}
          />

          {/* Decorative orbs */}
          <div
            className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-30"
            style={{ background: "#7c3aed" }}
          />
          <div
            className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-30"
            style={{ background: "#3b82f6" }}
          />

          <div className="relative">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
              }}
            >
              <Calendar size={14} />
              30-minute personalised demo — no commitment
            </div>

            <h2 className="text-4xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Time Saved.
              <br />
              <span className="gradient-text">Care Strengthened.</span>
              <br />
              Futures Protected.
            </h2>

            <p className="text-gray-300 text-lg max-w-xl mx-auto mb-10">
              Join over 1,200 care homes already running smarter with Cura.
              See the platform built for your residents, your team, and your peace of mind.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:info@cura.com"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full font-bold text-white text-lg glow-button"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
              >
                Request a Free Demo <ArrowRight size={18} />
              </a>
              <a
                href="tel:+441234567890"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full font-semibold text-white text-lg transition-all hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.25)" }}
              >
                Call Us Today
              </a>
            </div>

            <p className="text-gray-400 text-sm mt-6">
              info@cura.com &nbsp;·&nbsp; Flat 1, 31 Knighton Road, Leicester, LE2 3HL
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
