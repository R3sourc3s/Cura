"use client";

import { motion } from "framer-motion";
import { Bot, MessageSquare, FileText, TrendingUp } from "lucide-react";

const capabilities = [
  {
    icon: MessageSquare,
    title: "Ask in plain English",
    body: "\"How many residents had a fall in the last quarter?\" — Cura finds the answer without you touching a report.",
  },
  {
    icon: FileText,
    title: "Drafts care notes for you",
    body: "Cura suggests care note language based on what was recorded — your team reviews and confirms, never writes from scratch.",
  },
  {
    icon: TrendingUp,
    title: "Spots patterns early",
    body: "Changes in weight, sleep, or mood can signal health decline weeks before it becomes a crisis. Cura flags them so you can act sooner.",
  },
];

export default function AISection() {
  return (
    <section className="py-28" style={{ background: "#ffffff" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: "rgba(184,146,58,0.12)", color: "#8a6a1c", border: "1px solid rgba(184,146,58,0.3)" }}>
              <Bot size={12} /> Built-in intelligence
            </div>
            <h2 className="lp-serif text-3xl lg:text-4xl font-bold mb-6" style={{ color: "#1c1a14" }}>
              A quieter kind of help
            </h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: "#7a7468" }}>
              Cura&apos;s assistant works in the background — surfacing information, drafting documentation, and flagging concerns so your team can focus on care rather than admin.
            </p>
            <p className="text-base leading-relaxed mb-10" style={{ color: "#7a7468" }}>
              It won&apos;t replace your clinical judgement. It just handles the parts that shouldn&apos;t need it.
            </p>
            <a href="#demo" className="lp-btn-primary inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-sm">
              See it in action
            </a>
          </motion.div>

          {/* Right */}
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="space-y-4">
            {/* Chat preview */}
            <div className="lp-card rounded-2xl p-5 mb-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(184,146,58,0.12)" }}>
                  <Bot size={14} style={{ color: "#b8923a" }} />
                </div>
                <span className="text-sm font-medium" style={{ color: "#1c1a14" }}>Cura Assistant</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(45,90,61,0.1)", color: "#2d5a3d" }}>Live</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-end">
                  <span className="text-sm px-4 py-2 rounded-2xl rounded-br-md" style={{ background: "#2d5a3d", color: "#ffffff", maxWidth: "75%" }}>
                    Which residents are overdue a care plan review?
                  </span>
                </div>
                <div className="flex justify-start">
                  <span className="text-sm px-4 py-2 rounded-2xl rounded-bl-md" style={{ background: "#faf7f0", color: "#4a4438", border: "1px solid #dfd8cc", maxWidth: "85%" }}>
                    3 residents are overdue: Margaret H. (14 days), Donald P. (9 days), and Edith K. (7 days). Would you like to schedule the reviews?
                  </span>
                </div>
              </div>
            </div>

            {/* Capability cards */}
            {capabilities.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="lp-card rounded-xl p-4 flex items-start gap-4"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(45,90,61,0.1)" }}>
                  <c.icon size={16} style={{ color: "#2d5a3d" }} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1" style={{ color: "#1c1a14" }}>{c.title}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: "#7a7468" }}>{c.body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
