"use client";

import { motion } from "framer-motion";
import { Heart, Eye, CheckCircle, TrendingUp, ArrowRight, Users, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const GREEN = "#0d9488";
const GOLD = "#10b981";

const stats = [
  { value: "500+",   label: "Care Homes",          color: GREEN },
  { value: "12,000+", label: "Care Professionals", color: GOLD },
  { value: "2M+",    label: "Residents Served",    color: GREEN },
  { value: "99.9%",  label: "Uptime SLA",          color: GOLD },
];

const team = [
  { initials: "JO", name: "James Owusu",    title: "Chief Executive Officer",  bio: "Former care home director with 12 years on the front line; built Cura to solve the problems he lived every day.", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces&auto=format&q=80" },
  { initials: "PS", name: "Priya Sharma",   title: "Chief Technology Officer",  bio: "Previously led engineering at NHS Digital; passionate about using technology to improve health outcomes at scale.", photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&crop=faces&auto=format&q=80" },
  { initials: "TW", name: "Tom Whitfield",  title: "Chief Product Officer",     bio: "Spent a decade designing software for regulated industries; believes great UX is a matter of dignity, not convenience.", photo: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop&crop=faces&auto=format&q=80" },
  { initials: "RC", name: "Rachel Chen",    title: "Chief Marketing Officer",   bio: "Healthcare marketing veteran who has helped three B2B SaaS companies scale from seed to Series B across the UK.", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces&auto=format&q=80" },
];

const values = [
  { icon: Heart,        title: "Care First",              description: "Every product decision starts with one question: does this make life better for residents and the people who care for them?", color: GREEN },
  { icon: TrendingUp,   title: "Relentless Improvement",  description: "We ship continuously, listen obsessively to our customers, and treat every piece of feedback as a gift.", color: GOLD },
  { icon: Eye,          title: "Radical Transparency",    description: "We share our roadmap publicly, our uptime in real-time, and our reasoning openly — with customers and with each other.", color: GREEN },
  { icon: CheckCircle,  title: "Built for UK",             description: "CQC, NHS frameworks, UK GDPR — we don't bolt on compliance. It's baked into every line of code we write.", color: GOLD },
  { icon: ShieldCheck,  title: "Independent by Design",    description: "Cura is a technology company, not a care home operator. We don't own or run care homes, so we have no incentive to steer decisions in any direction other than what's best for your residents and your business.", color: GREEN },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }),
};

export default function AboutPage() {
  return (
    <main id="main-content" style={{ background: "var(--bg-secondary)", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
            style={{ background: "rgba(13, 148, 136,0.1)", border: "1px solid rgba(13, 148, 136,0.25)", color: GREEN }}>
            Our Story
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="lp-serif text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: "var(--text-primary)" }}>
            Built by people who&apos;ve
            <br /><span style={{ color: GREEN }}>worked in care</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-xl max-w-2xl mx-auto leading-relaxed mb-14" style={{ color: "var(--text-muted)" }}>
            We didn&apos;t set out to build software. We set out to solve a problem we experienced first-hand — and the only way to do that properly was to build something new entirely.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-3 max-w-4xl mx-auto">
            {[
              { src: "https://images.unsplash.com/photo-1765896387387-0538bc9f997e?w=600&h=400&fit=crop&crop=faces&auto=format&q=80", alt: "Care home nurse smiling with a resident", label: "Person-centred care" },
              { src: "https://images.unsplash.com/photo-1773227059780-5e865ce7fb13?w=600&h=400&fit=crop&crop=center&auto=format&q=80", alt: "Residents and carers laughing together", label: "Community & connection" },
              { src: "https://images.unsplash.com/photo-1762955913084-96ea3f986468?w=600&h=400&fit=crop&crop=center&auto=format&q=80", alt: "Young carer helping elderly residents", label: "Skilled, caring teams" },
            ].map((img) => (
              <div key={img.label} className="relative rounded-2xl overflow-hidden group" style={{ height: "200px", border: "1px solid var(--border)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,23,42,0.7) 0%, transparent 55%)" }} />
                <span className="absolute bottom-3 left-4 text-xs font-medium text-white">{img.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20" style={{ background: "var(--bg-card)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -32 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="inline-flex px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                style={{ background: "rgba(13, 148, 136,0.1)", border: "1px solid rgba(13, 148, 136,0.25)", color: GREEN }}>
                Founded 2022
              </span>
              <h2 className="lp-serif text-4xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>We built what we wished existed</h2>
              <div className="space-y-4 text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
                <p>Cura was founded in 2022 after our founders spent years working in care homes and watching staff struggle with paper-based systems. Medication rounds were tracked on paper charts. Care plans lived in lever-arch folders. Incident reports were faxed to regulators.</p>
                <p>Meanwhile, care professionals — some of the most dedicated people in the country — were spending hours each shift on paperwork instead of with the people who needed them.</p>
                <p>We built Cura because we believed care homes deserved software that was actually designed for the care environment — not adapted from a generic business tool.</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 32 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="relative rounded-3xl overflow-hidden" style={{ height: "460px", border: "1px solid var(--border)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1773227055624-07b515ba87c5?w=800&h=900&fit=crop&crop=center&auto=format&q=80"
                  alt="Carer holding hands with a smiling elderly resident" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.2) 60%, transparent 100%)" }} />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-sm leading-relaxed italic mb-4" style={{ color: "rgba(255,255,255,0.85)" }}>
                    &ldquo;Our mission is to give every care professional back time — so they can focus on what matters: the people in their care.&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces&auto=format&q=80"
                      alt="James Owusu" className="w-9 h-9 rounded-full object-cover" style={{ border: "2px solid rgba(16, 185, 129,0.6)" }} />
                    <div>
                      <div className="text-sm font-semibold text-white">James Owusu</div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>CEO &amp; Co-Founder</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16" style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="lp-card rounded-2xl p-6 text-center">
                <div className="lp-serif text-4xl font-bold mb-2" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-sm" style={{ color: "var(--text-muted)" }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24" style={{ background: "var(--bg-card)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ background: "rgba(13, 148, 136,0.1)", border: "1px solid rgba(13, 148, 136,0.25)", color: GREEN }}>
              <Users size={12} /> Leadership
            </div>
            <h2 className="lp-serif text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Meet the team</h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
              Operators, engineers, and designers who have lived the problem and are dedicated to solving it.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div key={member.name} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="lp-card rounded-2xl p-6">
                <div className="relative w-16 h-16 mb-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={member.photo} alt={member.name} className="w-16 h-16 rounded-2xl object-cover"
                    style={{ border: `2px solid rgba(13, 148, 136,0.25)` }}
                    onError={(e) => { const t = e.currentTarget; t.style.display = "none"; const fb = t.nextElementSibling as HTMLElement; if (fb) fb.style.display = "flex"; }} />
                  <div className="w-16 h-16 rounded-2xl items-center justify-center text-xl font-bold text-white"
                    style={{ background: GREEN, display: "none" }}>
                    {member.initials}
                  </div>
                </div>
                <div className="font-bold text-lg mb-1" style={{ color: "var(--text-primary)" }}>{member.name}</div>
                <div className="text-xs font-semibold mb-3 px-2 py-1 rounded-full inline-block"
                  style={{ background: "rgba(13, 148, 136,0.1)", color: GREEN }}>{member.title}</div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24" style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="lp-serif text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>What we stand for</h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
              Our values aren&apos;t a poster on a wall. They&apos;re the principles that guide every decision we make.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div key={value.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="lp-card rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${value.color}15` }}>
                  <value.icon size={22} style={{ color: value.color }} />
                </div>
                <h3 className="font-bold text-lg mb-3" style={{ color: "var(--text-primary)" }}>{value.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24" style={{ background: "var(--bg-card)" }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-3xl p-16 relative overflow-hidden"
            style={{ background: "#0d9488" }}>
            <h2 className="lp-serif text-4xl font-bold text-white mb-4">Want to shape the future of care?</h2>
            <p className="text-lg mb-10 max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.75)" }}>
              We&apos;re a remote-first team building software that improves the lives of millions of people. Come build it with us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/careers" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold text-base transition-all"
                style={{ background: "#ffffff", color: "#0d9488" }}>
                Join the team <ArrowRight size={16} />
              </a>
              <a href="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold text-white text-base transition-all"
                style={{ border: "1.5px solid rgba(255,255,255,0.35)" }}>
                Book a demo
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
