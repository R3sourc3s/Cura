"use client";

import { motion } from "framer-motion";
import { Brain, Sparkles, TrendingUp, AlertTriangle, ChevronRight } from "lucide-react";

const capabilities = [
  {
    icon: TrendingUp,
    title: "Predictive Risk Scoring",
    description:
      "Analyses hundreds of data points across each resident to surface deterioration risks before they become incidents.",
    color: "#7c3aed",
  },
  {
    icon: Brain,
    title: "Adaptive Care Planning",
    description:
      "Plans that evolve with your residents. Cura AI rewrites sections of the care plan as conditions change — no manual updates needed.",
    color: "#3b82f6",
  },
  {
    icon: AlertTriangle,
    title: "Critical Moment Prompts",
    description:
      "Staff receive intelligent nudges at the right time — before a medication window closes, when a care plan review is overdue, or when a resident shows unusual patterns.",
    color: "#f59e0b",
  },
  {
    icon: Sparkles,
    title: "Compliance Autopilot",
    description:
      "AI continuously maps your operations to CQC standards, generating evidence automatically and flagging gaps weeks before they become inspection findings.",
    color: "#10b981",
  },
];

const chatMessages = [
  { role: "user", text: "Which residents have an elevated fall risk this week?" },
  {
    role: "ai",
    text: "3 residents flagged: Agnes T. (score 87), John B. (score 79), Mary S. (score 74). All have updated care plans with new precautions. Want me to schedule a team briefing?",
  },
  { role: "user", text: "Yes — book it for the handover at 7am tomorrow." },
  {
    role: "ai",
    text: "Done. 7am briefing scheduled. Relevant care plans and risk summaries will be pre-loaded for the team. Anything else?",
  },
];

export default function AISection() {
  return (
    <section id="ai" className="py-32 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,58,237,0.12), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{
              background: "rgba(124,58,237,0.12)",
              border: "1px solid rgba(124,58,237,0.3)",
              color: "#c084fc",
            }}
          >
            <Sparkles size={14} />
            Cura AI
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            AI that thinks alongside
            <br />
            <span className="gradient-text">your entire team</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Not just automation — genuine intelligence. Cura&apos;s AI understands
            the complexity of care, learns your residents, and guides your staff through
            every critical moment.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: capabilities */}
          <div className="space-y-6">
            {capabilities.map((cap, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass glass-hover rounded-2xl p-6 flex gap-4"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${cap.color}22`, border: `1px solid ${cap.color}44` }}
                >
                  <cap.icon size={20} style={{ color: cap.color }} />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">{cap.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{cap.description}</p>
                </div>
              </motion.div>
            ))}

            <motion.a
              href="#demo"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white text-sm glow-button"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
            >
              Experience Cura AI <ChevronRight size={16} />
            </motion.a>
          </div>

          {/* Right: AI chat demo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass rounded-3xl overflow-hidden"
            style={{ border: "1px solid rgba(124,58,237,0.3)" }}
          >
            {/* Chat header */}
            <div
              className="px-6 py-4 flex items-center gap-3"
              style={{
                background: "rgba(124,58,237,0.1)",
                borderBottom: "1px solid rgba(124,58,237,0.2)",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
              >
                <Brain size={16} className="text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Cura AI Assistant</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-gray-400">Active — analysing 127 residents</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="p-6 space-y-4">
              {chatMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.15 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-xs lg:max-w-sm px-4 py-3 rounded-2xl text-sm leading-relaxed"
                    style={
                      msg.role === "user"
                        ? {
                            background: "rgba(124,58,237,0.3)",
                            border: "1px solid rgba(124,58,237,0.4)",
                            color: "#e9d5ff",
                            borderTopRightRadius: "4px",
                          }
                        : {
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "#d1d5db",
                            borderTopLeftRadius: "4px",
                          }
                    }
                  >
                    {msg.role === "ai" && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <Sparkles size={10} style={{ color: "#a78bfa" }} />
                        <span className="text-xs font-semibold" style={{ color: "#a78bfa" }}>
                          AI
                        </span>
                      </div>
                    )}
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9 }}
                className="flex justify-start"
              >
                <div
                  className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: `${delay}s` }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Input */}
            <div
              className="px-6 py-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-500"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                Ask Cura AI anything...
                <div
                  className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
                >
                  <ChevronRight size={12} className="text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
