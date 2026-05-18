"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, Calendar, Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Category =
  | "All"
  | "Compliance"
  | "AI & Technology"
  | "Industry"
  | "HR & Staffing"
  | "Care Quality"
  | "Safeguarding"
  | "Business";

const categoryColors: Record<Category, { bg: string; text: string; border: string }> = {
  All: { bg: "rgba(124,58,237,0.15)", text: "#c084fc", border: "rgba(124,58,237,0.3)" },
  Compliance: { bg: "rgba(239,68,68,0.15)", text: "#fca5a5", border: "rgba(239,68,68,0.3)" },
  "AI & Technology": { bg: "rgba(124,58,237,0.15)", text: "#c084fc", border: "rgba(124,58,237,0.3)" },
  Industry: { bg: "rgba(59,130,246,0.15)", text: "#93c5fd", border: "rgba(59,130,246,0.3)" },
  "HR & Staffing": { bg: "rgba(16,185,129,0.15)", text: "#6ee7b7", border: "rgba(16,185,129,0.3)" },
  "Care Quality": { bg: "rgba(6,182,212,0.15)", text: "#67e8f9", border: "rgba(6,182,212,0.3)" },
  Safeguarding: { bg: "rgba(245,158,11,0.15)", text: "#fcd34d", border: "rgba(245,158,11,0.3)" },
  Business: { bg: "rgba(244,114,182,0.15)", text: "#f9a8d4", border: "rgba(244,114,182,0.3)" },
};

const posts = [
  {
    slug: "cqc-inspection-prep-2025-checklist",
    title: "CQC Inspection Prep: The Complete 2025 Checklist",
    date: "May 12, 2025",
    category: "Compliance" as Category,
    excerpt:
      "Everything care home managers need to know before a CQC inspection in 2025 — from evidence folders to digital records and staff interviews.",
    readTime: "8 min read",
    featured: true,
  },
  {
    slug: "ai-medication-safety-uk-care-homes",
    title: "How AI is Transforming Medication Safety in UK Care Homes",
    date: "May 5, 2025",
    category: "AI & Technology" as Category,
    excerpt:
      "AI-powered eMAR systems are catching administration errors before they happen. Here's what the data shows about outcomes in early adopter homes.",
    readTime: "6 min read",
    featured: false,
  },
  {
    slug: "true-cost-paper-based-care-records",
    title: "The True Cost of Paper-Based Care Records",
    date: "Apr 28, 2025",
    category: "Industry" as Category,
    excerpt:
      "Beyond the filing cabinets and lost documents: how analogue care records cost the average home 14 hours of staff time per week.",
    readTime: "5 min read",
    featured: false,
  },
  {
    slug: "reduce-staff-turnover-care-home",
    title: "5 Ways to Reduce Staff Turnover in Your Care Home",
    date: "Apr 21, 2025",
    category: "HR & Staffing" as Category,
    excerpt:
      "Turnover in the care sector averages 34% annually. These five evidence-backed strategies are helping care homes retain their best people.",
    readTime: "7 min read",
    featured: false,
  },
  {
    slug: "gdpr-care-homes-2025",
    title: "GDPR in Care Homes: What You Need to Know in 2025",
    date: "Apr 14, 2025",
    category: "Compliance" as Category,
    excerpt:
      "ICO guidance has been updated. Here's how UK care homes need to handle resident data, consent records, and third-party access in 2025.",
    readTime: "9 min read",
    featured: false,
  },
  {
    slug: "person-centred-care-plan-ai-assistance",
    title: "Building a Person-Centred Care Plan with AI Assistance",
    date: "Apr 7, 2025",
    category: "Care Quality" as Category,
    excerpt:
      "AI can draft structured care plans in minutes — but great care is always person-centred. How to use AI as a starting point, not a substitute.",
    readTime: "6 min read",
    featured: false,
  },
  {
    slug: "safeguarding-best-practices-care-home-managers",
    title: "Safeguarding Best Practices: A Guide for Care Home Managers",
    date: "Mar 31, 2025",
    category: "Safeguarding" as Category,
    excerpt:
      "A practical framework for building robust safeguarding processes — from incident reporting and escalation pathways to DOLS applications.",
    readTime: "10 min read",
    featured: false,
  },
  {
    slug: "digital-care-records-vs-paper-roi",
    title: "Digital Care Records vs Paper: ROI Analysis",
    date: "Mar 24, 2025",
    category: "Business" as Category,
    excerpt:
      "We analysed data from 200 care homes that switched from paper to digital in 2024. The ROI figures are striking — and the payback period might surprise you.",
    readTime: "8 min read",
    featured: false,
  },
];

const categories: Category[] = [
  "All",
  "Compliance",
  "AI & Technology",
  "Industry",
  "HR & Staffing",
  "Care Quality",
  "Safeguarding",
  "Business",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
};

function CategoryBadge({ category }: { category: Category }) {
  const colors = categoryColors[category];
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
    >
      <Tag size={10} />
      {category}
    </span>
  );
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      activeCategory === "All" || post.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = posts.find((p) => p.featured);
  const regularPosts = filteredPosts.filter((p) => !p.featured);
  const showFeatured =
    filteredPosts.some((p) => p.featured) && activeCategory === "All" && searchQuery === "";

  return (
    <main style={{ background: "#050914", minHeight: "100vh" }}>
      <Navbar />

      {/* Header */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div
          className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none pulse-glow"
          style={{ background: "rgba(124,58,237,0.12)" }}
        />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium"
              style={{
                background: "rgba(124,58,237,0.15)",
                border: "1px solid rgba(124,58,237,0.4)",
                color: "#c084fc",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              Insights &amp; Resources
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
              The <span className="gradient-text">Cura Blog</span>
            </h1>
            <p className="text-gray-400 text-xl max-w-xl mx-auto">
              Practical guides, industry insights, and expert advice for care
              home managers and operators across the UK.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="max-w-lg mx-auto mb-8"
          >
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-300 placeholder-gray-600 outline-none transition-all focus:border-violet-500/50"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
              />
            </div>
          </motion.div>

          {/* Category pills */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              const colors = categoryColors[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="text-sm px-4 py-2 rounded-full font-medium transition-all duration-200"
                  style={{
                    background: isActive ? colors.bg : "rgba(255,255,255,0.04)",
                    border: isActive
                      ? `1px solid ${colors.border}`
                      : "1px solid rgba(255,255,255,0.07)",
                    color: isActive ? colors.text : "#9ca3af",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Featured Post */}
      {showFeatured && featuredPost && (
        <section className="pb-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
              Featured
            </div>
            <motion.a
              href="/blog"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass glass-hover rounded-2xl p-8 lg:p-12 grid lg:grid-cols-2 gap-8 items-center block"
              style={{ border: "1px solid rgba(124,58,237,0.2)" }}
            >
              <div>
                <div className="mb-4">
                  <CategoryBadge category={featuredPost.category} />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
                  {featuredPost.title}
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-6">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {featuredPost.date}
                  </span>
                  <span>{featuredPost.readTime}</span>
                </div>
              </div>
              <div
                className="rounded-xl flex items-center justify-center h-64 relative overflow-hidden"
                style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(124,58,237,0.15), transparent)",
                  }}
                />
                <div className="relative text-center px-6">
                  <div className="text-6xl font-black gradient-text leading-none mb-2">
                    2025
                  </div>
                  <div className="text-gray-400 font-medium">CQC Inspection Checklist</div>
                </div>
              </div>
            </motion.a>
          </div>
        </section>
      )}

      {/* Post Grid */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {regularPosts.length === 0 && !showFeatured ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No articles found. Try a different search or category.</p>
            </div>
          ) : (
            <>
              {(showFeatured || regularPosts.length > 0) && (
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-6">
                  {activeCategory === "All" && searchQuery === ""
                    ? "Recent Articles"
                    : `${filteredPosts.filter((p) => !p.featured).length} article${regularPosts.length !== 1 ? "s" : ""}`}
                </div>
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPosts.map((post, i) => (
                  <motion.a
                    key={post.slug}
                    href="/blog"
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="glass glass-hover rounded-2xl p-6 flex flex-col group block"
                    style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div className="mb-4">
                      <CategoryBadge category={post.category} />
                    </div>
                    <h3 className="text-lg font-bold text-white leading-snug mb-3 group-hover:text-violet-300 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-5">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {post.date}
                        </span>
                        <span>{post.readTime}</span>
                      </div>
                      <span className="flex items-center gap-1 text-xs font-semibold text-violet-400 group-hover:gap-2 transition-all">
                        Read more <ArrowRight size={12} />
                      </span>
                    </div>
                  </motion.a>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="pb-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-10"
            style={{ border: "1px solid rgba(124,58,237,0.2)" }}
          >
            <h3 className="text-2xl font-bold text-white mb-3">
              Stay ahead in care
            </h3>
            <p className="text-gray-400 mb-6">
              Get the latest insights, CQC updates, and best practices delivered
              to your inbox every two weeks.
            </p>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-xl text-gray-300 placeholder-gray-600 outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
              />
              <button
                className="px-6 py-3 rounded-xl font-semibold text-white text-sm glow-button"
                style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}
              >
                Subscribe
              </button>
            </div>
            <p className="text-gray-600 text-xs mt-3">
              No spam. Unsubscribe at any time.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
