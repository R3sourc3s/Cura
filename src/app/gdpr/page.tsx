import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Server, UserCheck, Bell } from "lucide-react";

const pillars = [
  { icon: Shield,    title: "Data Protection by Design",   desc: "Privacy is embedded into every feature from the start, not bolted on afterwards.",                                          color: "#0d9488" },
  { icon: Server,    title: "UK Data Residency",            desc: "All data is stored and processed in the UK. No transfers to third countries without adequate safeguards.",                  color: "#10b981" },
  { icon: UserCheck, title: "Lawful Basis for Every Process", desc: "Every processing activity has a documented lawful basis under Article 6 or Article 9 UK GDPR.",                       color: "#0d9488" },
  { icon: Bell,      title: "72-Hour Breach Notification",  desc: "We notify the ICO within 72 hours of becoming aware of a personal data breach, as required.",                              color: "#10b981" },
];

const subProcessors = [
  { name: "Amazon Web Services (AWS)", purpose: "Cloud infrastructure and data storage",  location: "UK (eu-west-2)" },
  { name: "SendGrid (Twilio)",         purpose: "Transactional email delivery",            location: "EU (Standard Contractual Clauses)" },
  { name: "Stripe",                    purpose: "Payment processing (billing data only)",  location: "EU/UK (Standard Contractual Clauses)" },
  { name: "Google Analytics",          purpose: "Website analytics (anonymised)",          location: "EU (Standard Contractual Clauses)" },
];

export default function GDPRPage() {
  return (
    <main id="main-content" style={{ background: "var(--bg-secondary)", minHeight: "100vh" }}>
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#0d9488" }}>Legal</p>
            <h1 className="lp-serif text-4xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>GDPR Statement</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Last updated: May 2025 &nbsp;·&nbsp; Cura Ltd, registered in England &amp; Wales (Company No. 14XXXXXX)</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {pillars.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="lp-card rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>{title}</h3>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{desc}</p>
              </div>
            ))}
          </div>

          <div className="space-y-10 leading-relaxed" style={{ color: "var(--text-muted)" }}>

            <section>
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>1. Our Commitment to UK GDPR</h2>
              <p>Cura Ltd (&quot;Cura&quot;, &quot;we&quot;, &quot;us&quot;) is committed to processing personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. This statement sets out our approach to data protection for care home operators and their residents, staff, and families who use our platform.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>2. Controller vs. Processor</h2>
              <p>Cura acts in different capacities depending on the data being processed:</p>
              <div className="mt-4 space-y-3">
                <div className="lp-card rounded-xl p-4" style={{ borderLeft: "3px solid #0d9488" }}>
                  <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>Data Controller — Staff &amp; Account Data</p>
                  <p className="text-sm">When we process personal data of care home managers, administrators, and staff members for the purposes of operating and improving the Cura platform, we act as a <strong style={{ color: "var(--text-secondary)" }}>data controller</strong>.</p>
                </div>
                <div className="lp-card rounded-xl p-4" style={{ borderLeft: "3px solid #10b981" }}>
                  <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>Data Processor — Resident &amp; Patient Data</p>
                  <p className="text-sm">When we process personal data of care home residents (including special category health data) on behalf of our care home customers, we act as a <strong style={{ color: "var(--text-secondary)" }}>data processor</strong>. The care home operator is the data controller and Cura processes this data solely on their instructions under our Data Processing Agreement (DPA).</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>3. Lawful Basis for Processing</h2>
              <p>Under Article 6 UK GDPR, our processing of personal data relies on the following lawful bases:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li><strong style={{ color: "var(--text-secondary)" }}>Contract (Art. 6(1)(b)):</strong> Processing necessary to provide the Cura platform under our Terms of Service.</li>
                <li><strong style={{ color: "var(--text-secondary)" }}>Legitimate Interests (Art. 6(1)(f)):</strong> For analytics, fraud prevention, and platform improvements.</li>
                <li><strong style={{ color: "var(--text-secondary)" }}>Legal Obligation (Art. 6(1)(c)):</strong> Where required by law (e.g., financial records retention).</li>
              </ul>
              <p className="mt-3">For <strong style={{ color: "var(--text-secondary)" }}>special category health data</strong> (Article 9 UK GDPR), processing by Cura as data processor is based on Article 9(2)(h) (healthcare purposes) and Article 9(2)(b) (employment context) as instructed by care home operators.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>4. Data Subject Rights</h2>
              <p>Under UK GDPR, individuals have the following rights, which we facilitate:</p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { right: "Right of Access (Art. 15)",       desc: "Request a copy of your personal data" },
                  { right: "Right to Rectification (Art. 16)", desc: "Correct inaccurate data" },
                  { right: "Right to Erasure (Art. 17)",       desc: "Request deletion where applicable" },
                  { right: "Right to Restriction (Art. 18)",   desc: "Limit how we use your data" },
                  { right: "Right to Portability (Art. 20)",   desc: "Receive your data in a portable format" },
                  { right: "Right to Object (Art. 21)",        desc: "Object to certain processing activities" },
                ].map(({ right, desc }) => (
                  <div key={right} className="lp-card rounded-xl p-3 text-sm">
                    <p className="font-medium" style={{ color: "var(--text-primary)" }}>{right}</p>
                    <p className="mt-0.5" style={{ color: "var(--text-muted)" }}>{desc}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4">To exercise your rights, contact <a href="mailto:dpo@curacareplatform.co.uk" style={{ color: "#0d9488" }}>dpo@curacareplatform.co.uk</a>. We respond to all requests within 30 days.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>5. Data Protection by Design &amp; Default</h2>
              <p>Cura implements technical and organisational measures in accordance with Article 25 UK GDPR:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>End-to-end encryption for all data in transit (TLS 1.3) and at rest (AES-256)</li>
                <li>Role-based access control with granular permissions per module</li>
                <li>Automatic session timeouts and multi-factor authentication support</li>
                <li>Data minimisation — we only collect what is necessary for the stated purpose</li>
                <li>Privacy impact assessments (DPIAs) conducted for all new processing activities</li>
                <li>Regular penetration testing and vulnerability assessments</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>6. Data Breach Notification</h2>
              <p>In the event of a personal data breach, Cura will:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Notify the Information Commissioner&apos;s Office (ICO) within 72 hours where required (Art. 33 UK GDPR)</li>
                <li>Notify affected data controllers (care home operators) without undue delay</li>
                <li>Communicate to affected individuals where the breach is likely to result in high risk (Art. 34 UK GDPR)</li>
                <li>Document all breaches in our internal breach register regardless of notification threshold</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>7. Sub-processors</h2>
              <p>We engage the following sub-processors to deliver the Cura platform. All sub-processors are bound by contractual obligations at least as protective as those in our DPA:</p>
              <div className="mt-4 overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border)" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
                      {["Sub-processor", "Purpose", "Location / Transfer Mechanism"].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-semibold text-xs" style={{ color: "var(--text-secondary)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subProcessors.map((row, i) => (
                      <tr key={row.name} style={{ borderBottom: i < subProcessors.length - 1 ? "1px solid var(--border)" : "none", background: i % 2 === 0 ? "#ffffff" : "var(--bg-secondary)" }}>
                        <td className="px-4 py-3 text-xs font-medium" style={{ color: "var(--text-primary)" }}>{row.name}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{row.purpose}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{row.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>8. Data Protection Officer</h2>
              <p>Cura has appointed a Data Protection Officer (DPO) who can be contacted for any data protection concerns:</p>
              <div className="mt-3 lp-card rounded-xl p-4">
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Email: <a href="mailto:dpo@curacareplatform.co.uk" style={{ color: "#0d9488" }}>dpo@curacareplatform.co.uk</a></p>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Post: Data Protection Officer, Cura Ltd, 1 London Bridge, London, SE1 9BG</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>9. Supervisory Authority</h2>
              <p>You have the right to lodge a complaint with the UK supervisory authority:</p>
              <div className="mt-3 lp-card rounded-xl p-4">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Information Commissioner&apos;s Office (ICO)</p>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Website: <a href="https://ico.org.uk" style={{ color: "#0d9488" }} target="_blank" rel="noopener noreferrer">ico.org.uk</a></p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Helpline: 0303 123 1113</p>
              </div>
            </section>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
