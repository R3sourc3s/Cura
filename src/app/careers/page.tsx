"use client";

import { motion } from "framer-motion";
import { MapPin, Briefcase, ArrowRight, Laptop, TrendingUp, Sun, Heart, BookOpen, PiggyBank, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const roles = [
  {
    title: "Senior Full-Stack Engineer",
    location: "Remote UK",
    department: "Engineering",
    type: "Full-time",
    description: "Own and ship core features across the Cura platform. TypeScript, React, Node.js, and PostgreSQL at scale. You'll work closely with product and design to build things that care professionals actually use every day.",
    departmentColor: "#2d5a3d",
  },
  {
    title: "Product Designer",
    location: "Remote UK",
    department: "Design",
    type: "Full-time",
    description: "Shape the experience of a platform used by thousands of care professionals. You understand that great design in regulated environments must balance clarity, speed, and compliance — and you&apos;re excited by that constraint.",
    departmentColor: "#b8923a",
  },
  {
    title: "Customer Success Manager",
    location: "Hybrid London",
    department: "Customer Success",
    type: "Full-time",
    description: "Partner with our care home customers to drive adoption, deliver value, and build long-term relationships. You know how to translate complex software into practical operational improvement.",
    departmentColor: "#2d5a3d",
  },
  {
    title: "Sales Development Representative",
    location: "Remote UK",
    department: "Sales",
    type: "Full-time",
    description: "Generate and qualify pipeline for our growing enterprise sales team. You'll become an expert in the care sector and open doors with care home operators, group managers, and procurement leads.",
    departmentColor: "#b8923a",
  },
  {
    title: "Implementation Consultant",
    location: "Hybrid",
    department: "Implementation",
    type: "Full-time",
    description: "Lead the onboarding and go-live of new care home customers. You&apos;ll combine project management rigour with deep product knowledge to get homes live and running quickly.",
    departmentColor: "#2d5a3d",
  },
  {
    title: "Clinical Informatics Lead",
    location: "Remote UK",
    department: "Clinical",
    type: "Full-time",
    description: "Bridge clinical practice and digital systems. You'll advise on care record standards, support CQC readiness features, and help our product team build tools that earn the trust of registered managers and nurses.",
    departmentColor: "#b8923a",
  },
];

const perks = [
  { icon: Laptop,     title: "Remote-first",      description: "Work from anywhere in the UK. We have offices in London for when you want them.",              color: "#2d5a3d" },
  { icon: TrendingUp, title: "Meaningful equity",  description: "Everyone gets options. We're building something ambitious and you should share in it.",          color: "#b8923a" },
  { icon: Sun,        title: "35 days holiday",    description: "25 days annual leave plus UK bank holidays and an extra week we close over Christmas.",          color: "#b8923a" },
  { icon: Heart,      title: "Private healthcare", description: "Full private medical and dental cover for you and your dependants from day one.",                color: "#2d5a3d" },
  { icon: BookOpen,   title: "L&D budget",         description: "£1,500 per year to spend on courses, conferences, books, and certifications.",                  color: "#2d5a3d" },
  { icon: PiggyBank,  title: "Enhanced pension",   description: "5% employer contribution on top of the statutory minimum, because the future matters.",          color: "#b8923a" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
};

export default function CareersPage() {
  return (
    <main style={{ background: "#faf7f0", minHeight: "100vh" }}>
      <Navbar />

      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
            style={{ background: "rgba(45,90,61,0.1)", border: "1px solid rgba(45,90,61,0.3)", color: "#2d5a3d" }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#2d5a3d" }} />
            We&apos;re hiring
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="lp-serif text-5xl lg:text-6xl font-extrabold leading-tight mb-6" style={{ color: "#1c1a14" }}>
            Help us transform<br />
            <span style={{ color: "#2d5a3d" }}>care across the UK</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl max-w-2xl mx-auto leading-relaxed mb-10" style={{ color: "#7a7468" }}>
            Join a remote-first team on a mission to give care professionals back their time — so they can focus on the people who need them most.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
            <a href="#open-roles"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white text-lg"
              style={{ background: "#2d5a3d" }}>
              See open roles <ArrowRight size={18} />
            </a>
          </motion.div>
        </div>
      </section>

      <section className="py-20" style={{ background: "#ffffff", borderTop: "1px solid #dfd8cc" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                style={{ background: "rgba(45,90,61,0.1)", border: "1px solid rgba(45,90,61,0.25)", color: "#2d5a3d" }}>
                Why Cura?
              </div>
              <h2 className="lp-serif text-4xl font-bold mb-6 leading-tight" style={{ color: "#1c1a14" }}>
                Mission-driven work with <span style={{ color: "#2d5a3d" }}>real impact</span>
              </h2>
              <div className="space-y-4 leading-relaxed" style={{ color: "#7a7468" }}>
                <p>Cura is used by over 500 care homes across the UK. Every feature you build, every bug you fix, and every customer conversation you have directly affects the quality of care that thousands of elderly and vulnerable people receive.</p>
                <p>We move fast, but thoughtfully. We&apos;re a team of people who care deeply about both the craft and the mission — and we believe the two aren&apos;t in conflict.</p>
                <p>We&apos;re Series A funded with strong growth, a clear path to profitability, and a product that customers genuinely love.</p>
              </div>
            </motion.div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "60+",          label: "Team members",   color: "#2d5a3d" },
                { value: "Remote-first", label: "Working style",  color: "#b8923a" },
                { value: "Series A",     label: "Funding stage",  color: "#2d5a3d" },
                { value: "4.8★",         label: "Glassdoor rating", color: "#b8923a" },
              ].map((item, i) => (
                <motion.div key={item.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                  className="lp-card rounded-2xl p-5">
                  <div className="lp-serif text-2xl font-extrabold mb-1" style={{ color: item.color }}>{item.value}</div>
                  <div className="text-sm" style={{ color: "#7a7468" }}>{item.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="open-roles" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <h2 className="lp-serif text-4xl font-bold mb-3" style={{ color: "#1c1a14" }}>Open roles</h2>
            <p className="text-lg" style={{ color: "#7a7468" }}>{roles.length} positions available across the company.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {roles.map((role, i) => (
              <motion.div key={role.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="lp-card rounded-2xl p-6 flex flex-col">
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg leading-snug mb-2" style={{ color: "#1c1a14" }}>{role.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: `${role.departmentColor}12`, color: role.departmentColor, border: `1px solid ${role.departmentColor}25` }}>
                        <Briefcase size={10} /> {role.department}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                        style={{ background: "#f3ede1", color: "#7a7468", border: "1px solid #dfd8cc" }}>
                        <MapPin size={10} /> {role.location}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: "#7a7468" }}>{role.description}</p>
                <button className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all"
                  style={{ background: "#2d5a3d" }}>
                  Apply for this role
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24" style={{ background: "#ffffff", borderTop: "1px solid #dfd8cc" }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="lp-serif text-4xl font-bold mb-4" style={{ color: "#1c1a14" }}>Benefits &amp; perks</h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "#7a7468" }}>We take care of our team so our team can take care of our customers.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map((perk, i) => (
              <motion.div key={perk.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="lp-card rounded-2xl p-6 flex gap-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${perk.color}12` }}>
                  <perk.icon size={22} style={{ color: perk.color }} />
                </div>
                <div>
                  <h3 className="font-bold mb-1" style={{ color: "#1c1a14" }}>{perk.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#7a7468" }}>{perk.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-3xl p-12 relative overflow-hidden" style={{ background: "#2d5a3d" }}>
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: "rgba(255,255,255,0.15)" }}>
                <Send size={24} className="text-white" />
              </div>
              <h2 className="lp-serif text-3xl font-bold text-white mb-4">Don&apos;t see your role?</h2>
              <p className="text-lg mb-8 max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.8)" }}>
                We&apos;re always interested in exceptional people. Send us your CV and tell us how you&apos;d contribute to Cura&apos;s mission.
              </p>
              <a href="mailto:careers@curacareplatform.co.uk"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg transition-all"
                style={{ background: "#ffffff", color: "#2d5a3d" }}>
                Send us your CV <ArrowRight size={18} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
