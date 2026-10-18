"use client";

import { useSyncExternalStore } from "react";
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
  Package, Briefcase, CalendarOff, CheckSquare, ClipboardPlus,
  Receipt, Activity, Heart, Award, LayoutGrid, Plug, Watch, Building2,
  ChevronDown, Search,
} from "lucide-react";
import { logout } from "@/lib/auth";
import { useUser } from "@/context/UserContext";
import { NAV_ACCESS, NAV_SECTIONS, type NavItem, type NavSection } from "@/lib/permissions";
import { OPEN_COMMAND_PALETTE } from "./CommandPalette";

const ICONS: Record<string, React.ElementType> = {
  "/dashboard":              LayoutDashboard,
  "/dashboard/kpi":          TrendingUp,
  "/dashboard/residents":    Users,
  "/dashboard/wings":        LayoutGrid,
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
  "/dashboard/pharmacy":     Package,
  "/dashboard/recruitment":  Briefcase,
  "/dashboard/leave":        CalendarOff,
  "/dashboard/tasks":        CheckSquare,
  "/dashboard/enquiries":    ClipboardPlus,
  "/dashboard/billing":      Receipt,
  "/dashboard/gp":           Activity,
  "/dashboard/family":       Heart,
  "/dashboard/skills":       Award,
  "/dashboard/integrations": Plug,
  "/dashboard/devices":      Watch,
  "/dashboard/group":        Building2,
};

// ── Collapsed-section state, persisted per browser ─────────────────────────────
// Read through useSyncExternalStore so server and first client render agree (no hydration
// mismatch), and fall back to defaults when storage is unavailable (private mode, blocked).
const SECTIONS_KEY = "cura.sidebar.sections";
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedState: Partial<Record<NavSection, boolean>> = {};

function readSections(): Partial<Record<NavSection, boolean>> {
  let raw: string | null = null;
  try { raw = window.localStorage.getItem(SECTIONS_KEY); } catch {}
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try { cachedState = raw ? JSON.parse(raw) : {}; } catch { cachedState = {}; }
  }
  return cachedState;
}

function writeSection(section: NavSection, isOpen: boolean) {
  const next = { ...readSections(), [section]: isOpen };
  try { window.localStorage.setItem(SECTIONS_KEY, JSON.stringify(next)); } catch {}
  cachedRaw = undefined;
  cachedState = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

const EMPTY: Partial<Record<NavSection, boolean>> = {};

function isActive(href: string, pathname: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

function NavLink({ item, pathname, onClose }: { item: NavItem; pathname: string; onClose: () => void }) {
  const Icon = ICONS[item.href] ?? LayoutDashboard;
  const active = isActive(item.href, pathname);
  return (
    <Link href={item.href} onClick={onClose} aria-current={active ? "page" : undefined}
      className="sidebar-link flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150"
      data-active={active}>
      <Icon size={15} className="sidebar-link-icon flex-shrink-0" />
      <span className="truncate">{item.label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#2dd4bf", boxShadow: "0 0 6px #2dd4bf" }} />}
    </Link>
  );
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { can, user } = useUser();

  const visibleNav = NAV_ACCESS.filter(({ permission }) =>
    permission === null || can(permission)
  );
  // Group Oversight is gated by a per-user tenancy flag, not a role permission —
  // seeing another care home's data is a cross-tenant boundary, not a job function.
  if (user?.is_group_admin) {
    visibleNav.push({ label: "Group Oversight", href: "/dashboard/group", permission: null, section: "Settings" });
  }

  const stored = useSyncExternalStore(subscribe, readSections, () => EMPTY);
  const grouped = NAV_SECTIONS
    .map((section) => ({ section, items: visibleNav.filter((i) => i.section === section) }))
    .filter((g) => g.items.length > 0);
  // Open by default: Residents (the daily core) and whichever section holds the current page.
  const isOpen = (section: NavSection, items: NavItem[]) =>
    stored[section] ?? (section === "Residents" || items.some((i) => isActive(i.href, pathname)));

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        />
      )}

      <aside
        data-dark-surface
        className="fixed top-0 left-0 h-full w-64 flex flex-col z-40 transition-transform duration-300 ease-in-out"
        style={{
          background: "var(--sidebar-bg)",
          borderRight: "1px solid rgba(255,255,255,0.08)",
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

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.15)" }}>
              <Zap size={14} className="text-white" />
            </div>
            <div>
              <div className="lp-serif text-sm font-bold leading-none text-white">Cura</div>
              <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>Care Platform</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close menu"
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.1)" }}>
            <X size={16} style={{ color: "rgba(255,255,255,0.7)" }} />
          </button>
        </div>

        <div className="px-3 pt-3">
          <button onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE))}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
            <Search size={14} />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="text-[10px] font-sans px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>⌘K</kbd>
          </button>
        </div>

        <nav aria-label="Primary" className="flex-1 px-2 py-3 overflow-y-auto">
          {grouped.map(({ section, items }) => {
            if (section === "Main") {
              return (
                <div key={section} className="space-y-0.5 mb-2">
                  {items.map((item) => <NavLink key={item.href} item={item} pathname={pathname} onClose={onClose} />)}
                </div>
              );
            }
            const open = isOpen(section, items);
            const id = `nav-section-${section.replace(/\W+/g, "-").toLowerCase()}`;
            const hasActive = items.some((i) => isActive(i.href, pathname));
            return (
              <div key={section} className="mt-1">
                <button onClick={() => writeSection(section, !open)} aria-expanded={open} aria-controls={id}
                  className="sidebar-section w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-colors">
                  <span className="flex-1 text-left">{section}</span>
                  {!open && hasActive && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#2dd4bf" }} aria-hidden />}
                  {!open && <span className="text-[10px] font-medium normal-case tracking-normal opacity-70">{items.length}</span>}
                  <ChevronDown size={13} className="transition-transform duration-150" style={{ transform: open ? "none" : "rotate(-90deg)" }} />
                </button>
                {open && (
                  <div id={id} className="space-y-0.5 mt-0.5 mb-1">
                    {items.map((item) => <NavLink key={item.href} item={item} pathname={pathname} onClose={onClose} />)}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="px-3 pb-4 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full transition-all duration-150"
            style={{ color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.color = "#fca5a5"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
