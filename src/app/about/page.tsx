"use client";

import { motion } from "framer-motion";
import {
  Heart,
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
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces&auto=format&q=80",
  },
  {
    initials: "PS",
    name: "Priya Sharma",
    title: "Chief Technology Officer",
    bio: "Previously led engineering at NHS Digital; passionate about using technology to improve health outcomes at scale.",
    color: "#3b82f6",
    photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&crop=faces&auto=format&q=80",
  },
  {
    initials: "TW",
    name: "Tom Whitfield",
    title: "Chief Product Officer",
    bio: "Spent a decade designing software for regulated industries; believes great UX is a matter of dignity, not just convenience.",
    color: "#06b6d4",
    photo: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop&crop=faces&auto=format&q=80",
  },
  {
    initials: "RC",
    name: "Rachel Chen",
    title: "Chief Marketing Officer",
    bio: "Healthcare marketing veteran who has helped three B2B SaaS companies scale from seed to Series B across the UK and Europe.",
    color: "#10b981",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces&auto=format&q=80",
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
            className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-14"
          >
            We didn&apos;t set out to build software. We set out to solve a problem
            we experienced first-hand — and the only way to do that properly was
            to build something new entirely.
          </motion.p>

          {/* Photo strip */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="grid grid-cols-3 gap-3 max-w-4xl mx-auto"
          >
            {[
              {
                src: "https://images.unsplash.com/photo-1765896387387-0538bc9f997e?w=600&h=400&fit=crop&crop=faces&auto=format&q=80",
                alt: "Care home nurse in blue scrubs smiling warmly with an elderly resident",
                label: "Person-centred care",
              },
              {
                src: "https://images.unsplash.com/photo-1773227059780-5e865ce7fb13?w=600&h=400&fit=crop&crop=center&auto=format&q=80",
                alt: "Residents and carers laughing together in a care home activity session",
                label: "Community & connection",
              },
              {
                src: "https://images.unsplash.com/photo-1762955913084-96ea3f986468?w=600&h=400&fit=crop&crop=center&auto=format&q=80",
                alt: "Young carer helping elderly women with a craft activity in a care home",
                label: "Skilled, caring teams",
              },
            ].map((img) => (
              <div
                key={img.label}
                className="relative rounded-2xl overflow-hidden group"
                style={{ height: "200px", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to top, rgba(5,9,20,0.75) 0%, transparent 60%)",
                  }}
                />
                <span className="absolute bottom-3 left-4 text-xs font-medium text-gray-300">
                  {img.label}
                </span>
              </div>
            ))}
          </motion.div>
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
              {/* Care home photo */}
              <div
                className="relative rounded-3xl overflow-hidden"
                style={{
                  height: "460px",
                  border: "1px solid rgba(124,58,237,0.2)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1773227055624-07b515ba87c5?w=800&h=900&fit=crop&crop=center&auto=format&q=80"
                  alt="Carer holding hands with a smiling elderly resident in a care home lounge"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(5,9,20,0.95) 0%, rgba(5,9,20,0.3) 60%, rgba(5,9,20,0.1) 100%)",
                  }}
                />
                {/* Mission quote overlaid at bottom */}
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-gray-200 text-sm leading-relaxed italic mb-4">
                    &ldquo;Our mission is to give every care professional back time
                    — so they can focus on what matters: the people in their care.&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces&auto=format&q=80"
                      alt="James Owusu"
                      className="w-9 h-9 rounded-full object-cover"
                      style={{ border: "2px solid rgba(124,58,237,0.6)" }}
                    />
                    <div>
                      <div className="text-sm font-semibold text-white">James Owusu</div>
                      <div className="text-xs text-gray-400">CEO &amp; Co-Founder</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating impact card */}
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
                <div className="relative w-16 h-16 mb-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-16 h-16 rounded-2xl object-cover"
                    style={{ border: `2px solid ${member.color}55` }}
                    onError={(e) => {
                      const t = e.currentTarget;
                      t.style.display = "none";
                      const fb = t.nextElementSibling as HTMLElement;
                      if (fb) fb.style.display = "flex";
                    }}
                  />
                  <div
                    className="w-16 h-16 rounded-2xl items-center justify-center text-xl font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${member.color}cc, ${member.color}55)`, display: "none" }}
                  >
                    {member.initials}
                  </div>
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
