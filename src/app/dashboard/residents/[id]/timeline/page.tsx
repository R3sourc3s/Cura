"use client";

import { useEffect, useState, use } from "react";
import { Activity, Shield, Pill, Heart, NotebookPen, CalendarDays, Stethoscope, Moon, ClipboardList } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

interface TimelineEvent {
  id: string;
  type: "care_note" | "incident" | "medication" | "vital" | "appointment" | "body_map" | "overnight" | "care_plan";
  title: string;
  detail: string;
  timestamp: string;
  author?: string;
  badge?: string;
  badgeColor?: string;
}

const TYPE_CFG: Record<TimelineEvent["type"], { icon: React.ElementType; color: string; bg: string }> = {
  care_note:  { icon: NotebookPen,   color:"var(--c-teal)", bg:"rgba(13, 148, 136,0.15)" },
  incident:   { icon: Shield,        color:"var(--c-red)", bg:"rgba(239,68,68,0.15)" },
  medication: { icon: Pill,          color:"var(--c-green)", bg:"rgba(52,211,153,0.15)" },
  vital:      { icon: Heart,         color:"#f472b6", bg:"rgba(244,114,182,0.15)" },
  appointment:{ icon: CalendarDays,  color:"var(--c-teal2)", bg:"rgba(45, 212, 191,0.15)" },
  body_map:   { icon: Stethoscope,   color:"var(--c-teal2)", bg:"rgba(45,212,191,0.15)" },
  overnight:  { icon: Moon,          color:"#818cf8", bg:"rgba(99,102,241,0.15)" },
  care_plan:  { icon: ClipboardList, color:"var(--c-orange)", bg:"rgba(251,146,60,0.15)" },
};

function isoToRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB");
}

export default function ResidentTimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [residentName, setResidentName] = useState("");
  const [filter, setFilter] = useState<TimelineEvent["type"] | "">("");

  useEffect(() => {
    fetch(`/api/v1/residents/${id}/`, { credentials:"include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setResidentName(d.full_name));

    const fetchAll = async () => {
      const headers = { credentials: "include" as const };
      const all: TimelineEvent[] = [];

      const [notes, incidents, mar, vitals, appts, wounds, checks] = await Promise.allSettled([
        fetch(`/api/v1/care-notes/?resident=${id}&page_size=50&ordering=-recorded_at`, headers).then(r=>r.json()),
        fetch(`/api/v1/incidents/?resident=${id}&page_size=50&ordering=-occurred_at`, headers).then(r=>r.json()),
        fetch(`/api/v1/medications/mar/?resident=${id}&page_size=50`, headers).then(r=>r.json()),
        fetch(`/api/v1/vitals/?resident=${id}&page_size=50&ordering=-recorded_at`, headers).then(r=>r.json()),
        fetch(`/api/v1/appointments/?resident=${id}&page_size=50&ordering=-scheduled_at`, headers).then(r=>r.json()),
        fetch(`/api/v1/body-map/wounds/?resident=${id}&page_size=50`, headers).then(r=>r.json()),
        fetch(`/api/v1/overnight-checks/?resident=${id}&page_size=50&ordering=-check_time`, headers).then(r=>r.json()),
      ]);

      if (notes.status==="fulfilled") {
        const items = notes.value?.results ?? notes.value ?? [];
        items.forEach((n: {id:number;content:string;shift:string;category:string;recorded_at:string;author_name?:string}) => {
          all.push({ id:`note-${n.id}`, type:"care_note", title:`${n.shift.charAt(0).toUpperCase()+n.shift.slice(1)} shift note`, detail:n.content.slice(0,120)+(n.content.length>120?"…":""), timestamp:n.recorded_at, author:n.author_name, badge:n.category.replace(/_/g," "), badgeColor:"rgba(13, 148, 136,0.5)" });
        });
      }
      if (incidents.status==="fulfilled") {
        const items = incidents.value?.results ?? incidents.value ?? [];
        items.forEach((i: {id:number;title?:string;incident_type?:string;description:string;occurred_at:string;reported_by_name?:string;severity?:string}) => {
          all.push({ id:`inc-${i.id}`, type:"incident", title:i.title??`${i.incident_type} incident`, detail:i.description.slice(0,120), timestamp:i.occurred_at, author:i.reported_by_name, badge:i.severity, badgeColor:"rgba(239,68,68,0.5)" });
        });
      }
      if (mar.status==="fulfilled") {
        const items = mar.value?.results ?? mar.value ?? [];
        items.filter((e:{status:string})=>e.status==="given").slice(0,20).forEach((e: {id:number;drug_name?:string;administered_at:string;administered_by_name?:string;status:string}) => {
          all.push({ id:`mar-${e.id}`, type:"medication", title:`${e.drug_name??'Medication'} administered`, detail:"Status: given", timestamp:e.administered_at, author:e.administered_by_name });
        });
      }
      if (vitals.status==="fulfilled") {
        const items = vitals.value?.results ?? vitals.value ?? [];
        items.forEach((v: {id:number;recorded_at:string;bp_systolic?:number;bp_diastolic?:number;pulse?:number;temperature?:number;oxygen_saturation?:number}) => {
          const parts: string[] = [];
          if (v.bp_systolic && v.bp_diastolic) parts.push(`BP ${v.bp_systolic}/${v.bp_diastolic}`);
          if (v.pulse) parts.push(`Pulse ${v.pulse}`);
          if (v.temperature) parts.push(`Temp ${v.temperature}°C`);
          if (v.oxygen_saturation) parts.push(`SpO₂ ${v.oxygen_saturation}%`);
          all.push({ id:`vital-${v.id}`, type:"vital", title:"Vitals recorded", detail:parts.join(" · ") || "Observations recorded", timestamp:v.recorded_at });
        });
      }
      if (appts.status==="fulfilled") {
        const items = appts.value?.results ?? appts.value ?? [];
        items.forEach((a: {id:number;appointment_type:string;provider_name:string;location:string;scheduled_at:string;status:string}) => {
          all.push({ id:`appt-${a.id}`, type:"appointment", title:`${a.appointment_type.toUpperCase()} appointment`, detail:`${a.provider_name} · ${a.location}`, timestamp:a.scheduled_at, badge:a.status, badgeColor:"rgba(45, 212, 191,0.4)" });
        });
      }
      if (wounds.status==="fulfilled") {
        const items = wounds.value?.results ?? wounds.value ?? [];
        items.forEach((w: {id:number;wound_type:string;grade:string;body_side:string;created_at:string}) => {
          all.push({ id:`wound-${w.id}`, type:"body_map", title:`${w.wound_type.replace(/_/g," ")} recorded`, detail:`${w.body_side} body · Grade ${w.grade}`, timestamp:w.created_at });
        });
      }
      if (checks.status==="fulfilled") {
        const items = checks.value?.results ?? checks.value ?? [];
        items.filter((_: unknown, idx: number) => idx < 20).forEach((c: {id:number;status:string;check_time:string;checked_by_name?:string;notes:string}) => {
          all.push({ id:`check-${c.id}`, type:"overnight", title:`Overnight check: ${c.status}`, detail:c.notes || `Status: ${c.status}`, timestamp:c.check_time, author:c.checked_by_name });
        });
      }

      all.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setEvents(all);
      setLoading(false);
    };

    fetchAll().catch(() => setLoading(false));
  }, [id]);

  const visible = filter ? events.filter(e => e.type === filter) : events;
  const typeKeys = Object.keys(TYPE_CFG) as TimelineEvent["type"][];

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <Breadcrumbs crumbs={[
        { label: "Residents", href: "/dashboard/residents" },
        ...(residentName ? [{ label: residentName, href: `/dashboard/residents/${id}` }] : []),
        { label: "Timeline" },
      ]} />
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:"rgba(13, 148, 136,0.12)", border:"1px solid rgba(13, 148, 136,0.2)" }}>
          <Activity size={16} style={{ color:"var(--c-teal)" }} />
        </div>
        <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Resident Timeline</h1>
      </div>

      {/* Type filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => setFilter("")} className="text-xs px-3 py-1.5 rounded-xl transition-all font-medium"
          style={{ background: filter==="" ? "rgba(13, 148, 136,0.2)" : "rgba(var(--fg-rgb),0.04)", color: filter==="" ? "var(--c-teal)" : "rgba(var(--fg-rgb),0.45)", border: filter==="" ? "1px solid rgba(13, 148, 136,0.3)" : "1px solid transparent" }}>
          All ({events.length})
        </button>
        {typeKeys.map(type => {
          const cfg = TYPE_CFG[type];
          const count = events.filter(e => e.type === type).length;
          if (count === 0) return null;
          return (
            <button key={type} onClick={() => setFilter(type)} className="text-xs px-3 py-1.5 rounded-xl transition-all font-medium"
              style={{ background: filter===type ? cfg.bg : "rgba(var(--fg-rgb),0.04)", color: filter===type ? cfg.color : "rgba(var(--fg-rgb),0.45)", border: filter===type ? `1px solid ${cfg.color}50` : "1px solid transparent" }}>
              {type.replace(/_/g," ")} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background:"rgba(var(--fg-rgb),0.02)", border:"1px solid rgba(var(--fg-rgb),0.06)" }}>
          <Activity size={28} className="mx-auto mb-2" style={{ color:"rgba(var(--fg-rgb),0.15)" }} />
          <p className="text-sm" style={{ color:"rgba(var(--fg-rgb),0.3)" }}>No events found.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[22px] top-0 bottom-0 w-px" style={{ background:"rgba(var(--fg-rgb),0.07)" }} />
          <div className="space-y-3 pl-12">
            {visible.map(event => {
              const cfg = TYPE_CFG[event.type];
              const Icon = cfg.icon;
              return (
                <div key={event.id} className="relative">
                  <div className="absolute -left-[34px] top-3 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 z-10"
                    style={{ background:cfg.bg, border:`1px solid ${cfg.color}40` }}>
                    <Icon size={14} style={{ color:cfg.color }} />
                  </div>
                  <div className="rounded-2xl p-4" style={{ background:"rgba(var(--fg-rgb),0.02)", border:"1px solid rgba(var(--fg-rgb),0.07)" }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-white">{event.title}</span>
                          {event.badge && (
                            <span className="text-xs px-1.5 py-0.5 rounded capitalize" style={{ background: event.badgeColor ?? "rgba(var(--fg-rgb),0.08)", color:"rgba(var(--fg-rgb),0.7)" }}>
                              {event.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-1 leading-relaxed" style={{ color:"rgba(var(--fg-rgb),0.5)" }}>{event.detail}</p>
                        {event.author && <p className="text-xs mt-1" style={{ color:"rgba(var(--fg-rgb),0.3)" }}>{event.author}</p>}
                      </div>
                      <span className="text-xs flex-shrink-0 whitespace-nowrap" style={{ color:"rgba(var(--fg-rgb),0.3)" }}>{isoToRelative(event.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
