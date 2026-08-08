"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/context/ThemeContext";

const links = [
  { label: "Features",    href: "/features" },
  { label: "AI Platform", href: "/ai" },
  { label: "Pricing",     href: "/pricing" },
  { label: "About",       href: "/about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme } = useTheme();
  const scrolledBg = theme === "dark" ? "rgba(13,17,23,0.92)" : "rgba(250,247,240,0.96)";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? scrolledBg : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#0d9488" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2C4.686 2 2 4.686 2 8s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 2.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 7.75A4.5 4.5 0 013.75 10c0-1.5 2.25-2.325 4.25-2.325S12.25 8.5 12.25 10A4.5 4.5 0 018 12.25z" fill="white"/>
            </svg>
          </div>
          <span className="lp-serif text-xl font-bold" style={{ color: "var(--text-primary)" }}>Cura</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#0d9488")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm font-medium transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#0d9488")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            Log in
          </Link>
          <a href="/contact" className="lp-btn-primary text-sm px-5 py-2.5 rounded-lg">
            Book a Demo
          </a>
        </div>

        <div className="md:hidden flex items-center gap-3">
          <ThemeToggle />
          <button
            className="transition-colors"
            style={{ color: "var(--text-primary)" }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)" }}
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {links.map((link) => (
                <a key={link.label} href={link.href} className="text-sm font-medium py-2" style={{ color: "var(--text-primary)" }} onClick={() => setMobileOpen(false)}>
                  {link.label}
                </a>
              ))}
              <Link href="/login" className="text-sm font-medium py-2" style={{ color: "var(--text-primary)" }} onClick={() => setMobileOpen(false)}>Log in</Link>
              <a href="/contact" className="lp-btn-primary text-sm text-center px-5 py-3 rounded-lg mt-2">Book a Demo</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
