import Link from "next/link";
import { Mail } from "lucide-react";

const links: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: "Features",     href: "/features" },
    { label: "Cura AI",      href: "/ai" },
    { label: "Pricing",      href: "/pricing" },
    { label: "Security",     href: "/security" },
    { label: "Integrations", href: "/integrations" },
    { label: "Changelog",    href: "/changelog" },
  ],
  Company: [
    { label: "About",   href: "/about" },
    { label: "Blog",    href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Resources: [
    { label: "Documentation", href: "/docs" },
    { label: "Help Centre",   href: "/help" },
    { label: "Webinars",      href: "/webinars" },
    { label: "CQC Toolkit",   href: "/cqc-toolkit" },
    { label: "Status",        href: "/status" },
  ],
  Legal: [
    { label: "Privacy Policy",   href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy",    href: "/cookies" },
    { label: "GDPR Statement",   href: "/gdpr" },
    { label: "Accessibility",    href: "/accessibility" },
  ],
};

export default function Footer() {
  return (
    <footer
      className="pt-16 pb-8"
      style={{ background: "var(--bg-primary)", borderTop: "1px solid var(--border)" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 mb-14">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 w-fit">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "#0d9488" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2C4.686 2 2 4.686 2 8s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 2.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 7.75A4.5 4.5 0 013.75 10c0-1.5 2.25-2.325 4.25-2.325S12.25 8.5 12.25 10A4.5 4.5 0 018 12.25z" fill="white"/>
                </svg>
              </div>
              <span className="lp-serif text-xl font-bold" style={{ color: "var(--text-primary)" }}>Cura</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: "var(--text-secondary)" }}>
              Care home management software built for UK care teams. Helping homes run better, every day.
            </p>
            <a
              href="mailto:hello@curacareplatform.co.uk"
              className="footer-link flex items-center gap-2 text-sm w-fit"
            >
              <Mail size={14} />
              hello@curacareplatform.co.uk
            </a>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <div
                className="font-semibold text-xs uppercase tracking-wider mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                {category}
              </div>
              <ul className="space-y-2.5">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="footer-link text-sm">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            © 2026 Cura Ltd. Registered in England & Wales. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-2">
            {["CQC-aligned", "GDPR compliant", "ISO 27001"].map((badge) => (
              <span
                key={badge}
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(13, 148, 136, 0.08)",
                  border: "1px solid rgba(13, 148, 136, 0.2)",
                  color: "var(--c-teal)",
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
