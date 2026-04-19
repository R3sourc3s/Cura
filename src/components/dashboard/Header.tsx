"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut, Search, Menu, X, UserCircle } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/api";
import { logout } from "@/lib/auth";
import type { User } from "@/types";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { auth.me().then(setUser).catch(() => null); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const initials = user
    ? ((user.first_name?.[0] ?? user.username[0]) + (user.last_name?.[0] ?? "")).toUpperCase()
    : "?";

  const roleLabel: Record<string, string> = {
    admin: "Administrator", manager: "Care Manager",
    nurse: "Nurse", carer: "Carer", hr: "HR",
  };

  return (
    <>
      <header className="h-14 flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-10"
        style={{ background: "rgba(5,9,20,0.9)", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>

        {/* Left: hamburger (mobile) + search (desktop) */}
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick}
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Menu size={18} style={{ color: "rgba(255,255,255,0.6)" }} />
          </button>

          {/* Desktop search */}
          <div className="relative hidden md:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.25)" }} />
            <input type="text" placeholder="Search residents, medications…"
              className="text-sm pl-9 pr-4 py-1.5 rounded-lg outline-none w-56 lg:w-72 transition-all"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")} />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Mobile search toggle */}
          <button onClick={() => setSearchOpen((v) => !v)}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {searchOpen ? <X size={16} style={{ color: "rgba(255,255,255,0.6)" }} /> : <Search size={16} style={{ color: "rgba(255,255,255,0.6)" }} />}
          </button>

          {/* Notifications */}
          <button className="relative w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Bell size={15} style={{ color: "rgba(255,255,255,0.5)" }} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#050914]" />
          </button>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-xl transition-all"
              style={{ background: menuOpen ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
                {initials}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-medium leading-none" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {user?.full_name || user?.username || "…"}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {user?.role ? (roleLabel[user.role] ?? user.role) : ""}
                </div>
              </div>
              <ChevronDown size={12} className="hidden sm:block" style={{ color: "rgba(255,255,255,0.3)" }} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1.5 w-52 rounded-xl py-1 z-50"
                style={{ background: "#0d1424", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>{user?.full_name || user?.username}</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{user?.email}</div>
                </div>
                <Link href="/dashboard/profile" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors"
                  style={{ color: "rgba(255,255,255,0.65)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <UserCircle size={14} /> My Profile
                </Link>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "4px 0" }} />
                <button onClick={logout}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors"
                  style={{ color: "#f87171" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile search bar — slides down below header */}
      {searchOpen && (
        <div className="md:hidden px-4 py-2 border-b" style={{ background: "rgba(5,9,20,0.95)", borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.25)" }} />
            <input ref={searchRef} type="text" placeholder="Search residents, medications…"
              className="w-full text-sm pl-9 pr-4 py-2 rounded-xl outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }} />
          </div>
        </div>
      )}
    </>
  );
}
