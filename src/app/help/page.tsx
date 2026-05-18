"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Search,
  HelpCircle,
  ChevronRight,
  ArrowRight,
  MessageCircle,
  BookOpen,
  CreditCard,
  UserCircle,
  Pill,
  Users,
  ShieldCheck,
  Plug,
  Wrench,
  Clock,
} from "lucide-react";

const popularArticles = [
  { title: "How to add a new resident", reads: "4.2k reads" },
  { title: "Setting up medication schedules", reads: "3.8k reads" },
  { title: "Managing staff rotas", reads: "3.1k reads" },
  { title: "Generating a CQC compliance report", reads: "2.9k reads" },
  { title: "How to record a care note", reads: "2.6k reads" },
  { title: "Setting up user roles and permissions", reads: "2.2k reads" },
  { title: "Exporting data for audits", reads: "1.9k reads" },
  { title: "How to use the AI assistant", reads: "1.7k reads" },
];

const categories = [
  { icon: BookOpen,   label: "Getting Started",     count: 12, color: "#7c3aed" },
  { icon: CreditCard, label: "Account & Billing",   count: 8,  color: "#3b82f6" },
  { icon: UserCircle, label: "Residents",            count: 24, color: "#10b981" },
  { icon: Pill,       label: "Medications",          count: 16, color: "#f59e0b" },
  { icon: Users,      label: "Staff Management",     count: 19, color: "#ec4899" },
  { icon: ShieldCheck,label: "Compliance",           count: 14, color: "#06b6d4" },
  { icon: Plug,       label: "Integrations",         count: 10, color: "#8b5cf6" },
  { icon: Wrench,     label: "Technical Issues",     count: 9,  color: "#ef4444" },
];

export default function HelpPage() {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? popularArticles.filter((a) =>
        a.title.toLowerCase().includes(query.toLowerCase())
      )
    : popularArticles;

  return (
    <main style={{ background: "#050914", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.15), transparent)",
          }}
        />
        <div className="dot-grid absolute inset-0 opacity-20 pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium text-blue-300 mb-6"
            style={{
              border: "1px solid rgba(59,130,246,0.35)",
              background: "rgba(59,130,246,0.1)",
            }}
          >
            <HelpCircle size={12} />
            Help Centre
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            How can we{" "}
            <span className="gradient-text">help?</span>
          </h1>
          <p className="text-gray-400 text-lg mb-10">
            Search our knowledge base or browse by category below.
          </p>

          {/* Search */}
          <div className="relative">
            <Search
              size={20}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search for articles, guides, and FAQs…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl text-white placeholder-gray-500 text-lg outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
          </div>
        </div>
      </section>

      {/* Popular articles */}
      <section className="pb-20 max-w-4xl mx-auto px-6">
        <h2 className="text-white font-semibold text-lg mb-6">
          {query.trim() ? `Results for "${query}"` : "Popular Articles"}
        </h2>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No articles match your search. Try different keywords or{" "}
            <a href="/contact" className="text-purple-400 hover:underline">
              contact support
            </a>
            .
          </div>
        ) : (
          <div
            className="glass rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {filtered.map((article, i) => (
              <a
                key={article.title}
                href="/help"
                className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors group"
                style={{
                  borderBottom:
                    i < filtered.length - 1
                      ? "1px solid rgba(255,255,255,0.05)"
                      : "none",
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(124,58,237,0.15)" }}
                  >
                    <BookOpen size={13} className="text-purple-400" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors text-sm">
                    {article.title}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-600 hidden sm:block">
                    {article.reads}
                  </span>
                  <ChevronRight
                    size={16}
                    className="text-gray-600 group-hover:text-purple-400 transition-colors"
                  />
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="pb-20 max-w-7xl mx-auto px-6">
        <h2 className="text-white font-semibold text-lg mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(({ icon: Icon, label, count, color }) => (
            <a
              key={label}
              href="/help"
              className="glass glass-hover rounded-2xl p-5 group cursor-pointer"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${color}22`, border: `1px solid ${color}44` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <p className="text-white text-sm font-medium mb-1">{label}</p>
              <p className="text-gray-500 text-xs">{count} articles</p>
            </a>
          ))}
        </div>
      </section>

      {/* Still stuck CTA */}
      <section className="pb-24 max-w-7xl mx-auto px-6">
        <div
          className="glass rounded-3xl p-10 relative overflow-hidden"
          style={{ border: "1px solid rgba(59,130,246,0.2)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 50% 80% at 0% 50%, rgba(59,130,246,0.08), transparent)",
            }}
          />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Still stuck?</h3>
              <p className="text-gray-400 max-w-md">
                Our UK-based support team is available to help you through any issue — no chatbots,
                just real people who know Cura inside out.
              </p>
              <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-green-400" />
                  <span>Mon–Fri&nbsp;&nbsp;8am–8pm</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-blue-400" />
                  <span>Sat&nbsp;&nbsp;9am–5pm</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold glow-button"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
              >
                <MessageCircle size={16} />
                Chat with Support
              </button>
              <a
                href="/contact"
                className="flex items-center gap-2 px-6 py-3 rounded-full text-gray-300 hover:text-white font-medium transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              >
                Send a Message
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
