import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const cookieTable = [
  { name: "session_id", purpose: "Maintains your authenticated session", duration: "Session", type: "Essential" },
  { name: "cura-theme", purpose: "Remembers your dark/light theme preference", duration: "1 year", type: "Functional" },
  { name: "auth_token", purpose: "JWT authentication token for API access", duration: "7 days", type: "Essential" },
  { name: "_ga", purpose: "Google Analytics — distinguishes users", duration: "2 years", type: "Analytics" },
  { name: "_gid", purpose: "Google Analytics — distinguishes users", duration: "24 hours", type: "Analytics" },
  { name: "_ga_*", purpose: "Google Analytics 4 session data", duration: "2 years", type: "Analytics" },
  { name: "csrf_token", purpose: "Cross-site request forgery protection", duration: "Session", type: "Essential" },
];

const typeColor: Record<string, string> = {
  Essential: "#10b981",
  Functional: "#3b82f6",
  Analytics: "#f59e0b",
  Marketing: "#ec4899",
};

export default function CookiePolicyPage() {
  return (
    <main style={{ background: "#050914", minHeight: "100vh" }}>
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#a78bfa" }}>Legal</p>
            <h1 className="text-4xl font-bold text-white mb-3">Cookie Policy</h1>
            <p className="text-gray-500 text-sm">Last updated: May 2025 &nbsp;·&nbsp; Cura Ltd, registered in England &amp; Wales (Company No. 14XXXXXX)</p>
          </div>

          <div className="prose-custom space-y-10 text-gray-400 leading-relaxed">

            <section>
              <h2 className="text-xl font-bold text-white mb-4">1. What Are Cookies?</h2>
              <p>Cookies are small text files placed on your device when you visit a website. They are widely used to make websites function efficiently and to provide reporting information. Cookies allow us to recognise your device, remember your preferences, and understand how you interact with our platform.</p>
              <p className="mt-3">Similar technologies, such as web beacons, pixels, and local storage, may also be used for similar purposes. This policy covers all such technologies collectively referred to as &quot;cookies&quot;.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">2. How Cura Uses Cookies</h2>
              <p>Cura uses cookies for the following purposes:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li><strong className="text-gray-300">Authentication:</strong> To keep you logged in and maintain secure sessions across the platform.</li>
                <li><strong className="text-gray-300">Preferences:</strong> To remember your theme, language, and interface settings.</li>
                <li><strong className="text-gray-300">Security:</strong> To protect against cross-site request forgery and other security threats.</li>
                <li><strong className="text-gray-300">Analytics:</strong> To understand how users interact with our platform, helping us improve it.</li>
                <li><strong className="text-gray-300">Performance:</strong> To monitor site performance and diagnose technical issues.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">3. Types of Cookies We Use</h2>

              <div className="space-y-6">
                {[
                  {
                    type: "Essential / Strictly Necessary",
                    color: "#10b981",
                    desc: "These cookies are essential for the platform to function and cannot be switched off. They are set in response to actions you take such as logging in or filling in forms. Without these cookies, Cura cannot operate correctly.",
                  },
                  {
                    type: "Functional",
                    color: "#3b82f6",
                    desc: "These cookies enable enhanced functionality and personalisation. They remember choices you make (such as your theme preference) to provide a better experience. Disabling these may affect some features.",
                  },
                  {
                    type: "Analytics",
                    color: "#f59e0b",
                    desc: "We use Google Analytics 4 to understand how visitors use our website and platform dashboard. The data collected is aggregated and anonymised. You can opt out of analytics cookies via your browser settings or the Google Analytics Opt-out Add-on.",
                  },
                  {
                    type: "Marketing / Advertising",
                    color: "#6b7280",
                    desc: "We do not currently use any marketing or advertising cookies. We will update this policy if this changes.",
                  },
                ].map(({ type, color, desc }) => (
                  <div key={type} className="glass rounded-xl p-5" style={{ border: `1px solid ${color}22` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: `${color}22`, color }}>{type}</span>
                    </div>
                    <p className="text-sm">{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">4. Cookie Table</h2>
              <p className="mb-4">The following table lists the specific cookies used by Cura:</p>
              <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
                      {["Name", "Purpose", "Duration", "Type"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-gray-300 font-semibold text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cookieTable.map((row, i) => (
                      <tr key={row.name} style={{ borderBottom: i < cookieTable.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                        <td className="px-4 py-3 font-mono text-xs text-gray-300">{row.name}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{row.purpose}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{row.duration}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${typeColor[row.type]}22`, color: typeColor[row.type] }}>{row.type}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">5. Third-Party Cookies</h2>
              <p>We use Google Analytics, operated by Google LLC. Google may set cookies on your device as part of this service. Please see <a href="https://policies.google.com/privacy" className="underline" style={{ color: "#a78bfa" }} target="_blank" rel="noopener noreferrer">Google&apos;s Privacy Policy</a> for more information. All Analytics data is processed under a Data Processing Agreement that complies with GDPR.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">6. Managing Your Cookies</h2>
              <p>You can control cookies through your browser settings. Most browsers allow you to:</p>
              <ul className="list-disc pl-6 mt-3 space-y-1.5">
                <li>View what cookies are set</li>
                <li>Block cookies in general or for specific websites</li>
                <li>Clear cookies when you close your browser</li>
                <li>Block third-party cookies</li>
              </ul>
              <p className="mt-3">Note that blocking essential cookies will prevent you from logging into Cura. For browser-specific instructions, refer to your browser&apos;s help documentation.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">7. Updates to This Policy</h2>
              <p>We may update this Cookie Policy from time to time. We will notify registered users of any material changes via email and update the &quot;Last updated&quot; date at the top of this page.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">8. Contact</h2>
              <p>If you have questions about our use of cookies, please contact our Data Protection Officer:</p>
              <div className="mt-3 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-gray-300 text-sm">Email: <a href="mailto:dpo@curacareplatform.co.uk" style={{ color: "#a78bfa" }}>dpo@curacareplatform.co.uk</a></p>
                <p className="text-gray-300 text-sm mt-1">Post: Data Protection Officer, Cura Ltd, 1 London Bridge, London, SE1 9BG</p>
              </div>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
