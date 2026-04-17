"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut, Search } from "lucide-react";
import { auth } from "@/lib/api";
import { logout } from "@/lib/auth";
import type { User } from "@/types";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    auth.me().then(setUser).catch(() => null);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user
    ? ((user.first_name?.[0] ?? user.username[0]) + (user.last_name?.[0] ?? "")).toUpperCase()
    : "?";

  const roleLabel: Record<string, string> = {
    admin: "Administrator",
    manager: "Care Manager",
    nurse: "Nurse",
    carer: "Carer",
    hr: "HR",
  };

  return (
    <header
      className="h-14 flex items-center justify-between px-6 flex-shrink-0 z-10"
      style={{
        background: "rgba(5,9,20,0.8)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.25)" }} />
        <input
          type="text"
          placeholder="Search residents, medications..."
          className="text-sm pl-9 pr-4 py-1.5 rounded-lg outline-none w-64 transition-all"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.7)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
        />
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Bell size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-[#050914]" />
        </button>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all"
            style={{
              background: menuOpen ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
            >
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-medium leading-none" style={{ color: "rgba(255,255,255,0.85)" }}>
                {user?.full_name || user?.username || "Loading…"}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                {user?.role ? roleLabel[user.role] ?? user.role : ""}
              </div>
            </div>
            <ChevronDown size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-1.5 w-52 rounded-xl py-1 z-30"
              style={{
                background: "#0d1424",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              }}
            >
              <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {user?.full_name || user?.username}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {user?.email}
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors"
                style={{ color: "#f87171" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
