"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import LinkedDocuments from "@/components/documents/LinkedDocuments";
import {
  User as UserIcon, Mail, Phone, Shield, FolderOpen, CalendarRange,
  GraduationCap, CalendarOff, ArrowLeft, Pencil,
} from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin", manager: "Care Manager", nurse: "Nurse", carer: "Carer", hr: "HR", family: "Family",
};

interface StaffUser {
  id: number; username: string; email: string; first_name: string; last_name: string;
  full_name: string; role: string; phone: string; avatar?: string | null;
}

type Tab = "overview" | "documents" | "shifts" | "training" | "leave";
const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview",  label: "Overview",  icon: UserIcon },
  { id: "documents", label: "Documents", icon: FolderOpen },
  { id: "shifts",    label: "Shifts",    icon: CalendarRange },
  { id: "training",  label: "Training",  icon: GraduationCap },
  { id: "leave",     label: "Leave",     icon: CalendarOff },
];

function fmtDate(d?: string | null) { return d ? new Date(d).toLocaleDateString("en-GB") : "—"; }
function Spinner() { return <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" /></div>; }
function Empty({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="text-center py-12 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <Icon size={28} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{text}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const s = (status || "").toLowerCase();
  const cfg = s.includes("valid") || s.includes("approv") || s.includes("complet")
    ? { c: "var(--c-green)", bg: "rgba(52,211,153,0.12)" }
    : s.includes("expir") || s.includes("reject") || s.includes("overdue")
    ? { c: "var(--c-red)", bg: "rgba(239,68,68,0.12)" }
    : { c: "var(--c-amber)", bg: "rgba(251,191,36,0.12)" };
  return <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize" style={{ color: cfg.c, background: cfg.bg }}>{status || "—"}</span>;
}

// ── Shifts tab ──
function ShiftsTab({ staffId }: { staffId: number }) {
  const [rows, setRows] = useState<Array<{ id: number; date: string; shift_type: string; start_time: string; end_time: string; is_agency: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`/api/v1/staff/shifts/?staff_member=${staffId}&ordering=-date&page_size=60`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] }).then(d => setRows(d.results ?? d)).catch(console.error).finally(() => setLoading(false));
  }, [staffId]);
  if (loading) return <Spinner />;
  if (rows.length === 0) return <Empty icon={CalendarRange} text="No shifts recorded for this staff member." />;
  return (
    <div className="space-y-2">
      {rows.map(s => (
        <div key={s.id} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium capitalize" style={{ color: "var(--text-primary)" }}>{s.shift_type}</div>
            {s.is_agency && <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: "var(--c-amber)", background: "rgba(251,191,36,0.12)" }}>Agency</span>}
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>{fmtDate(s.date)} · {(s.start_time || "").slice(0,5)}–{(s.end_time || "").slice(0,5)}</div>
        </div>
      ))}
    </div>
  );
}

// ── Training tab ──
function TrainingTab({ staffId }: { staffId: number }) {
  const [rows, setRows] = useState<Array<{ id: number; course_name_display?: string; course_name?: string; completed_date?: string; expiry_date?: string; status: string }>>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`/api/v1/training/records/?staff_member=${staffId}&page_size=60`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] }).then(d => setRows(d.results ?? d)).catch(console.error).finally(() => setLoading(false));
  }, [staffId]);
  if (loading) return <Spinner />;
  if (rows.length === 0) return <Empty icon={GraduationCap} text="No training records for this staff member." />;
  return (
    <div className="space-y-2">
      {rows.map(t => (
        <div key={t.id} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div>
            <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{t.course_name_display || t.course_name || "Training"}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Completed {fmtDate(t.completed_date)}{t.expiry_date ? ` · Expires ${fmtDate(t.expiry_date)}` : ""}</div>
          </div>
          <StatusPill status={t.status} />
        </div>
      ))}
    </div>
  );
}

// ── Leave tab ──
function LeaveTab({ staffId }: { staffId: number }) {
  const [rows, setRows] = useState<Array<{ id: number; leave_type_name?: string; leave_type?: string; start_date: string; end_date: string; status: string; reason?: string }>>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`/api/v1/leave/requests/?staff_member=${staffId}&page_size=60`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] }).then(d => setRows(d.results ?? d)).catch(console.error).finally(() => setLoading(false));
  }, [staffId]);
  if (loading) return <Spinner />;
  if (rows.length === 0) return <Empty icon={CalendarOff} text="No leave requests for this staff member." />;
  return (
    <div className="space-y-2">
      {rows.map(l => (
        <div key={l.id} className="rounded-xl px-4 py-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium capitalize" style={{ color: "var(--text-primary)" }}>{l.leave_type_name || l.leave_type || "Leave"}</div>
            <StatusPill status={l.status} />
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{fmtDate(l.start_date)} → {fmtDate(l.end_date)}{l.reason ? ` · ${l.reason}` : ""}</div>
        </div>
      ))}
    </div>
  );
}

// ── Overview tab ──
function OverviewTab({ user }: { user: StaffUser }) {
  const rows: [React.ElementType, string, string][] = [
    [Shield, "Role", ROLE_LABELS[user.role] ?? user.role],
    [Mail, "Email", user.email || "—"],
    [Phone, "Phone", user.phone || "—"],
    [UserIcon, "Username", `@${user.username}`],
  ];
  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border-strong)" }}>
      {rows.map(([Icon, label, value]) => (
        <div key={label} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <span className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}><Icon size={14} /> {label}</span>
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

export default function StaffProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { can } = useUser();
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    fetch(`/api/v1/auth/users/${id}/`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null).then(setUser).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!user) return (
    <div className="max-w-3xl mx-auto py-16 text-center">
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>Staff member not found.</p>
      <button onClick={() => router.push("/dashboard/team")} className="mt-4 text-sm" style={{ color: "var(--c-teal)" }}>← Back to Team</button>
    </div>
  );

  const initials = `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <Breadcrumbs crumbs={[{ label: "Team", href: "/dashboard/team" }, { label: user.full_name }]} />

      {/* Header */}
      <div className="rounded-2xl p-5 flex items-center gap-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border-strong)" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0 text-white" style={{ background: "#0d9488" }}>
          {user.avatar ? <img src={user.avatar} alt={user.full_name} className="w-full h-full rounded-2xl object-cover" /> : initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-lg font-bold text-white">{user.full_name}</div>
          <div className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>@{user.username}</div>
          <div className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: "var(--c-teal)", background: "rgba(13, 148, 136,0.1)" }}>
            <Shield size={11} /> {ROLE_LABELS[user.role] ?? user.role}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/dashboard/team" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl" style={{ background: "var(--bg-card-hover)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
            <ArrowLeft size={13} /> Team
          </Link>
          {can("staff.manage") && (
            <Link href="/dashboard/team" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl text-white" style={{ background: "#0d9488" }}>
              <Pencil size={13} /> Manage
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap">
        {TABS.map(({ id: tid, label, icon: Icon }) => (
          <button key={tid} onClick={() => setTab(tid)}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium transition-all"
            style={ tab === tid ? { background: "rgba(13, 148, 136,0.15)", color: "var(--c-teal)", border: "1px solid rgba(13, 148, 136,0.3)" } : { background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid transparent" }}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview"  && <OverviewTab user={user} />}
      {tab === "documents" && <LinkedDocuments staffId={user.id} emptyHint="Link documents to this staff member in the Document Vault." />}
      {tab === "shifts"    && <ShiftsTab staffId={user.id} />}
      {tab === "training"  && <TrainingTab staffId={user.id} />}
      {tab === "leave"     && <LeaveTab staffId={user.id} />}
    </div>
  );
}
