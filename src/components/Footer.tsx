"use client";

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
  ],
};

export default function Footer() {
  return (
    <footer
      className="pt-16 pb-8"
      style={{ background: "#1c1a14", borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 mb-14">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "#2d5a3d" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2C4.686 2 2 4.686 2 8s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 2.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 7.75A4.5 4.5 0 013.75 10c0-1.5 2.25-2.325 4.25-2.325S12.25 8.5 12.25 10A4.5 4.5 0 018 12.25z" fill="white"/>
                </svg>
              </div>
              <span className="lp-serif text-xl font-bold text-white">Cura</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: "#6b6558" }}>
              Care home management software built for UK care teams. Helping homes run better, every day.
            </p>
            <a
              href="mailto:hello@curacareplatform.co.uk"
              className="flex items-center gap-2 text-sm transition-colors w-fit"
              style={{ color: "#6b6558" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#a89f94")}
              onMouseLeave={e => (e.currentTarget.style.color = "#6b6558")}
            >
              <Mail size={14} />
              hello@curacareplatform.co.uk
            </a>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <div className="font-semibold text-sm mb-4 text-white">{category}</div>
              <ul className="space-y-2.5">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm transition-colors"
                      style={{ color: "#6b6558" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#f5f0eb")}
                      onMouseLeave={e => (e.currentTarget.style.color = "#6b6558")}
                    >
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
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-xs" style={{ color: "#4a4438" }}>
            © 2026 Cura Ltd. Registered in England & Wales. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {["CQC-aligned", "GDPR compliant", "ISO 27001"].map((badge) => (
              <span
                key={badge}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#4a4438" }}
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
