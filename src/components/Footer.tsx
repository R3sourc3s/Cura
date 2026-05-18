"use client";

import Link from "next/link";
import { Zap, Link2, Mail, ExternalLink } from "lucide-react";

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
    { label: "About",    href: "/about" },
    { label: "Blog",     href: "/blog" },
    { label: "Careers",  href: "/careers" },
    { label: "Press",    href: "/press" },
    { label: "Contact",  href: "/contact" },
  ],
  Resources: [
    { label: "Documentation", href: "/docs" },
    { label: "Help Centre",   href: "/help" },
    { label: "Webinars",      href: "/webinars" },
    { label: "CQC Toolkit",   href: "/cqc-toolkit" },
    { label: "Status",        href: "/status" },
  ],
  Legal: [
    { label: "Privacy Policy",  href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy",   href: "/cookies" },
    { label: "GDPR Statement",  href: "/gdpr" },
  ],
};

export default function Footer() {
  return (
    <footer
      className="relative pt-20 pb-8"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 100% 50% at 50% 100%, rgba(124,58,237,0.05), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
              >
                <Zap size={16} className="text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">cura</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xs">
              UK&apos;s #1 care home management platform. Built with care, for care.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: ExternalLink, href: "https://linkedin.com/company/curacareplatform" },
                { Icon: Link2,        href: "https://twitter.com/curacareplatform" },
                { Icon: Mail,         href: "/contact" },
              ].map(({ Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <div className="text-white font-semibold text-sm mb-4">{category}</div>
              <ul className="space-y-2.5">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
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
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p className="text-gray-600 text-xs">
            © 2025 Cura Ltd. Registered in England & Wales. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {["ISO 27001", "Cyber Essentials+", "NHS-Aligned"].map((badge) => (
              <span
                key={badge}
                className="text-xs text-gray-600 px-2.5 py-1 rounded-full"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}
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
