import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Search,
  BookOpen,
  Code2,
  Plug,
  Database,
  LayoutDashboard,
  Users,
  Shield,
  Bell,
  UserCircle,
  ClipboardList,
  Pill,
  Map,
  Activity,
  UserCheck,
  Calendar,
  GraduationCap,
  ShieldCheck,
  FileSearch,
  AlertTriangle,
  Heart,
  CreditCard,
  Landmark,
  Package,
  Terminal,
  Webhook,
  Download,
  Lock,
  Smartphone,
  ArrowRight,
  Clock,
  ChevronRight,
} from "lucide-react";

const quickStart = [
  {
    icon: Clock,
    label: "Getting Started",
    desc: "Up and running in 5 minutes",
    badge: "5 min",
    color: "#7c3aed",
  },
  {
    icon: Code2,
    label: "API Reference",
    desc: "Full REST & GraphQL API docs",
    badge: "Reference",
    color: "#14b8a6",
  },
  {
    icon: Plug,
    label: "Integrations Guide",
    desc: "Connect your existing tools",
    badge: "Guide",
    color: "#10b981",
  },
  {
    icon: Database,
    label: "Data Import",
    desc: "Migrate from your current system",
    badge: "Migration",
    color: "#f59e0b",
  },
];

const categories = [
  {
    title: "Core Platform",
    color: "#7c3aed",
    items: [
      { icon: LayoutDashboard, label: "Dashboard Overview" },
      { icon: Users,           label: "User Management" },
      { icon: Shield,          label: "Roles & Permissions" },
      { icon: Bell,            label: "Notifications" },
    ],
  },
  {
    title: "Resident Management",
    color: "#14b8a6",
    items: [
      { icon: UserCircle,    label: "Resident Profiles" },
      { icon: ClipboardList, label: "Care Plans" },
      { icon: Pill,          label: "Medication (eMAR)" },
      { icon: Map,           label: "Body Map" },
      { icon: Activity,      label: "Vitals" },
    ],
  },
  {
    title: "Staff & HR",
    color: "#10b981",
    items: [
      { icon: UserCheck,     label: "Staff Profiles" },
      { icon: Calendar,      label: "Rota Management" },
      { icon: Clock,         label: "Leave Management" },
      { icon: GraduationCap, label: "Training Records" },
    ],
  },
  {
    title: "Compliance",
    color: "#f59e0b",
    items: [
      { icon: ShieldCheck,    label: "CQC Readiness" },
      { icon: FileSearch,     label: "Audit Trail" },
      { icon: AlertTriangle,  label: "Incident Reporting" },
      { icon: Heart,          label: "Safeguarding" },
    ],
  },
  {
    title: "Finance",
    color: "#ec4899",
    items: [
      { icon: CreditCard, label: "Billing & Invoicing" },
      { icon: Landmark,   label: "Funding Sources" },
      { icon: Package,    label: "Pharmacy Stock" },
    ],
  },
  {
    title: "Technical",
    color: "#06b6d4",
    items: [
      { icon: Terminal,    label: "API Reference" },
      { icon: Webhook,     label: "Webhooks" },
      { icon: Download,    label: "Data Export" },
      { icon: Lock,        label: "SSO Setup" },
      { icon: Smartphone,  label: "Mobile App" },
    ],
  },
];

export default function DocsPage() {
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
        <div className="dot-grid absolute inset-0 opacity-30 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium text-purple-300 mb-6"
            style={{ border: "1px solid rgba(124,58,237,0.35)", background: "rgba(124,58,237,0.1)" }}
          >
            <BookOpen size={12} />
            Documentation
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Cura{" "}
            <span className="gradient-text">Documentation</span>
          </h1>
          <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto">
            Everything you need to get the most out of Cura. Guides, API references, and in-depth
            articles for every feature.
          </p>

          {/* Search bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search
              size={20}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search documentation…"
              className="w-full pl-14 pr-6 py-4 rounded-2xl text-white placeholder-gray-500 text-lg outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
            <kbd
              className="absolute right-5 top-1/2 -translate-y-1/2 text-xs text-gray-600 px-2 py-1 rounded"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              ⌘K
            </kbd>
          </div>
        </div>
      </section>

      {/* Quick start */}
      <section className="pb-20 max-w-7xl mx-auto px-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-6">
          Quick Start
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStart.map(({ icon: Icon, label, desc, badge, color }) => (
            <a
              key={label}
              href={label === "API Reference" ? "/docs/api" : "/help"}
              className="glass glass-hover rounded-2xl p-6 group cursor-pointer"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${color}22`, border: `1px solid ${color}44` }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-semibold text-sm">{label}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: `${color}22`, color }}
                >
                  {badge}
                </span>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs" style={{ color }}>
                Read guide <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="pb-24 max-w-7xl mx-auto px-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-6">
          Browse by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(({ title, color, items }) => (
            <div
              key={title}
              className="glass rounded-2xl p-6"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                />
                <h3 className="text-white font-semibold">{title}</h3>
              </div>
              <ul className="space-y-1">
                {items.map(({ icon: Icon, label }) => (
                  <li key={label}>
                    <a
                      href={label === "API Reference" || label === "Webhooks" ? "/docs/api" : "/help"}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
                    >
                      <Icon size={15} style={{ color }} className="shrink-0" />
                      <span className="text-sm">{label}</span>
                      <ChevronRight
                        size={13}
                        className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color }}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Support CTA */}
      <section className="pb-24 max-w-7xl mx-auto px-6">
        <div
          className="glass rounded-3xl p-10 text-center relative overflow-hidden"
          style={{ border: "1px solid rgba(124,58,237,0.25)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(124,58,237,0.1), transparent)",
            }}
          />
          <div className="relative">
            <h3 className="text-2xl font-bold text-white mb-3">
              Can&apos;t find what you&apos;re looking for?
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Our support team is on hand to help with any questions not covered in the docs.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-semibold glow-button"
              style={{ background: "linear-gradient(135deg, #7c3aed, #14b8a6)" }}
            >
              Contact Support
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
