import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Plug, ArrowRight, CheckCircle, Code2 } from "lucide-react";

const categories = [
  {
    name: "Pharmacy",
    color: "#7c3aed",
    integrations: [
      { name: "Lloyds Pharmacy", status: "live" },
      { name: "Boots Pharmacy", status: "live" },
      { name: "Well Pharmacy", status: "live" },
      { name: "Alphega Pharmacy", status: "coming" },
    ],
  },
  {
    name: "GP Systems",
    color: "#3b82f6",
    integrations: [
      { name: "EMIS Web", status: "live" },
      { name: "SystmOne", status: "live" },
      { name: "Vision", status: "live" },
      { name: "NHS Spine", status: "live" },
    ],
  },
  {
    name: "Hospital / Acute",
    color: "#06b6d4",
    integrations: [
      { name: "Lorenzo (CSC)", status: "live" },
      { name: "Epic", status: "coming" },
      { name: "Cerner Oracle", status: "coming" },
      { name: "NHS Digital", status: "live" },
    ],
  },
  {
    name: "Finance",
    color: "#10b981",
    integrations: [
      { name: "Xero", status: "live" },
      { name: "Sage 50", status: "live" },
      { name: "QuickBooks", status: "live" },
      { name: "FreeAgent", status: "coming" },
    ],
  },
  {
    name: "HR & Payroll",
    color: "#f59e0b",
    integrations: [
      { name: "Sage HR", status: "live" },
      { name: "BrightHR", status: "live" },
      { name: "Breathe HR", status: "coming" },
      { name: "ADP", status: "coming" },
    ],
  },
  {
    name: "Communications",
    color: "#ec4899",
    integrations: [
      { name: "Microsoft Teams", status: "live" },
      { name: "Slack", status: "live" },
      { name: "WhatsApp Business", status: "live" },
      { name: "Twilio SMS", status: "live" },
    ],
  },
];

export default function IntegrationsPage() {
  return (
    <main style={{ background: "#050914", minHeight: "100vh" }}>
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-20">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#a78bfa" }}>Integrations</p>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Connect everything in your<br />
              <span className="gradient-text">care ecosystem</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Cura integrates with the tools your pharmacy, GP surgery, hospital, and finance team already use — so data flows seamlessly across the whole care pathway.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-20 max-w-2xl mx-auto text-center">
            {[
              { value: "30+", label: "Live integrations" },
              { value: "REST API", label: "Open API standard" },
              { value: "Free", label: "No integration fees" },
            ].map(({ value, label }) => (
              <div key={label} className="glass rounded-2xl p-6" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="text-2xl font-bold text-white mb-1">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>

          {/* Integration categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {categories.map(({ name, color, integrations }) => (
              <div key={name} className="glass rounded-2xl p-6" style={{ border: `1px solid ${color}22` }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}22` }}>
                    <Plug size={16} style={{ color }} />
                  </div>
                  <h3 className="text-white font-semibold">{name}</h3>
                </div>
                <div className="space-y-2.5">
                  {integrations.map(({ name: iname, status }) => (
                    <div key={iname} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{iname}</span>
                      {status === "live" ? (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
                          Live
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "#6b7280" }}>
                          Coming soon
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* API section */}
          <div className="rounded-2xl p-8 lg:p-12 text-center" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(59,130,246,0.08))", border: "1px solid rgba(124,58,237,0.2)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}>
              <Code2 size={24} style={{ color: "#a78bfa" }} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Open API for custom integrations</h2>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              Build anything with our REST API. Full OpenAPI spec, webhook support, and a sandbox environment for testing. Our developer docs cover authentication, rate limits, and all available endpoints.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {[
                { label: "View API docs", href: "/docs", style: "border" },
                { label: "Request an integration", href: "/contact", style: "gradient" },
              ].map(({ label, href, style }) => (
                <a key={label} href={href} className={`px-6 py-3 rounded-xl text-sm font-semibold text-white flex items-center gap-2 justify-center ${style === "gradient" ? "glow-button" : ""}`}
                  style={style === "gradient" ? { background: "linear-gradient(135deg, #7c3aed, #3b82f6)" } : { border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)" }}>
                  {label} <ArrowRight size={14} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
