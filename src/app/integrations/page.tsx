import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Plug, ArrowRight, Code2 } from "lucide-react";

const categories = [
  {
    name: "Pharmacy",
    color: "#0d9488",
    integrations: [
      { name: "Lloyds Pharmacy",    status: "live" },
      { name: "Boots Pharmacy",     status: "live" },
      { name: "Well Pharmacy",      status: "live" },
      { name: "Alphega Pharmacy",   status: "coming" },
    ],
  },
  {
    name: "GP Systems",
    color: "#10b981",
    integrations: [
      { name: "EMIS Web",    status: "live" },
      { name: "SystmOne",    status: "live" },
      { name: "Vision",      status: "live" },
      { name: "NHS Spine",   status: "live" },
    ],
  },
  {
    name: "Hospital / Acute",
    color: "#0d9488",
    integrations: [
      { name: "Lorenzo (CSC)",    status: "live" },
      { name: "Epic",             status: "coming" },
      { name: "Cerner Oracle",    status: "coming" },
      { name: "NHS Digital",      status: "live" },
    ],
  },
  {
    name: "Finance",
    color: "#10b981",
    integrations: [
      { name: "Xero",        status: "live" },
      { name: "Sage 50",     status: "live" },
      { name: "QuickBooks",  status: "live" },
      { name: "FreeAgent",   status: "coming" },
    ],
  },
  {
    name: "HR & Payroll",
    color: "#0d9488",
    integrations: [
      { name: "Sage HR",     status: "live" },
      { name: "BrightHR",    status: "live" },
      { name: "Breathe HR",  status: "coming" },
      { name: "ADP",         status: "coming" },
    ],
  },
  {
    name: "Communications",
    color: "#10b981",
    integrations: [
      { name: "Microsoft Teams",    status: "live" },
      { name: "Slack",              status: "live" },
      { name: "WhatsApp Business",  status: "live" },
      { name: "Twilio SMS",         status: "live" },
    ],
  },
  {
    name: "Clinical & AI Partners",
    color: "#0d9488",
    integrations: [
      { name: "PainChek (AI pain assessment)", status: "coming" },
      { name: "Wearables & fall sensors",      status: "live" },
      { name: "Ambient/passive monitoring",    status: "coming" },
      { name: "NHS TRUD (drug dictionary)",    status: "coming" },
    ],
  },
];

export default function IntegrationsPage() {
  return (
    <main id="main-content" style={{ background: "var(--bg-secondary)", minHeight: "100vh" }}>
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#0d9488" }}>Integrations</p>
            <h1 className="lp-serif text-4xl lg:text-5xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Connect everything in your<br />
              <span style={{ color: "#0d9488" }}>care ecosystem</span>
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-muted)" }}>
              Cura integrates with the tools your pharmacy, GP surgery, hospital, and finance team already use — so data flows seamlessly across the whole care pathway.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-20 max-w-2xl mx-auto text-center">
            {[
              { value: "30+",      label: "Live integrations" },
              { value: "REST API", label: "Open API standard" },
              { value: "Free",     label: "No integration fees" },
            ].map(({ value, label }) => (
              <div key={label} className="lp-card rounded-2xl p-6">
                <div className="lp-serif text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{value}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {categories.map(({ name, color, integrations }) => (
              <div key={name} className="lp-card rounded-2xl p-6" style={{ borderLeft: `3px solid ${color}` }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}12` }}>
                    <Plug size={16} style={{ color }} />
                  </div>
                  <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>{name}</h3>
                </div>
                <div className="space-y-2.5">
                  {integrations.map(({ name: iname, status }) => (
                    <div key={iname} className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{iname}</span>
                      {status === "live" ? (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: "rgba(13, 148, 136,0.1)", color: "#0d9488" }}>
                          Live
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                          Coming soon
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="lp-card rounded-2xl p-8 lg:p-12 text-center" style={{ borderTop: "3px solid #0d9488" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(13, 148, 136,0.1)", border: "1px solid rgba(13, 148, 136,0.2)" }}>
              <Code2 size={24} style={{ color: "#0d9488" }} />
            </div>
            <h2 className="lp-serif text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Open API for custom integrations</h2>
            <p className="mb-6 max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
              Build anything with our REST API. Full OpenAPI spec, webhook support, and a sandbox environment for testing. Our developer docs cover authentication, rate limits, and all available endpoints.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/docs/api" className="px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 justify-center transition-all"
                style={{ border: "1px solid var(--border)", color: "#0d9488", background: "var(--bg-secondary)" }}>
                View API docs <ArrowRight size={14} />
              </a>
              <a href="/contact" className="px-6 py-3 rounded-xl text-sm font-semibold text-white flex items-center gap-2 justify-center"
                style={{ background: "#0d9488" }}>
                Request an integration <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
