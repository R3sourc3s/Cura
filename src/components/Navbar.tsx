"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";

const links = [
  { label: "Features",    href: "/features" },
  { label: "AI Platform", href: "/ai" },
  { label: "Pricing",     href: "/pricing" },
  { label: "About",       href: "/about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
        background: scrolled ? "rgba(250,247,240,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #dfd8cc" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#2d5a3d" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2C4.686 2 2 4.686 2 8s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 2.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 7.75A4.5 4.5 0 013.75 10c0-1.5 2.25-2.325 4.25-2.325S12.25 8.5 12.25 10A4.5 4.5 0 018 12.25z" fill="white"/>
            </svg>
          </div>
          <span className="lp-serif text-xl font-bold" style={{ color: "#1c1a14" }}>Cura</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: "#7a7468" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#2d5a3d")}
              onMouseLeave={e => (e.currentTarget.style.color = "#7a7468")}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium transition-colors"
            style={{ color: "#7a7468" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#2d5a3d")}
            onMouseLeave={e => (e.currentTarget.style.color = "#7a7468")}
          >
            Log in
          </Link>
          <a href="/contact" className="lp-btn-primary text-sm px-5 py-2.5 rounded-lg">
            Book a Demo
          </a>
        </div>

        <button
          className="md:hidden transition-colors"
          style={{ color: "#1c1a14" }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ background: "#faf7f0", borderTop: "1px solid #dfd8cc" }}
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {links.map((link) => (
                <a key={link.label} href={link.href} className="text-sm font-medium py-2" style={{ color: "#1c1a14" }} onClick={() => setMobileOpen(false)}>
                  {link.label}
                </a>
              ))}
              <Link href="/login" className="text-sm font-medium py-2" style={{ color: "#1c1a14" }} onClick={() => setMobileOpen(false)}>Log in</Link>
              <a href="/contact" className="lp-btn-primary text-sm text-center px-5 py-3 rounded-lg mt-2">Book a Demo</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
