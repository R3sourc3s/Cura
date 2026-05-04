"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X, ChevronRight, Clock, Pill, Shield, Moon, Star } from "lucide-react";
import Link from "next/link";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  message: string;
  href: string;
  icon: React.ElementType;
}

export default function DashboardAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAlerts = async () => {
      const results = await Promise.allSettled([
        fetch("/api/v1/incidents/?status=open&page_size=1", { credentials: "include" }).then(r => r.json()),
        fetch("/api/v1/safeguarding/?status=open&page_size=1", { credentials: "include" }).then(r => r.json()),
        fetch("/api/v1/medications/mar/?status=pending&page_size=1", { credentials: "include" }).then(r => r.json()),
        fetch("/api/v1/training/records/?status=expired&page_size=1", { credentials: "include" }).then(r => r.json()),
        fetch("/api/v1/messages/?channel=urgent&page_size=3", { credentials: "include" }).then(r => r.json()),
      ]);

      const newAlerts: Alert[] = [];

      const [incidents, safeguarding, pendingMeds, expiredTraining, urgentMsgs] = results;

      if (incidents.status === "fulfilled" && incidents.value?.count > 0) {
        newAlerts.push({
          id: "incidents",
          type: "critical",
          message: `${incidents.value.count} open incident${incidents.value.count > 1 ? "s" : ""} require${incidents.value.count === 1 ? "s" : ""} attention`,
          href: "/dashboard/incidents",
          icon: Shield,
        });
      }

      if (safeguarding.status === "fulfilled" && safeguarding.value?.count > 0) {
        newAlerts.push({
          id: "safeguarding",
          type: "critical",
          message: `${safeguarding.value.count} open safeguarding case${safeguarding.value.count > 1 ? "s" : ""}`,
          href: "/dashboard/safeguarding",
          icon: AlertTriangle,
        });
      }

      if (pendingMeds.status === "fulfilled" && pendingMeds.value?.count > 0) {
        newAlerts.push({
          id: "pending-meds",
          type: "warning",
          message: `${pendingMeds.value.count} medication${pendingMeds.value.count > 1 ? "s" : ""} pending administration`,
          href: "/dashboard/mar",
          icon: Pill,
        });
      }

      if (expiredTraining.status === "fulfilled" && expiredTraining.value?.count > 0) {
        newAlerts.push({
          id: "expired-training",
          type: "warning",
          message: `${expiredTraining.value.count} staff training record${expiredTraining.value.count > 1 ? "s" : ""} expired`,
          href: "/dashboard/training",
          icon: Star,
        });
      }

      if (urgentMsgs.status === "fulfilled") {
        const msgs = urgentMsgs.value?.results ?? urgentMsgs.value ?? [];
        if (msgs.length > 0) {
          newAlerts.push({
            id: "urgent-msgs",
            type: "info",
            message: `${msgs.length} urgent message${msgs.length > 1 ? "s" : ""} in the urgent channel`,
            href: "/dashboard/messages",
            icon: Clock,
          });
        }
      }

      setAlerts(newAlerts);
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60_000);
    return () => clearInterval(interval);
  }, []);

  const visible = alerts.filter(a => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  const typeStyle = {
    critical: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", color: "#f87171", dot: "#ef4444" },
    warning:  { bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)", color: "#fbbf24", dot: "#f59e0b" },
    info:     { bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.2)", color: "#60a5fa", dot: "#3b82f6" },
  };

  return (
    <div className="space-y-2 mb-5">
      {visible.slice(0, 4).map(alert => {
        const s = typeStyle[alert.type];
        const Icon = alert.icon;
        return (
          <div key={alert.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ background: s.dot }} />
            <Icon size={13} style={{ color: s.color, flexShrink: 0 }} />
            <span className="text-sm flex-1 font-medium" style={{ color: s.color }}>{alert.message}</span>
            <Link href={alert.href} className="text-xs flex items-center gap-1 flex-shrink-0 hover:underline"
              style={{ color: s.color }}>
              View <ChevronRight size={11} />
            </Link>
            <button onClick={() => setDismissed(d => new Set([...d, alert.id]))} className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity">
              <X size={13} style={{ color: s.color }} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
