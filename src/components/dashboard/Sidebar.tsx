"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Pill, ClipboardList,
  UserCheck, ShieldCheck, Bot, Zap, LogOut, X, UsersRound,
} from "lucide-react";
import { logout } from "@/lib/auth";

const nav = [
  { label: "Overview",    href: "/dashboard",            icon: LayoutDashboard },
  { label: "Residents",   href: "/dashboard/residents",  icon: Users },
  { label: "Medications", href: "/dashboard/medications", icon: Pill },
  { label: "Care Plans",  href: "/dashboard/care-plans", icon: ClipboardList },
  { label: "Staff",       href: "/dashboard/staff",      icon: UserCheck },
  { label: "Team",        href: "/dashboard/team",       icon: UsersRound },
  { label: "Compliance",  href: "/dashboard/compliance", icon: ShieldCheck },
  { label: "AI Assistant",href: "/dashboard/ai",         icon: Bot },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        />
      )}

      <aside
        className="fixed top-0 left-0 h-full w-64 flex flex-col z-40 transition-transform duration-300 ease-in-out"
        style={{
          background: "rgba(8,13,28,0.98)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
          transform: open ? "translateX(0)" : undefined,
        }}
        // On large screens always visible; on smaller hidden until open
        data-open={open}
      >
        <style>{`
          @media (max-width: 1023px) {
            aside[data-open="false"] { transform: translateX(-100%); }
            aside[data-open="true"]  { transform: translateX(0); }
          }
          @media (min-width: 1024px) {
            aside { transform: translateX(0) !important; }
          }
        `}</style>

        {/* Logo + close button */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
              <Zap size={14} className="text-white" />
            </div>
            <div>
              <div className="text-white text-sm font-bold leading-none">empathika</div>
              <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Care Platform</div>
            </div>
          </div>
          <button onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <X size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(({ label, href, icon: Icon }) => {
            const exact = href === "/dashboard";
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
                style={{
                  background: active ? "rgba(124,58,237,0.15)" : "transparent",
                  color: active ? "#a78bfa" : "rgba(255,255,255,0.5)",
                  border: active ? "1px solid rgba(124,58,237,0.2)" : "1px solid transparent",
                }}>
                <Icon size={16} style={{ color: active ? "#a78bfa" : "rgba(255,255,255,0.35)" }} />
                <span>{label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#7c3aed" }} />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full transition-all duration-150 group"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#f87171"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
