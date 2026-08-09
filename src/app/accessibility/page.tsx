import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Eye, Keyboard, Volume2, MousePointerClick } from "lucide-react";

const pillars = [
  { icon: Keyboard,          title: "Full Keyboard Navigation",    desc: "Every workflow — from charting a MAR round to raising an incident — can be operated without a mouse, with a visible focus indicator throughout.", color: "#0d9488" },
  { icon: Volume2,           title: "Screen Reader Support",       desc: "Dialogs, live notifications, and icon-only controls carry the ARIA roles and labels assistive technology needs to announce them correctly.",   color: "#10b981" },
  { icon: Eye,               title: "Colour & Contrast",           desc: "Text and interface colours are chosen to meet WCAG 2.1 AA contrast ratios in both our light and dark themes.",                                   color: "#0d9488" },
  { icon: MousePointerClick, title: "Predictable, Skippable Layout", desc: "A skip-to-content link on every page lets keyboard and screen reader users bypass repeated navigation.",                                       color: "#10b981" },
];

export default function AccessibilityPage() {
  return (
    <main id="main-content" style={{ background: "var(--bg-secondary)", minHeight: "100vh" }}>
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#0d9488" }}>Accessibility</p>
            <h1 className="lp-serif text-4xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Accessibility Statement</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Last updated: August 2026 &nbsp;·&nbsp; Applies to the Cura web application and marketing site</p>
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
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>1. Our commitment</h2>
              <p>Cura is used by care staff, family members, and residents of all abilities, often under time pressure or on shared devices. We want everyone who needs to use it to be able to — this is a compliance requirement for the NHS and local-authority customers we serve, and a product priority in its own right.</p>
              <p className="mt-3">We target conformance with the <strong style={{ color: "var(--text-secondary)" }}>Web Content Accessibility Guidelines (WCAG) 2.1, Level AA</strong>, the standard referenced by the UK Public Sector Bodies Accessibility Regulations 2018 and NHS Digital Technology Assessment Criteria (DTAC).</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>2. Conformance status</h2>
              <p>Cura is <strong style={{ color: "var(--text-secondary)" }}>partially conformant</strong> with WCAG 2.1 AA. Partially conformant means some parts of the content do not yet fully conform to the standard. We publish this status honestly rather than claiming full conformance we haven&apos;t independently audited, and we are working through the gaps below on an ongoing basis.</p>
              <p className="mt-3">Improvements already in place across the platform include: a skip-to-content link on every page, visible keyboard focus indicators on all interactive controls, accessible names on icon-only buttons, live-region announcements for toast notifications, and keyboard-dismissible, properly-labelled dialogs.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>3. Known limitations</h2>
              <p>We are aware of the following gaps and are addressing them incrementally rather than waiting for a single &quot;big bang&quot; release:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Some older modal dialogs in less-frequently-used dashboard screens do not yet trap focus within the dialog while open.</li>
                <li>A small number of data tables and charts (e.g. in analytics views) do not yet have full screen-reader-friendly text alternatives.</li>
                <li>Colour-contrast has not yet been independently audited page-by-page across every theme and state.</li>
              </ul>
              <p className="mt-3">None of these are blockers to completing core care tasks with a keyboard or screen reader, but we don&apos;t consider the job finished until they&apos;re closed out.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>4. Feedback and contact</h2>
              <p>If you find an accessibility barrier while using Cura, please tell us — we treat these reports as bugs, not feature requests. Contact <a href="mailto:accessibility@curacareplatform.co.uk" style={{ color: "#0d9488" }}>accessibility@curacareplatform.co.uk</a> and we&apos;ll aim to respond within 5 working days with either a fix or a timeline.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>5. Technical information</h2>
              <p>This statement covers the Cura marketing site and the authenticated dashboard, family portal, and partner API documentation. It does not cover PDF or scanned documents uploaded by care homes themselves, which are outside our control.</p>
              <p className="mt-3">Cura is built with semantic HTML, ARIA roles where native semantics are insufficient, and is tested manually with keyboard-only navigation and screen readers (VoiceOver, NVDA) as part of our release process.</p>
            </section>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
