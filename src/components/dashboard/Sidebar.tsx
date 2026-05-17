"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Pill, ClipboardList,
  UserCheck, ShieldCheck, Bot, LogOut, X, UsersRound,
  AlertTriangle, BookOpen, ClipboardCheck, Zap,
  TrendingUp, NotebookPen, Stethoscope, CalendarDays,
  Smile, DoorOpen, Wrench, FolderOpen, CalendarRange,
  Table2, GraduationCap, Utensils, AlertCircle, Moon, ShieldAlert,
  MessageSquare, Star,
} from "lucide-react";
import { logout } from "@/lib/auth";
import { useUser } from "@/context/UserContext";
import { NAV_ACCESS } from "@/lib/permissions";

const ICONS: Record<string, React.ElementType> = {
  "/dashboard":              LayoutDashboard,
  "/dashboard/kpi":          TrendingUp,
  "/dashboard/residents":    Users,
  "/dashboard/medications":  Pill,
  "/dashboard/care-plans":   ClipboardList,
  "/dashboard/care-notes":   NotebookPen,
  "/dashboard/body-map":     Stethoscope,
  "/dashboard/appointments": CalendarDays,
  "/dashboard/handover":     BookOpen,
  "/dashboard/incidents":    AlertTriangle,
  "/dashboard/activities":   Smile,
  "/dashboard/visitors":     DoorOpen,
  "/dashboard/maintenance":  Wrench,
  "/dashboard/documents":        FolderOpen,
  "/dashboard/rota":             CalendarRange,
  "/dashboard/mar":              Table2,
  "/dashboard/falls-risk":       AlertCircle,
  "/dashboard/nutrition":        Utensils,
  "/dashboard/overnight-checks": Moon,
  "/dashboard/training":         GraduationCap,
  "/dashboard/safeguarding":     ShieldAlert,
  "/dashboard/prn":              Pill,
  "/dashboard/messages":         MessageSquare,
  "/dashboard/cqc":              Star,
  "/dashboard/staff":            UserCheck,
  "/dashboard/team":         UsersRound,
  "/dashboard/compliance":   ShieldCheck,
  "/dashboard/audit":        ClipboardCheck,
  "/dashboard/ai":           Bot,
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { can } = useUser();

  const visibleNav = NAV_ACCESS.filter(({ permission }) =>
    permission === null || can(permission)
  );

  return (
    <>
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
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--border)",
          backdropFilter: "blur(20px)",
        }}
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

        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
              <Zap size={14} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold leading-none" style={{ color: "var(--text-primary)" }}>cura</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Care Platform</div>
            </div>
          </div>
          <button onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--bg-card)" }}>
            <X size={16} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visibleNav.map(({ label, href }) => {
            const Icon = ICONS[href] ?? LayoutDashboard;
            const exact = href === "/dashboard";
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                style={{
                  background: active ? "rgba(124,58,237,0.15)" : "transparent",
                  color: active ? "#a78bfa" : "var(--text-secondary)",
                  border: active ? "1px solid rgba(124,58,237,0.2)" : "1px solid transparent",
                }}>
                <Icon size={16} style={{ color: active ? "#a78bfa" : "var(--text-muted)" }} />
                <span>{label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#7c3aed" }} />}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full transition-all duration-150"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#f87171"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
