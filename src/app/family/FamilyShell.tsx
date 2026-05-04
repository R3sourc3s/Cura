"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, LogOut, Menu, X } from "lucide-react";
import type { User } from "@/types";

export default function FamilyShell({ user, children }: { user: User; children: React.ReactNode }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #050914 0%, #0d1526 100%)" }}>
      {/* Top nav */}
      <header className="sticky top-0 z-20 px-4 sm:px-6 py-4 flex items-center justify-between"
        style={{ background: "rgba(8,13,28,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #ec4899, #be185d)" }}>
            <Heart size={14} className="text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-white">Cura</span>
            <span className="text-xs ml-2" style={{ color: "rgba(255,255,255,0.35)" }}>Family Portal</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm hidden sm:block" style={{ color: "rgba(255,255,255,0.5)" }}>
            {user.first_name} {user.last_name}
          </span>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
