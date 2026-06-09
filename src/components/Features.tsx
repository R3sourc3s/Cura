"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, Heart, UserCheck, Calendar, ClipboardList, ShieldCheck, CheckCircle, ArrowRight } from "lucide-react";

const GREEN = "#2d5a3d";
const GOLD = "#b8923a";

const features = [
  {
    icon: Pill, color: GREEN,
    title: "Medication Management", subtitle: "eMAR & pharmacy integration",
    description: "Track every dose with precision. Flag risks before they escalate, manage stock automatically, and sync directly with pharmacy workflows.",
    bullets: ["Automated dose scheduling & reminders", "Real-time stock alerts & reorder triggers", "Pharmacy integration & audit trails", "Risk flagging before incidents occur"],
    preview: {
      header: "Today's Medication Schedule",
      rows: [
        { name: "Agnes T.", time: "08:00", detail: "Metformin 500mg", status: "done" },
        { name: "Robert K.", time: "09:00", detail: "Amlodipine 5mg", status: "done" },
        { name: "Mary S.", time: "10:00", detail: "Warfarin 3mg", status: "pending" },
        { name: "John B.", time: "12:00", detail: "Lisinopril 10mg", status: "upcoming" },
      ],
    },
  },
  {
    icon: Heart, color: GOLD,
    title: "Care Management", subtitle: "Adaptive care plans",
    description: "Plans that evolve with each resident. Cura helps keep care plans current, prompts reviews at the right time, and surfaces gaps before they become concerns.",
    bullets: ["Care plans updated as needs change", "CQC-aligned documentation templates", "Risk stratification & early warning alerts", "Resident wellbeing trend tracking"],
    preview: {
      header: "Resident 14 — Care Plan",
      rows: [
        { name: "Mobility", time: "", detail: "High support — bed-to-chair", status: "done" },
        { name: "Nutrition", time: "", detail: "Pureed diet — 1800 kcal", status: "done" },
        { name: "Cognition", time: "", detail: "Mild decline — monitor weekly", status: "pending" },
        { name: "Social", time: "", detail: "Group activity 3×/week", status: "upcoming" },
      ],
    },
  },
  {
    icon: UserCheck, color: GREEN,
    title: "Recruitment & HR", subtitle: "Hire, onboard, and retain better",
    description: "From job postings to onboarding checklists, leave tracking, and competency records — everything your HR team needs without the spreadsheets.",
    bullets: ["Job posting & applicant tracking", "Digital onboarding with e-signatures", "Leave & absence management", "Training records & DBS check tracking"],
    preview: {
      header: "Staff Overview",
      rows: [
        { name: "Sarah M.", time: "Senior Carer", detail: "On shift", status: "done" },
        { name: "James O.", time: "Nurse", detail: "Annual leave", status: "pending" },
        { name: "Priya K.", time: "Care Coordinator", detail: "On shift", status: "done" },
        { name: "Tom H.", time: "Support Worker", detail: "Training day", status: "upcoming" },
      ],
    },
  },
  {
    icon: Calendar, color: GOLD,
    title: "Shift Management", subtitle: "Rota building without the headache",
    description: "Build skill-matched rotas in minutes, not hours. Fill gaps automatically, stay within working time regulations, and give your team clear visibility of their schedule.",
    bullets: ["Drag-and-drop rota builder", "Automated gap-fill notifications", "Working time regulations compliance", "Staff app for schedule visibility"],
    preview: {
      header: "This Week's Rota",
      rows: [
        { name: "Mon–Wed", time: "Day", detail: "6 staff assigned", status: "done" },
        { name: "Mon–Wed", time: "Night", detail: "3 staff assigned", status: "done" },
        { name: "Thu–Fri", time: "Day", detail: "5 staff — 1 gap", status: "pending" },
        { name: "Weekend", time: "All", detail: "Cover confirmed", status: "done" },
      ],
    },
  },
  {
    icon: ClipboardList, color: GREEN,
    title: "Task Management", subtitle: "Routines and live alerts",
    description: "Set recurring routines, assign tasks to individuals or teams, and get alerts when anything is missed or overdue — nothing slips through the cracks.",
    bullets: ["Pre-built care routine templates", "Real-time completion tracking", "Escalation alerts for overdue tasks", "Resident-linked audit log"],
    preview: {
      header: "Today's Task Board",
      rows: [
        { name: "Morning round", time: "07:30", detail: "All residents checked", status: "done" },
        { name: "Pressure relief", time: "10:00", detail: "14 of 14 complete", status: "done" },
        { name: "Hydration check", time: "13:00", detail: "In progress", status: "pending" },
        { name: "Evening meds", time: "18:00", detail: "Scheduled", status: "upcoming" },
      ],
    },
  },
  {
    icon: ShieldCheck, color: GOLD,
    title: "Compliance", subtitle: "Always inspection-ready",
    description: "Cura generates audit trails as you work, maps your operations to CQC frameworks, and gives you a live compliance picture — so inspections stop being stressful.",
    bullets: ["Live CQC compliance score", "Automated audit trail generation", "Policy & procedure version control", "Inspection evidence pack in one click"],
    preview: {
      header: "Compliance Overview",
      rows: [
        { name: "Safe", time: "", detail: "98% — Excellent", status: "done" },
        { name: "Effective", time: "", detail: "96% — Excellent", status: "done" },
        { name: "Responsive", time: "", detail: "91% — Good", status: "done" },
        { name: "Well-led", time: "", detail: "88% — Review needed", status: "pending" },
      ],
    },
  },
];

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  done:     { bg: "rgba(45,90,61,0.1)",    color: "#2d5a3d", label: "Done" },
  pending:  { bg: "rgba(184,146,58,0.12)", color: "#8a6a1c", label: "Pending" },
  upcoming: { bg: "rgba(122,116,104,0.1)", color: "#7a7468", label: "Upcoming" },
};

export default function Features() {
  const [active, setActive] = useState(0);
  const feature = features[active];

  return (
    <section id="features" className="py-28" style={{ background: "#faf7f0" }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <h2 className="lp-serif text-3xl lg:text-5xl font-bold mb-4" style={{ color: "#1c1a14" }}>
            Built for every role in your care home
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#7a7468" }}>
            Six modules, one platform — no more switching between systems or chasing paper trails.
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-2.5 justify-center mb-10">
          {features.map((f, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                background: active === i ? f.color : "#ffffff",
                border: `1px solid ${active === i ? f.color : "#dfd8cc"}`,
                color: active === i ? "#ffffff" : "#7a7468",
                boxShadow: active === i ? `0 2px 10px ${f.color}40` : "none",
              }}
            >
              <f.icon size={13} />{f.title}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-2 gap-10 items-center"
          >
            <div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: `${feature.color}15`, border: `1px solid ${feature.color}30` }}>
                <feature.icon size={22} style={{ color: feature.color }} />
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: feature.color }}>{feature.subtitle}</p>
              <h3 className="lp-serif text-2xl font-bold mb-4" style={{ color: "#1c1a14" }}>{feature.title}</h3>
              <p className="leading-relaxed mb-8" style={{ color: "#7a7468" }}>{feature.description}</p>
              <ul className="space-y-3 mb-8">
                {feature.bullets.map((b, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm" style={{ color: "#4a4438" }}>
                    <CheckCircle size={15} style={{ color: feature.color, flexShrink: 0 }} />
                    {b}
                  </li>
                ))}
              </ul>
              <a href="#demo" className="inline-flex items-center gap-2 font-semibold text-sm" style={{ color: feature.color }}>
                See this in action <ArrowRight size={13} />
              </a>
            </div>

            <div className="lp-card rounded-2xl overflow-hidden" style={{ borderColor: `${feature.color}30` }}>
              <div className="px-6 py-4 flex items-center gap-3" style={{ background: `${feature.color}0d`, borderBottom: `1px solid ${feature.color}20` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${feature.color}20` }}>
                  <feature.icon size={14} style={{ color: feature.color }} />
                </div>
                <span className="font-semibold text-sm" style={{ color: "#1c1a14" }}>{feature.preview.header}</span>
              </div>
              <div className="p-5 space-y-2.5">
                {feature.preview.rows.map((row, i) => {
                  const s = statusConfig[row.status];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: "#faf7f0", border: "1px solid #dfd8cc" }}
                    >
                      <div className="flex items-center gap-3">
                        {row.time && (
                          <span className="text-xs font-mono px-2 py-0.5 rounded-md" style={{ background: `${feature.color}15`, color: feature.color }}>
                            {row.time}
                          </span>
                        )}
                        <div>
                          <div className="text-sm font-medium" style={{ color: "#1c1a14" }}>{row.name}</div>
                          <div className="text-xs" style={{ color: "#a89f94" }}>{row.detail}</div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
