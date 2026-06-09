import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Plug, ArrowRight, CheckCircle, Code2 } from "lucide-react";

const categories = [
  {
    name: "Pharmacy",
    color: "#2d5a3d",
    integrations: [
      { name: "Lloyds Pharmacy",    status: "live" },
      { name: "Boots Pharmacy",     status: "live" },
      { name: "Well Pharmacy",      status: "live" },
      { name: "Alphega Pharmacy",   status: "coming" },
    ],
  },
  {
    name: "GP Systems",
    color: "#b8923a",
    integrations: [
      { name: "EMIS Web",    status: "live" },
      { name: "SystmOne",    status: "live" },
      { name: "Vision",      status: "live" },
      { name: "NHS Spine",   status: "live" },
    ],
  },
  {
    name: "Hospital / Acute",
    color: "#2d5a3d",
    integrations: [
      { name: "Lorenzo (CSC)",    status: "live" },
      { name: "Epic",             status: "coming" },
      { name: "Cerner Oracle",    status: "coming" },
      { name: "NHS Digital",      status: "live" },
    ],
  },
  {
    name: "Finance",
    color: "#b8923a",
    integrations: [
      { name: "Xero",        status: "live" },
      { name: "Sage 50",     status: "live" },
      { name: "QuickBooks",  status: "live" },
      { name: "FreeAgent",   status: "coming" },
    ],
  },
  {
    name: "HR & Payroll",
    color: "#2d5a3d",
    integrations: [
      { name: "Sage HR",     status: "live" },
      { name: "BrightHR",    status: "live" },
      { name: "Breathe HR",  status: "coming" },
      { name: "ADP",         status: "coming" },
    ],
  },
  {
    name: "Communications",
    color: "#b8923a",
    integrations: [
      { name: "Microsoft Teams",    status: "live" },
      { name: "Slack",              status: "live" },
      { name: "WhatsApp Business",  status: "live" },
      { name: "Twilio SMS",         status: "live" },
    ],
  },
];

export default function IntegrationsPage() {
  return (
    <main style={{ background: "#faf7f0", minHeight: "100vh" }}>
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#2d5a3d" }}>Integrations</p>
            <h1 className="lp-serif text-4xl lg:text-5xl font-bold mb-4" style={{ color: "#1c1a14" }}>
              Connect everything in your<br />
              <span style={{ color: "#2d5a3d" }}>care ecosystem</span>
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#7a7468" }}>
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
                <div className="lp-serif text-2xl font-bold mb-1" style={{ color: "#1c1a14" }}>{value}</div>
                <div className="text-xs" style={{ color: "#7a7468" }}>{label}</div>
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
                  <h3 className="font-semibold" style={{ color: "#1c1a14" }}>{name}</h3>
                </div>
                <div className="space-y-2.5">
                  {integrations.map(({ name: iname, status }) => (
                    <div key={iname} className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: "#4a4438" }}>{iname}</span>
                      {status === "live" ? (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: "rgba(45,90,61,0.1)", color: "#2d5a3d" }}>
                          Live
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "#f3ede1", color: "#7a7468", border: "1px solid #dfd8cc" }}>
                          Coming soon
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="lp-card rounded-2xl p-8 lg:p-12 text-center" style={{ borderTop: "3px solid #2d5a3d" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(45,90,61,0.1)", border: "1px solid rgba(45,90,61,0.2)" }}>
              <Code2 size={24} style={{ color: "#2d5a3d" }} />
            </div>
            <h2 className="lp-serif text-2xl font-bold mb-3" style={{ color: "#1c1a14" }}>Open API for custom integrations</h2>
            <p className="mb-6 max-w-xl mx-auto" style={{ color: "#7a7468" }}>
              Build anything with our REST API. Full OpenAPI spec, webhook support, and a sandbox environment for testing. Our developer docs cover authentication, rate limits, and all available endpoints.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/docs" className="px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 justify-center transition-all"
                style={{ border: "1px solid #dfd8cc", color: "#2d5a3d", background: "#faf7f0" }}>
                View API docs <ArrowRight size={14} />
              </a>
              <a href="/contact" className="px-6 py-3 rounded-xl text-sm font-semibold text-white flex items-center gap-2 justify-center"
                style={{ background: "#2d5a3d" }}>
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
