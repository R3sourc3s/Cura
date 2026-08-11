import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Play,
  Calendar,
  Clock,
  Users,
  Video,
  Eye,
  Mail,
  Mic,
} from "lucide-react";

const upcoming = [
  {
    title: "CQC Inspection Readiness: Live Q&A",
    date: "June 5, 2025",
    time: "14:00 BST",
    duration: "45 min",
    speaker: "Sarah Chen",
    role: "Head of Compliance, Cura",
    tag: "Compliance",
    tagColor: "#f59e0b",
    spots: 142,
  },
  {
    title: "Getting the Most from AI Care Plans",
    date: "June 19, 2025",
    time: "10:00 BST",
    duration: "30 min",
    speaker: "Dr. James Okoro",
    role: "Clinical Lead, Cura",
    tag: "AI & Innovation",
    tagColor: "#7c3aed",
    spots: 89,
  },
  {
    title: "Medication Safety Workshop",
    date: "July 3, 2025",
    time: "14:00 BST",
    duration: "60 min",
    speaker: "Fiona Clarke",
    role: "Pharmacist Partner",
    tag: "Medications",
    tagColor: "#10b981",
    spots: 230,
  },
];

const past = [
  {
    title: "Introduction to Cura's Compliance Engine",
    date: "Apr 10, 2025",
    views: "847",
    duration: "38 min",
    tag: "Compliance",
    tagColor: "#f59e0b",
  },
  {
    title: "eMAR Best Practices for Nursing Homes",
    date: "Mar 27, 2025",
    views: "1,203",
    duration: "52 min",
    tag: "Medications",
    tagColor: "#10b981",
  },
  {
    title: "Digital Transformation in UK Care",
    date: "Mar 13, 2025",
    views: "2,104",
    duration: "44 min",
    tag: "Strategy",
    tagColor: "#14b8a6",
  },
  {
    title: "Setting Up Your First Rota",
    date: "Feb 27, 2025",
    views: "678",
    duration: "29 min",
    tag: "Staff Management",
    tagColor: "#ec4899",
  },
];

export default function WebinarsPage() {
  return (
    <main id="main-content" style={{ background: "#050914", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,58,237,0.18), transparent)",
          }}
        />
        <div className="dot-grid absolute inset-0 opacity-25 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium text-purple-300 mb-6"
            style={{
              border: "1px solid rgba(124,58,237,0.35)",
              background: "rgba(124,58,237,0.1)",
            }}
          >
            <Video size={12} />
            Live & On-Demand
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Learn from{" "}
            <span className="gradient-text">care home experts</span>
          </h1>
          <p className="text-gray-400 text-xl mb-8 max-w-2xl mx-auto">
            Free live webinars and on-demand recordings covering compliance, medication safety, digital
            transformation, and everything Cura.
          </p>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>3 upcoming sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={14} />
              <span>4,000+ total views</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} />
              <span>Always free</span>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming webinars */}
      <section className="pb-20 max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <h2 className="text-white font-semibold text-xl">Upcoming Webinars</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {upcoming.map((w) => (
            <div
              key={w.title}
              className="glass glass-hover rounded-2xl p-6 flex flex-col"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-start justify-between mb-4">
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{
                    background: `${w.tagColor}22`,
                    color: w.tagColor,
                    border: `1px solid ${w.tagColor}44`,
                  }}
                >
                  {w.tag}
                </span>
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  {w.spots} spots left
                </span>
              </div>

              <h3 className="text-white font-semibold text-lg mb-4 leading-snug flex-1">
                {w.title}
              </h3>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar size={14} className="text-gray-500 shrink-0" />
                  {w.date} at {w.time}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock size={14} className="text-gray-500 shrink-0" />
                  {w.duration}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Mic size={14} className="text-gray-500 shrink-0" />
                  {w.speaker} &mdash; {w.role}
                </div>
              </div>

              <button
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #7c3aed, #14b8a6)" }}
              >
                Register Free
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Past webinars */}
      <section className="pb-24 max-w-7xl mx-auto px-6">
        <h2 className="text-white font-semibold text-xl mb-8">Past Recordings</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {past.map((w) => (
            <div
              key={w.title}
              className="glass glass-hover rounded-2xl p-6 flex items-center gap-5 group"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {/* Thumbnail placeholder */}
              <div
                className="w-20 h-14 rounded-xl shrink-0 flex items-center justify-center relative overflow-hidden"
                style={{ background: "rgba(124,58,237,0.15)" }}
              >
                <Play size={22} className="text-purple-300 group-hover:scale-110 transition-transform" fill="rgba(167,139,250,0.7)" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      background: `${w.tagColor}22`,
                      color: w.tagColor,
                    }}
                  >
                    {w.tag}
                  </span>
                </div>
                <h3 className="text-white text-sm font-medium leading-snug mb-1 truncate">
                  {w.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{w.date}</span>
                  <span>·</span>
                  <span>{w.duration}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Eye size={11} />
                    {w.views}
                  </span>
                </div>
              </div>

              <button
                className="shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg text-purple-300 hover:text-white transition-colors"
                style={{ border: "1px solid rgba(124,58,237,0.3)" }}
              >
                <Play size={11} fill="currentColor" />
                Watch
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter signup */}
      <section className="pb-24 max-w-7xl mx-auto px-6">
        <div
          className="glass rounded-3xl p-10 md:p-14 relative overflow-hidden text-center"
          style={{ border: "1px solid rgba(124,58,237,0.25)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 80% at 50% 120%, rgba(124,58,237,0.12), transparent)",
            }}
          />
          <div className="relative max-w-xl mx-auto">
            <Mail size={32} className="text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Never miss a session
            </h3>
            <p className="text-gray-400 mb-8">
              Get notified when new webinars are announced — plus exclusive early-access links for
              subscribers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-5 py-3 rounded-xl text-white placeholder-gray-500 outline-none text-sm focus:ring-2 focus:ring-purple-500/50 transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
              <button
                className="px-6 py-3 rounded-xl text-white font-semibold text-sm glow-button shrink-0"
                style={{ background: "linear-gradient(135deg, #7c3aed, #14b8a6)" }}
              >
                Subscribe
              </button>
            </div>
            <p className="text-gray-600 text-xs mt-4">
              No spam. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
