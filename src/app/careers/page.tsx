"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Briefcase,
  ArrowRight,
  Laptop,
  TrendingUp,
  Sun,
  Heart,
  BookOpen,
  PiggyBank,
  Send,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const roles = [
  {
    title: "Senior Full-Stack Engineer",
    location: "Remote UK",
    department: "Engineering",
    type: "Full-time",
    description:
      "Own and ship core features across the Cura platform. TypeScript, React, Node.js, and PostgreSQL at scale. You'll work closely with product and design to build things that care professionals actually use every day.",
    departmentColor: "#7c3aed",
  },
  {
    title: "Product Designer",
    location: "Remote UK",
    department: "Design",
    type: "Full-time",
    description:
      "Shape the experience of a platform used by thousands of care professionals. You understand that great design in regulated environments must balance clarity, speed, and compliance — and you&apos;re excited by that constraint.",
    departmentColor: "#3b82f6",
  },
  {
    title: "Customer Success Manager",
    location: "Hybrid London",
    department: "Customer Success",
    type: "Full-time",
    description:
      "Partner with our care home customers to drive adoption, deliver value, and build long-term relationships. You know how to translate complex software into practical operational improvement.",
    departmentColor: "#06b6d4",
  },
  {
    title: "Sales Development Representative",
    location: "Remote UK",
    department: "Sales",
    type: "Full-time",
    description:
      "Generate and qualify pipeline for our growing enterprise sales team. You'll become an expert in the care sector and open doors with care home operators, group managers, and procurement leads.",
    departmentColor: "#10b981",
  },
  {
    title: "Implementation Consultant",
    location: "Hybrid",
    department: "Implementation",
    type: "Full-time",
    description:
      "Lead the onboarding and go-live of new care home customers. You&apos;ll combine project management rigour with deep product knowledge to get homes live and running quickly.",
    departmentColor: "#f59e0b",
  },
  {
    title: "Clinical Informatics Lead",
    location: "Remote UK",
    department: "Clinical",
    type: "Full-time",
    description:
      "Bridge clinical practice and digital systems. You'll advise on care record standards, support CQC readiness features, and help our product team build tools that earn the trust of registered managers and nurses.",
    departmentColor: "#ec4899",
  },
];

const perks = [
  {
    icon: Laptop,
    title: "Remote-first",
    description: "Work from anywhere in the UK. We have offices in London for when you want them.",
    color: "#7c3aed",
  },
  {
    icon: TrendingUp,
    title: "Meaningful equity",
    description: "Everyone gets options. We're building something ambitious and you should share in it.",
    color: "#3b82f6",
  },
  {
    icon: Sun,
    title: "35 days holiday",
    description: "25 days annual leave plus UK bank holidays and an extra week we close over Christmas.",
    color: "#f59e0b",
  },
  {
    icon: Heart,
    title: "Private healthcare",
    description: "Full private medical and dental cover for you and your dependants from day one.",
    color: "#ec4899",
  },
  {
    icon: BookOpen,
    title: "L&D budget",
    description: "£1,500 per year to spend on courses, conferences, books, and certifications.",
    color: "#10b981",
  },
  {
    icon: PiggyBank,
    title: "Enhanced pension",
    description: "5% employer contribution on top of the statutory minimum, because the future matters.",
    color: "#06b6d4",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
};

export default function CareersPage() {
  return (
    <main style={{ background: "#050914", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div
          className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none pulse-glow"
          style={{ background: "rgba(124,58,237,0.15)" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none pulse-glow"
          style={{ background: "rgba(59,130,246,0.1)", animationDelay: "2s" }}
        />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
            style={{
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.4)",
              color: "#6ee7b7",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            We&apos;re hiring
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6"
          >
            Help us transform
            <br />
            <span className="gradient-text">care across the UK</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Join a remote-first team on a mission to give care professionals
            back their time — so they can focus on the people who need them
            most.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <a
              href="#open-roles"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white text-lg glow-button"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
            >
              See open roles
              <ArrowRight size={18} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Why Cura */}
      <section className="py-20" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                style={{
                  background: "rgba(124,58,237,0.15)",
                  border: "1px solid rgba(124,58,237,0.3)",
                  color: "#a78bfa",
                }}
              >
                Why Cura?
              </div>
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                Mission-driven work with
                <span className="gradient-text"> real impact</span>
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  Cura is used by over 500 care homes across the UK. Every
                  feature you build, every bug you fix, and every customer
                  conversation you have directly affects the quality of care
                  that thousands of elderly and vulnerable people receive.
                </p>
                <p>
                  We move fast, but thoughtfully. We&apos;re a team of people who
                  care deeply about both the craft and the mission — and we
                  believe the two aren&apos;t in conflict.
                </p>
                <p>
                  We&apos;re Series A funded with strong growth, a clear path to
                  profitability, and a product that customers genuinely love.
                </p>
              </div>
            </motion.div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "60+", label: "Team members", color: "#7c3aed" },
                { value: "Remote-first", label: "Working style", color: "#3b82f6" },
                { value: "Series A", label: "Funding stage", color: "#10b981" },
                { value: "4.8★", label: "Glassdoor rating", color: "#f59e0b" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="glass rounded-2xl p-5"
                  style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className="text-2xl font-extrabold mb-1" style={{ color: item.color }}>
                    {item.value}
                  </div>
                  <div className="text-gray-500 text-sm">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section id="open-roles" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-3">Open roles</h2>
            <p className="text-gray-400 text-lg">
              {roles.length} positions available across the company.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {roles.map((role, i) => (
              <motion.div
                key={role.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass glass-hover rounded-2xl p-6 flex flex-col"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg leading-snug mb-2">
                      {role.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          background: `${role.departmentColor}22`,
                          color: role.departmentColor,
                          border: `1px solid ${role.departmentColor}44`,
                        }}
                      >
                        <Briefcase size={10} />
                        {role.department}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                      >
                        <MapPin size={10} />
                        {role.location}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-5">
                  {role.description}
                </p>
                <button
                  className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
                >
                  Apply for this role
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="py-24" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Benefits &amp; perks
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              We take care of our team so our team can take care of our
              customers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map((perk, i) => (
              <motion.div
                key={perk.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass rounded-2xl p-6 flex gap-5"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${perk.color}22` }}
                >
                  <perk.icon size={22} style={{ color: perk.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{perk.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{perk.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Speculative CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12 relative overflow-hidden"
            style={{ border: "1px solid rgba(124,58,237,0.2)" }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(124,58,237,0.12), transparent)",
              }}
            />
            <div className="relative">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: "rgba(124,58,237,0.2)" }}
              >
                <Send size={24} style={{ color: "#c084fc" }} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Don&apos;t see your role?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
                We&apos;re always interested in exceptional people. Send us your CV
                and tell us how you&apos;d contribute to Cura&apos;s mission.
              </p>
              <a
                href="mailto:careers@curacareplatform.co.uk"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white text-lg glow-button"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
              >
                Send us your CV
                <ArrowRight size={18} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
