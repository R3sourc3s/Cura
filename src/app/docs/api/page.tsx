import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { API_URL } from "@/lib/config";
import { Key, Webhook, Terminal, ShieldCheck, ArrowRight, ExternalLink } from "lucide-react";

const ENDPOINTS = [
  { method: "GET",   path: "/api/partner/v1/residents/", desc: "List residents at your care home (id, name, DOB, NHS number, room)." },
  { method: "GET",   path: "/api/partner/v1/medications/", desc: "Active medications, filterable by resident." },
  { method: "GET",   path: "/api/partner/v1/medications/low-stock/", desc: "Stock items currently at or below reorder threshold." },
  { method: "GET",   path: "/api/partner/v1/incidents/", desc: "Recent incident reports." },
  { method: "GET",   path: "/api/partner/v1/purchase-orders/", desc: "Pharmacy purchase orders and their status." },
  { method: "PATCH", path: "/api/partner/v1/purchase-orders/{id}/", desc: "Push order status updates back (submitted → confirmed → dispatched → delivered). Requires a read-write key." },
];

const EVENTS = [
  "incident.created", "medication.low_stock", "purchase_order.delivered",
  "prn.administered", "controlled_drug.recorded", "resident.admitted",
];

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="rounded-xl p-4 text-xs overflow-x-auto" style={{ background: "#0b0f19", border: "1px solid rgba(255,255,255,0.08)", color: "#d1d5db" }}>
      <code>{children}</code>
    </pre>
  );
}

export default function PartnerApiDocsPage() {
  return (
    <main id="main-content" style={{ background: "var(--bg-secondary)", minHeight: "100vh" }}>
      <Navbar />

      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#0d9488" }}>Developer Docs</p>
          <h1 className="lp-serif text-4xl lg:text-5xl font-bold mb-5" style={{ color: "var(--text-primary)" }}>
            Partner API Reference
          </h1>
          <p className="text-lg max-w-2xl" style={{ color: "var(--text-muted)" }}>
            A real, open REST API — not just a marketing claim. Generate a key from your Cura dashboard
            under <strong>Integrations</strong>, then read and write directly against your care home&apos;s data.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <a href={`${API_URL}/api/partner/v1/docs/`} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: "#0d9488" }}>
              Interactive API explorer <ExternalLink size={14} />
            </a>
            <a href={`${API_URL}/api/partner/v1/schema/`} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
              style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}>
              Raw OpenAPI schema <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto space-y-12">

          {/* Auth */}
          <div className="lp-card rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(13,148,136,0.1)" }}>
                <Key size={16} style={{ color: "#0d9488" }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Authentication</h2>
            </div>
            <p className="mb-4" style={{ color: "var(--text-muted)" }}>
              Every request carries an API key as a bearer token. Keys are scoped <strong>read-only</strong> or{" "}
              <strong>read-write</strong> — write access (e.g. updating a purchase order status) is rejected for read-only keys.
              The raw key is shown once at creation time and never stored in full — treat it like a password.
            </p>
            <CodeBlock>{`curl ${API_URL}/api/partner/v1/residents/ \\
  -H "Authorization: Bearer cura_a1b2c3d4.<your-secret>"`}</CodeBlock>
          </div>

          {/* Endpoints */}
          <div className="lp-card rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.1)" }}>
                <Terminal size={16} style={{ color: "#10b981" }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Endpoints</h2>
            </div>
            <div className="space-y-2">
              {ENDPOINTS.map((e) => (
                <div key={e.path} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded flex-shrink-0 w-fit"
                    style={{ background: e.method === "GET" ? "rgba(13,148,136,0.1)" : "rgba(245,158,11,0.12)", color: e.method === "GET" ? "#0d9488" : "#f59e0b" }}>
                    {e.method}
                  </span>
                  <code className="text-sm flex-shrink-0" style={{ color: "var(--text-primary)" }}>{e.path}</code>
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>{e.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Webhooks */}
          <div className="lp-card rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.1)" }}>
                <Webhook size={16} style={{ color: "#7c3aed" }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Webhooks</h2>
            </div>
            <p className="mb-4" style={{ color: "var(--text-muted)" }}>
              Subscribe a URL to real-time events from the Integrations page in your dashboard. Every delivery
              is signed with HMAC-SHA256 so you can verify it genuinely came from Cura.
            </p>
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Available events</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {EVENTS.map((e) => (
                <code key={e} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>{e}</code>
              ))}
            </div>
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Verifying the signature</p>
            <CodeBlock>{`import hmac, hashlib

signature = request.headers["X-Cura-Signature"].removeprefix("sha256=")
expected = hmac.new(webhook_secret.encode(), request.body, hashlib.sha256).hexdigest()
assert hmac.compare_digest(signature, expected)`}</CodeBlock>
          </div>

          {/* Trust */}
          <div className="lp-card rounded-2xl p-8" style={{ borderTop: "3px solid #0d9488" }}>
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck size={18} style={{ color: "#0d9488" }} />
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Rate limits &amp; data scope</h2>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Partner API traffic is limited to 1,000 requests/hour per key. Every key and webhook is scoped to a
              single care home — a partner can never see data belonging to a different customer. Keys can be
              revoked instantly from the dashboard; revocation takes effect immediately.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
