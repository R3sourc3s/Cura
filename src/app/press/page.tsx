"use client";

import { motion } from "framer-motion";
import {
  ExternalLink,
  Download,
  Image as ImageIcon,
  FileText,
  Users,
  Mail,
  Calendar,
  Building2,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const pressCoverage = [
  {
    outlet: "The Guardian",
    headline: "Digital revolution in UK care homes",
    summary:
      "How a new generation of care management platforms is tackling the sector&apos;s chronic paper-based inefficiency — and what it means for residents and staff.",
    date: "January 2025",
    color: "#3b82f6",
    category: "Feature",
  },
  {
    outlet: "Health Service Journal",
    headline: "The startup solving the care sector&apos;s data crisis",
    summary:
      "Cura&apos;s AI-powered platform is giving care homes real-time visibility over resident outcomes for the first time. HSJ looks at why the timing couldn&apos;t be better.",
    date: "February 2025",
    color: "#7c3aed",
    category: "Interview",
  },
  {
    outlet: "Digital Health",
    headline: "Cura raises £5M to expand AI care platform",
    summary:
      "London-based care technology company Cura has closed a £5M Series A round led by Octopus Ventures, with participation from Northzone and several NHS innovation funds.",
    date: "March 2025",
    color: "#10b981",
    category: "News",
  },
];

const mediaAssets = [
  {
    icon: ImageIcon,
    title: "Logo Pack",
    description: "SVG, PNG, and dark/light variants of the Cura wordmark and icon.",
    fileType: "ZIP — 2.4 MB",
    color: "#7c3aed",
  },
  {
    icon: FileText,
    title: "Brand Guidelines",
    description: "Colours, typography, voice, and usage rules for all Cura brand assets.",
    fileType: "PDF — 4.1 MB",
    color: "#3b82f6",
  },
  {
    icon: Users,
    title: "Founder Photos",
    description: "High-resolution headshots of James Owusu (CEO) and Priya Sharma (CTO).",
    fileType: "ZIP — 18 MB",
    color: "#06b6d4",
  },
  {
    icon: FileText,
    title: "Product Screenshots",
    description: "Dashboard, care plans, eMAR, and compliance view screenshots at 2x resolution.",
    fileType: "ZIP — 32 MB",
    color: "#10b981",
  },
];

const companyFacts = [
  { label: "Founded", value: "2022", icon: Calendar, color: "#7c3aed" },
  { label: "HQ", value: "London, UK", icon: Building2, color: "#3b82f6" },
  { label: "Team size", value: "60+ employees", icon: Users, color: "#06b6d4" },
  { label: "Customers", value: "500+ care homes", icon: Building2, color: "#10b981" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

export default function PressPage() {
  return (
    <main style={{ background: "#050914", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div
          className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none pulse-glow"
          style={{ background: "rgba(124,58,237,0.12)" }}
        />
        <div
          className="absolute bottom-0 right-1/3 w-72 h-72 rounded-full blur-3xl pointer-events-none pulse-glow"
          style={{ background: "rgba(59,130,246,0.1)", animationDelay: "2s" }}
        />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
            style={{
              background: "rgba(59,130,246,0.15)",
              border: "1px solid rgba(59,130,246,0.4)",
              color: "#93c5fd",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Press &amp; Media
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6"
          >
            Cura in
            <br />
            <span className="gradient-text">the media</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-gray-400 max-w-xl mx-auto leading-relaxed"
          >
            Press coverage, media assets, company facts, and contact details
            for journalists and media professionals.
          </motion.p>
        </div>
      </section>

      {/* Press Coverage */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-3">
              Recent coverage
            </h2>
            <p className="text-gray-400">
              Selected press mentions from leading health and technology
              publications.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {pressCoverage.map((item, i) => (
              <motion.div
                key={item.outlet}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass glass-hover rounded-2xl p-7 flex flex-col"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-white font-extrabold text-lg">
                      {item.outlet}
                    </div>
                    <div className="text-gray-600 text-xs mt-0.5">
                      {item.date}
                    </div>
                  </div>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      background: `${item.color}22`,
                      color: item.color,
                      border: `1px solid ${item.color}44`,
                    }}
                  >
                    {item.category}
                  </span>
                </div>
                <h3 className="font-bold text-white text-xl leading-snug mb-3">
                  &ldquo;{item.headline}&rdquo;
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-5"
                  dangerouslySetInnerHTML={{ __html: item.summary }}
                />
                <a
                  href="/press"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                  style={{ color: item.color }}
                >
                  Read article
                  <ExternalLink size={13} />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Facts */}
      <section className="py-20" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Company facts
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Key facts for journalists and analysts writing about Cura. For
                the most up-to-date figures, please contact our press team
                before publication.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {companyFacts.map((fact, i) => (
                  <motion.div
                    key={fact.label}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="glass rounded-xl p-5 flex items-start gap-4"
                    style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${fact.color}22` }}
                    >
                      <fact.icon size={18} style={{ color: fact.color }} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">{fact.label}</div>
                      <div className="font-bold text-white text-sm">{fact.value}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div
                className="mt-6 glass rounded-xl p-5"
                style={{ border: "1px solid rgba(124,58,237,0.2)" }}
              >
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-semibold">
                  Company description (for use in press)
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Cura is the UK&apos;s leading care home management platform,
                  combining digital care records, AI-powered care planning,
                  medication management, and compliance tools in a single
                  integrated system. Founded in 2022 and headquartered in
                  London, Cura serves over 500 care homes across England and
                  Wales.
                </p>
              </div>
            </motion.div>

            {/* Media Assets */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Media assets
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Download approved brand assets for editorial use. Please review
                our brand guidelines before publication.
              </p>
              <div className="space-y-4">
                {mediaAssets.map((asset, i) => (
                  <motion.div
                    key={asset.title}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="glass glass-hover rounded-xl p-4 flex items-center gap-4"
                    style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${asset.color}22` }}
                    >
                      <asset.icon size={20} style={{ color: asset.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm">
                        {asset.title}
                      </div>
                      <div className="text-gray-500 text-xs mt-0.5">
                        {asset.description}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-gray-600 text-xs mb-1.5">
                        {asset.fileType}
                      </div>
                      <button
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        style={{
                          background: `${asset.color}22`,
                          color: asset.color,
                          border: `1px solid ${asset.color}33`,
                        }}
                      >
                        <Download size={11} />
                        Download
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Press Contact CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12 relative overflow-hidden"
            style={{ border: "1px solid rgba(59,130,246,0.2)" }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(59,130,246,0.1), transparent)",
              }}
            />
            <div className="relative">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: "rgba(59,130,246,0.2)" }}
              >
                <Mail size={24} style={{ color: "#93c5fd" }} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                For media enquiries
              </h2>
              <p className="text-gray-400 text-lg mb-3 max-w-md mx-auto">
                Our press team is available Monday to Friday, 9am–6pm GMT. We
                typically respond within 4 hours for time-sensitive requests.
              </p>
              <div
                className="inline-block px-5 py-3 rounded-xl mb-8 font-mono text-sm"
                style={{
                  background: "rgba(59,130,246,0.1)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  color: "#93c5fd",
                }}
              >
                press@curacareplatform.co.uk
              </div>
              <div>
                <a
                  href="mailto:press@curacareplatform.co.uk"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white text-lg glow-button"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
                >
                  Contact our press team
                  <ArrowRight size={18} />
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
