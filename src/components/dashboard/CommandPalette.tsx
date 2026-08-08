"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, LayoutDashboard, Users, Pill, ClipboardList, AlertTriangle,
  MessageSquare, Star, Shield, BookOpen, TrendingUp, NotebookPen,
  Stethoscope, CalendarDays, Smile, DoorOpen, Wrench, FolderOpen,
  CalendarRange, Table2, GraduationCap, Utensils, AlertCircle, Moon,
  ShieldAlert, UserCheck, UsersRound, ShieldCheck, ClipboardCheck, Bot,
  ChevronRight, Hash,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  sub?: string;
  href: string;
  icon: React.ElementType;
  color: string;
  keywords: string[];
}

const COMMANDS: CommandItem[] = [
  { id:"dashboard",    label:"Overview",           sub:"Main dashboard",            href:"/dashboard",                  icon:LayoutDashboard, color:"var(--c-violet)", keywords:["home","overview","main"] },
  { id:"residents",    label:"Residents",           sub:"View all residents",         href:"/dashboard/residents",        icon:Users,           color:"var(--c-teal2)", keywords:["patient","service user","resident"] },
  { id:"medications",  label:"Medications",         sub:"Medication management",      href:"/dashboard/medications",      icon:Pill,            color:"var(--c-green)", keywords:["drugs","meds","prescriptions"] },
  { id:"mar",          label:"MAR Chart",           sub:"Medication administration",  href:"/dashboard/mar",              icon:Table2,          color:"var(--c-amber)", keywords:["mar","administration record"] },
  { id:"care-plans",   label:"Care Plans",          sub:"View care plans",            href:"/dashboard/care-plans",       icon:ClipboardList,   color:"var(--c-violet)", keywords:["care plan","plan"] },
  { id:"care-notes",   label:"Care Notes",          sub:"Daily care notes",           href:"/dashboard/care-notes",       icon:NotebookPen,     color:"#818cf8", keywords:["notes","daily","diary"] },
  { id:"body-map",     label:"Body Map",            sub:"Wound and skin assessments", href:"/dashboard/body-map",         icon:Stethoscope,     color:"var(--c-teal2)", keywords:["wound","skin","body","pressure"] },
  { id:"falls-risk",   label:"Falls Risk",          sub:"Falls risk assessments",     href:"/dashboard/falls-risk",       icon:AlertCircle,     color:"var(--c-red)", keywords:["falls","morse","risk"] },
  { id:"nutrition",    label:"Fluid & Nutrition",   sub:"Food and fluid monitoring",  href:"/dashboard/nutrition",        icon:Utensils,        color:"var(--c-orange)", keywords:["food","fluid","nutrition","hydration"] },
  { id:"overnight",    label:"Overnight Checks",    sub:"Night safety checks",        href:"/dashboard/overnight-checks", icon:Moon,            color:"#818cf8", keywords:["night","overnight","sleep","check"] },
  { id:"appointments", label:"Appointments",        sub:"Medical appointments",       href:"/dashboard/appointments",     icon:CalendarDays,    color:"var(--c-teal2)", keywords:["appointment","GP","doctor","hospital"] },
  { id:"incidents",    label:"Incidents",           sub:"Incident reporting",         href:"/dashboard/incidents",        icon:AlertTriangle,   color:"var(--c-red)", keywords:["incident","accident","report"] },
  { id:"safeguarding", label:"Safeguarding",        sub:"Safeguarding register",      href:"/dashboard/safeguarding",     icon:ShieldAlert,     color:"var(--c-violet)", keywords:["safeguarding","abuse","neglect"] },
  { id:"handover",     label:"Handover",            sub:"Shift handover notes",       href:"/dashboard/handover",         icon:BookOpen,        color:"#818cf8", keywords:["handover","shift","handoff"] },
  { id:"activities",   label:"Activities",          sub:"Resident activities",        href:"/dashboard/activities",       icon:Smile,           color:"var(--c-green)", keywords:["activity","events","social"] },
  { id:"visitors",     label:"Visitors",            sub:"Visitor log",                href:"/dashboard/visitors",         icon:DoorOpen,        color:"var(--c-teal2)", keywords:["visitor","family","guest"] },
  { id:"maintenance",  label:"Maintenance",         sub:"Maintenance requests",       href:"/dashboard/maintenance",      icon:Wrench,          color:"var(--c-amber)", keywords:["maintenance","repair","fix"] },
  { id:"documents",    label:"Documents",           sub:"File storage",               href:"/dashboard/documents",        icon:FolderOpen,      color:"var(--c-orange)", keywords:["documents","files","uploads","forms"] },
  { id:"rota",         label:"Staff Rota",          sub:"Shift scheduling",           href:"/dashboard/rota",             icon:CalendarRange,   color:"var(--c-green)", keywords:["rota","schedule","shifts","roster"] },
  { id:"training",     label:"Staff Training",      sub:"Training records",           href:"/dashboard/training",         icon:GraduationCap,   color:"var(--c-teal2)", keywords:["training","certificates","cpd"] },
  { id:"prn",          label:"PRN Medications",      sub:"As-needed medication log",   href:"/dashboard/prn",              icon:Pill,            color:"var(--c-green)", keywords:["prn","as needed","pain relief","medication"] },
  { id:"messages",     label:"Messages",            sub:"Staff messaging",            href:"/dashboard/messages",         icon:MessageSquare,   color:"var(--c-violet)", keywords:["message","chat","communicate","staff"] },
  { id:"cqc",          label:"CQC Readiness",       sub:"Inspection readiness",       href:"/dashboard/cqc",              icon:Star,            color:"var(--c-amber)", keywords:["cqc","ofsted","inspection","regulation"] },
  { id:"kpi",          label:"KPI Dashboard",       sub:"Key performance indicators", href:"/dashboard/kpi",              icon:TrendingUp,      color:"var(--c-green)", keywords:["kpi","stats","metrics","performance"] },
  { id:"staff",        label:"Staff",               sub:"Staff management",           href:"/dashboard/staff",            icon:UserCheck,       color:"var(--c-teal2)", keywords:["staff","employees","workers"] },
  { id:"team",         label:"Team",                sub:"Team overview",              href:"/dashboard/team",             icon:UsersRound,      color:"var(--c-violet)", keywords:["team","group"] },
  { id:"compliance",   label:"Compliance",          sub:"Compliance monitoring",      href:"/dashboard/compliance",       icon:ShieldCheck,     color:"var(--c-green)", keywords:["compliance","policy","regulation"] },
  { id:"audit",        label:"Audit Trail",         sub:"System audit log",           href:"/dashboard/audit",            icon:ClipboardCheck,  color:"var(--c-teal2)", keywords:["audit","log","history","changes"] },
  { id:"ai",           label:"AI Assistant",        sub:"Ask AI anything",            href:"/dashboard/ai",               icon:Bot,             color:"var(--c-violet)", keywords:["ai","assistant","chat","ask","help"] },
];

function score(item: CommandItem, q: string): number {
  const ql = q.toLowerCase();
  const labelL = item.label.toLowerCase();
  if (labelL === ql) return 100;
  if (labelL.startsWith(ql)) return 80;
  if (labelL.includes(ql)) return 60;
  if (item.keywords.some(k => k.includes(ql))) return 40;
  if (item.sub?.toLowerCase().includes(ql)) return 20;
  return 0;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query.trim()
    ? COMMANDS.map(c => ({ ...c, s: score(c, query) })).filter(c => c.s > 0).sort((a, b) => b.s - a.s)
    : COMMANDS;

  const navigate = useCallback((href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  }, [router]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(v => !v);
        setQuery("");
        setSelected(0);
      }
      if (!open) return;
      if (e.key === "Escape") { setOpen(false); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected(v => Math.min(v + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelected(v => Math.max(v - 1, 0)); }
      if (e.key === "Enter" && filtered[selected]) { navigate(filtered[selected].href); }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, filtered, selected, navigate]);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);
  useEffect(() => { setSelected(0); }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl mx-4 rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-strong)", boxShadow: "0 40px 80px rgba(0,0,0,0.7)" }}
        onClick={e => e.stopPropagation()}>

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid var(--border-strong)" }}>
          <Search size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pages and features…"
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: "var(--text-primary)" }}
          />
          <kbd className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--border)", color: "var(--text-muted)", fontFamily: "monospace" }}>esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-1.5">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>No results</div>
          ) : (
            filtered.map((item, i) => {
              const Icon = item.icon;
              const active = i === selected;
              return (
                <button key={item.id}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-none"
                  style={{ background: active ? "rgba(13, 148, 136,0.15)" : "transparent" }}
                  onMouseEnter={() => setSelected(i)}
                  onClick={() => navigate(item.href)}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}>
                    <Icon size={14} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: active ? "#fff" : "var(--text-secondary)" }}>{item.label}</div>
                    {item.sub && <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{item.sub}</div>}
                  </div>
                  {active && <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />}
                </button>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 flex items-center gap-4 border-t" style={{ borderColor: "var(--border)" }}>
          {[
            { keys: ["↑","↓"], label: "navigate" },
            { keys: ["↵"], label: "open" },
            { keys: ["esc"], label: "close" },
          ].map(hint => (
            <div key={hint.label} className="flex items-center gap-1.5">
              {hint.keys.map(k => (
                <kbd key={k} className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--border)", color: "var(--text-muted)", fontFamily: "monospace" }}>{k}</kbd>
              ))}
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{hint.label}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-1.5">
            <Hash size={10} style={{ color: "var(--text-muted)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{filtered.length} results</span>
          </div>
        </div>
      </div>
    </div>
  );
}
