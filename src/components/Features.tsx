"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pill, Heart, UserCheck, Calendar, ClipboardList, ShieldCheck,
  CheckCircle, ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Pill,
    color: "#7c3aed",
    title: "Medication Management",
    subtitle: "eMAR & pharmacy integration",
    description:
      "Track every dose with precision. Flag risks before they escalate, manage stock levels automatically, and sync directly with pharmacy workflows — all in real time.",
    bullets: [
      "Automated dose scheduling & reminders",
      "Real-time stock alerts & reorder triggers",
      "Pharmacy integration & audit trails",
      "Risk flagging with AI pattern detection",
    ],
    preview: {
      header: "Today's Medication Schedule",
      rows: [
        { resident: "Agnes T.", time: "08:00", drug: "Metformin 500mg", status: "done" },
        { resident: "Robert K.", time: "09:00", drug: "Amlodipine 5mg", status: "done" },
        { resident: "Mary S.", time: "10:00", drug: "Warfarin 3mg", status: "pending" },
        { resident: "John B.", time: "12:00", drug: "Lisinopril 10mg", status: "upcoming" },
      ],
    },
  },
  {
    icon: Heart,
    color: "#ec4899",
    title: "Care Management",
    subtitle: "AI-driven adaptive care plans",
    description:
      "Go beyond static care plans. Cura's AI continuously adapts to each resident's changing needs, prompting staff at critical moments and surfacing compliance gaps before inspections.",
    bullets: [
      "Dynamic AI care plans updated in real time",
      "CQC-aligned documentation templates",
      "Risk stratification & early warning alerts",
      "Resident wellbeing trend analytics",
    ],
    preview: {
      header: "Resident 14 — Care Plan",
      rows: [
        { resident: "Mobility", time: "", drug: "High support — bed-to-chair", status: "done" },
        { resident: "Nutrition", time: "", drug: "Pureed diet — 1800 kcal", status: "done" },
        { resident: "Cognition", time: "", drug: "Mild decline — monitor weekly", status: "pending" },
        { resident: "Social", time: "", drug: "Group activity 3x/week", status: "upcoming" },
      ],
    },
  },
  {
    icon: UserCheck,
    color: "#06b6d4",
    title: "Recruitment & HR",
    subtitle: "Hire, onboard, and retain better",
    description:
      "Cut your time-to-hire in half. Cura's HR module handles everything from job postings to onboarding checklists, leave tracking, and competency management.",
    bullets: [
      "Automated job posting & applicant tracking",
      "Digital onboarding with e-signatures",
      "Leave & absence management dashboard",
      "Training records & DBS check tracking",
    ],
    preview: {
      header: "Staff Overview",
      rows: [
        { resident: "Sarah M.", time: "Senior Carer", drug: "On shift", status: "done" },
        { resident: "James O.", time: "Nurse", drug: "Annual leave", status: "pending" },
        { resident: "Priya K.", time: "Care Coordinator", drug: "On shift", status: "done" },
        { resident: "Tom H.", time: "Support Worker", drug: "Training day", status: "upcoming" },
      ],
    },
  },
  {
    icon: Calendar,
    color: "#f59e0b",
    title: "Shift Management",
    subtitle: "Intelligent rota automation",
    description:
      "Build compliant, skill-matched rotas in minutes not hours. Automatically fill gaps, respect working time regulations, and give staff visibility of their schedules from any device.",
    bullets: [
      "Drag-and-drop rota builder with skill matching",
      "Automated gap-fill notifications",
      "Working time regulations compliance",
      "Staff app for schedule visibility & swaps",
    ],
    preview: {
      header: "This Week's Rota",
      rows: [
        { resident: "Mon–Wed", time: "Day", drug: "6 staff assigned", status: "done" },
        { resident: "Mon–Wed", time: "Night", drug: "3 staff assigned", status: "done" },
        { resident: "Thu–Fri", time: "Day", drug: "5 staff — 1 gap", status: "pending" },
        { resident: "Weekend", time: "All", drug: "Cover confirmed", status: "done" },
      ],
    },
  },
  {
    icon: ClipboardList,
    color: "#10b981",
    title: "Task Management",
    subtitle: "Pre-defined routines & live alerts",
    description:
      "Ensure nothing slips through the cracks. Assign tasks to individuals or teams, set recurring routines, and get live alerts when critical tasks are missed or overdue.",
    bullets: [
      "Pre-built care routine templates",
      "Real-time completion tracking",
      "Escalation alerts for overdue tasks",
      "Resident-linked task history & audit log",
    ],
    preview: {
      header: "Today's Task Board",
      rows: [
        { resident: "Morning round", time: "07:30", drug: "All residents checked", status: "done" },
        { resident: "Pressure relief", time: "10:00", drug: "14 of 14 complete", status: "done" },
        { resident: "Hydration check", time: "13:00", drug: "In progress", status: "pending" },
        { resident: "Evening meds", time: "18:00", drug: "Scheduled", status: "upcoming" },
      ],
    },
  },
  {
    icon: ShieldCheck,
    color: "#3b82f6",
    title: "Compliance Engine",
    subtitle: "Always inspection-ready",
    description:
      "Never dread a CQC inspection again. Cura generates audit trails automatically, maps everything to regulatory frameworks, and gives you a live compliance score.",
    bullets: [
      "Live CQC compliance score dashboard",
      "Automated audit trail generation",
      "Policy & procedure version control",
      "Inspection evidence pack in one click",
    ],
    preview: {
      header: "Compliance Score",
      rows: [
        { resident: "Safe", time: "", drug: "98% — Excellent", status: "done" },
        { resident: "Effective", time: "", drug: "96% — Excellent", status: "done" },
        { resident: "Responsive", time: "", drug: "91% — Good", status: "done" },
        { resident: "Well-led", time: "", drug: "88% — Review needed", status: "pending" },
      ],
    },
  },
];

const statusColors: Record<string, string> = {
  done: "#10b981",
  pending: "#f59e0b",
  upcoming: "#6b7280",
};
const statusLabels: Record<string, string> = {
  done: "Done",
  pending: "Pending",
  upcoming: "Upcoming",
};

export default function Features() {
  const [active, setActive] = useState(0);
  const feature = features[active];

  return (
    <section id="features" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#a78bfa" }}>
            Everything In One Place
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Built for every role in your care home
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Six powerful modules, one unified platform. No more switching between
            systems or chasing paper trails.
          </p>
        </motion.div>

        {/* Feature tabs */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {features.map((f, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
              style={{
                background: active === i ? `${f.color}22` : "rgba(255,255,255,0.04)",
                border: `1px solid ${active === i ? f.color : "rgba(255,255,255,0.08)"}`,
                color: active === i ? "white" : "#9ca3af",
              }}
            >
              <f.icon size={14} style={{ color: active === i ? f.color : "inherit" }} />
              {f.title}
            </button>
          ))}
        </div>

        {/* Feature content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid lg:grid-cols-2 gap-8 items-center"
          >
            {/* Left: description */}
            <div>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: `${feature.color}22`, border: `1px solid ${feature.color}44` }}
              >
                <feature.icon size={24} style={{ color: feature.color }} />
              </div>
              <div className="text-sm font-medium mb-2" style={{ color: feature.color }}>
                {feature.subtitle}
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">{feature.description}</p>
              <ul className="space-y-3 mb-8">
                {feature.bullets.map((b, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle size={16} style={{ color: feature.color, flexShrink: 0 }} />
                    {b}
                  </li>
                ))}
              </ul>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 font-semibold text-sm"
                style={{ color: feature.color }}
              >
                See this module in action <ArrowRight size={14} />
              </a>
            </div>

            {/* Right: preview card */}
            <div
              className="glass rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${feature.color}33` }}
            >
              {/* Card header */}
              <div
                className="px-6 py-4 flex items-center justify-between"
                style={{ background: `${feature.color}11`, borderBottom: `1px solid ${feature.color}22` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${feature.color}33` }}
                  >
                    <feature.icon size={14} style={{ color: feature.color }} />
                  </div>
                  <span className="text-white font-semibold text-sm">{feature.preview.header}</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
              </div>

              {/* Table */}
              <div className="p-6">
                <div className="space-y-3">
                  {feature.preview.rows.map((row, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <div className="flex items-center gap-3">
                        {row.time && (
                          <span
                            className="text-xs font-mono px-2 py-0.5 rounded-md"
                            style={{ background: `${feature.color}22`, color: feature.color }}
                          >
                            {row.time}
                          </span>
                        )}
                        <div>
                          <div className="text-sm font-medium text-white">{row.resident}</div>
                          <div className="text-xs text-gray-500">{row.drug}</div>
                        </div>
                      </div>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          background: `${statusColors[row.status]}22`,
                          color: statusColors[row.status],
                        }}
                      >
                        {statusLabels[row.status]}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
