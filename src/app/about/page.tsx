"use client";

import { motion } from "framer-motion";
import {
  Heart,
  Target,
  Eye,
  Zap,
  Users,
  TrendingUp,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const stats = [
  { value: "500+", label: "Care Homes", color: "#7c3aed" },
  { value: "12,000+", label: "Care Professionals", color: "#3b82f6" },
  { value: "2M+", label: "Residents Served", color: "#06b6d4" },
  { value: "99.9%", label: "Uptime SLA", color: "#10b981" },
];

const team = [
  {
    initials: "JO",
    name: "James Owusu",
    title: "Chief Executive Officer",
    bio: "Former care home director with 12 years on the front line; built Cura to solve the problems he lived every day.",
    color: "#7c3aed",
  },
  {
    initials: "PS",
    name: "Priya Sharma",
    title: "Chief Technology Officer",
    bio: "Previously led engineering at NHS Digital; passionate about using technology to improve health outcomes at scale.",
    color: "#3b82f6",
  },
  {
    initials: "TW",
    name: "Tom Whitfield",
    title: "Chief Product Officer",
    bio: "Spent a decade designing software for regulated industries; believes great UX is a matter of dignity, not just convenience.",
    color: "#06b6d4",
  },
  {
    initials: "RC",
    name: "Rachel Chen",
    title: "Chief Marketing Officer",
    bio: "Healthcare marketing veteran who has helped three B2B SaaS companies scale from seed to Series B across the UK and Europe.",
    color: "#10b981",
  },
];

const values = [
  {
    icon: Heart,
    title: "Care First",
    description:
      "Every product decision starts with one question: does this make life better for residents and the people who care for them?",
    color: "#f472b6",
  },
  {
    icon: TrendingUp,
    title: "Relentless Improvement",
    description:
      "We ship continuously, listen obsessively to our customers, and treat every piece of feedback as a gift.",
    color: "#7c3aed",
  },
  {
    icon: Eye,
    title: "Radical Transparency",
    description:
      "We share our roadmap publicly, our uptime in real-time, and our reasoning openly — with customers and with each other.",
    color: "#3b82f6",
  },
  {
    icon: CheckCircle,
    title: "Built for UK",
    description:
      "CQC, NHS frameworks, UK GDPR — we don't bolt on compliance. It's baked into every line of code we write.",
    color: "#10b981",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

export default function AboutPage() {
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
          className="absolute top-1/2 right-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none pulse-glow"
          style={{ background: "rgba(59,130,246,0.1)", animationDelay: "2s" }}
        />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
            style={{
              background: "rgba(124,58,237,0.15)",
              border: "1px solid rgba(124,58,237,0.4)",
              color: "#c084fc",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            Our Story
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6 text-white"
          >
            Built by people who&apos;ve
            <br />
            <span className="gradient-text">worked in care</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            We didn&apos;t set out to build software. We set out to solve a problem
            we experienced first-hand — and the only way to do that properly was
            to build something new entirely.
          </motion.p>
        </div>
      </section>

      {/* Founding Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
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
                Founded 2022
              </div>
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                We built what we wished existed
              </h2>
              <div className="space-y-4 text-gray-400 text-lg leading-relaxed">
                <p>
                  Cura was founded in 2022 after our founders spent years
                  working in care homes and watching staff struggle with
                  paper-based systems. Medication rounds were tracked on paper
                  charts. Care plans lived in lever-arch folders. Incident
                  reports were faxed to regulators.
                </p>
                <p>
                  Meanwhile, care professionals — some of the most dedicated
                  people in the country — were spending hours each shift on
                  paperwork instead of with the people who needed them.
                </p>
                <p>
                  We built Cura because we believed care homes deserved
                  enterprise-grade software that was actually designed for the
                  care environment — not adapted from a generic business tool.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div
                className="glass rounded-2xl p-8"
                style={{ border: "1px solid rgba(124,58,237,0.2)" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: "rgba(124,58,237,0.2)" }}
                >
                  <Target size={24} style={{ color: "#c084fc" }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Our Mission
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed italic">
                  &ldquo;Our mission is to give every care professional back time
                  — so they can focus on what matters: the people in their
                  care.&rdquo;
                </p>
                <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}
                  >
                    JO
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">James Owusu</div>
                    <div className="text-xs text-gray-500">CEO & Co-Founder</div>
                  </div>
                </div>
              </div>
              {/* Decorative card */}
              <div
                className="absolute -bottom-6 -right-6 glass rounded-xl p-4 w-48"
                style={{ border: "1px solid rgba(59,130,246,0.2)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} style={{ color: "#60a5fa" }} />
                  <span className="text-xs font-semibold text-blue-300">
                    Impact since launch
                  </span>
                </div>
                <div className="text-2xl font-bold text-white">2M+</div>
                <div className="text-xs text-gray-500">residents served</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass glass-hover rounded-2xl p-6 text-center"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div
                  className="text-4xl font-extrabold mb-2"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{
                background: "rgba(59,130,246,0.15)",
                border: "1px solid rgba(59,130,246,0.3)",
                color: "#93c5fd",
              }}
            >
              <Users size={12} />
              Leadership
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Meet the team
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Operators, engineers, and designers who have lived the problem and
              are dedicated to solving it.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass glass-hover rounded-2xl p-6"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white mb-5"
                  style={{ background: `linear-gradient(135deg, ${member.color}cc, ${member.color}55)` }}
                >
                  {member.initials}
                </div>
                <div className="font-bold text-white text-lg mb-1">
                  {member.name}
                </div>
                <div
                  className="text-xs font-semibold mb-3 px-2 py-1 rounded-full inline-block"
                  style={{
                    background: `${member.color}22`,
                    color: member.color,
                  }}
                >
                  {member.title}
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              What we stand for
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Our values aren&apos;t a poster on a wall. They&apos;re the principles
              that guide every decision we make.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass glass-hover rounded-2xl p-6"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${value.color}22` }}
                >
                  <value.icon size={22} style={{ color: value.color }} />
                </div>
                <h3 className="font-bold text-white text-lg mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="glass rounded-3xl p-16 relative overflow-hidden"
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
              <h2 className="text-4xl font-bold text-white mb-4">
                Want to shape the future of care?
              </h2>
              <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">
                We&apos;re a remote-first team building software that improves the
                lives of millions of people. Come build it with us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/careers"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-white text-lg glow-button"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
                >
                  Join the team
                  <ArrowRight size={18} />
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-gray-300 text-lg transition-all hover:text-white hover:bg-white/5"
                  style={{ border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  Book a demo
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
