"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Heart, Plus, X, Search, Filter, ChevronDown, Star, Phone, Mail,
  Shield, Key, MessageSquare, Users, ArrowDownLeft, ArrowUpRight,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

/* ─── Types ─────────────────────────────────────────────────── */
interface FamilyMember {
  id: number;
  resident: number;
  resident_name?: string;
  first_name: string;
  last_name: string;
  relationship: string;
  phone: string;
  email: string;
  is_primary_contact: boolean;
  is_emergency_contact: boolean;
  has_lasting_power_of_attorney: boolean;
  portal_access: boolean;
  notes: string;
  created_at: string;
}

interface FamilyMessage {
  id: number;
  resident: number;
  resident_name?: string;
  family_member: number | null;
  family_member_name?: string | null;
  direction: "inbound" | "outbound";
  subject: string;
  body: string;
  status: "unread" | "read" | "replied" | "archived";
  sent_by_staff: number | null;
  sent_by_name?: string;
  sent_at: string;
}

interface Resident { id: number; full_name: string; }

/* ─── Config ─────────────────────────────────────────────────── */
const RELATIONSHIPS = [
  "spouse", "child", "sibling", "parent", "grandchild",
  "legal_guardian", "friend", "other",
] as const;

const REL_LABEL: Record<string, string> = {
  spouse: "Spouse/Partner", child: "Child", sibling: "Sibling",
  parent: "Parent", grandchild: "Grandchild", legal_guardian: "Legal Guardian",
  friend: "Friend", other: "Other",
};

const REL_COLOR: Record<string, { color: string; bg: string }> = {
  spouse:        { color: "#f472b6", bg: "rgba(244,114,182,0.12)" },
  child:         { color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  sibling:       { color: "#2dd4bf", bg: "rgba(45,212,191,0.12)" },
  parent:        { color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  grandchild:    { color: "#fb923c", bg: "rgba(251,146,60,0.12)" },
  legal_guardian:{ color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  friend:        { color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  other:         { color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
};

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  unread:   { label: "Unread",   color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  read:     { label: "Read",     color: "#94a3b8", bg: "rgba(148,163,184,0.10)" },
  replied:  { label: "Replied",  color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  archived: { label: "Archived", color: "#475569", bg: "rgba(71,85,105,0.12)" },
};

/* ─── Helpers ────────────────────────────────────────────────── */
function fieldStyle() {
  return {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.8)",
  } as React.CSSProperties;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString("en-GB");
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function FamilyPage() {
  /* state */
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [messages, setMessages] = useState<FamilyMessage[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [activeTab, setActiveTab] = useState<"members" | "messages">("members");

  /* member filters */
  const [memberSearch, setMemberSearch] = useState("");

  /* message filters */
  const [msgSearch, setMsgSearch] = useState("");
  const [filterDirection, setFilterDirection] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  /* modals */
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [saving, setSaving] = useState(false);

  /* forms */
  const blankMemberForm = {
    resident: "", first_name: "", last_name: "", relationship: "child",
    phone: "", email: "", is_primary_contact: false, is_emergency_contact: false,
    has_lasting_power_of_attorney: false, portal_access: false, notes: "",
  };
  const blankMessageForm = {
    resident: "", family_member: "", subject: "", body: "",
  };
  const [memberForm, setMemberForm] = useState(blankMemberForm);
  const [messageForm, setMessageForm] = useState(blankMessageForm);

  /* fetch members */
  const loadMembers = useCallback(() => {
    setLoadingMembers(true);
    fetch("/api/v1/family/members/?page_size=200", { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setMembers(d.results ?? d))
      .catch(console.error)
      .finally(() => setLoadingMembers(false));
  }, []);

  /* fetch messages */
  const loadMessages = useCallback(() => {
    setLoadingMessages(true);
    const qs = new URLSearchParams({ ordering: "-sent_at", page_size: "100" });
    if (filterDirection) qs.set("direction", filterDirection);
    if (filterStatus) qs.set("status", filterStatus);
    fetch(`/api/v1/family/messages/?${qs}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setMessages(d.results ?? d))
      .catch(console.error)
      .finally(() => setLoadingMessages(false));
  }, [filterDirection, filterStatus]);

  useEffect(() => { loadMembers(); }, [loadMembers]);
  useEffect(() => { loadMessages(); }, [loadMessages]);

  useEffect(() => {
    fetch("/api/v1/residents/?is_active=true&page_size=200", { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setResidents(d.results ?? []));
  }, []);

  /* stats */
  const totalMembers = members.length;
  const primaryContacts = members.filter(m => m.is_primary_contact).length;
  const unreadMessages = messages.filter(m => m.status === "unread").length;
  const portalAccess = members.filter(m => m.portal_access).length;

  /* filtered views */
  const filteredMembers = members.filter(m => {
    if (!memberSearch.trim()) return true;
    const q = memberSearch.toLowerCase();
    return (
      m.first_name.toLowerCase().includes(q) ||
      m.last_name.toLowerCase().includes(q) ||
      (m.resident_name ?? "").toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    );
  });

  const filteredMessages = messages.filter(m => {
    if (!msgSearch.trim()) return true;
    const q = msgSearch.toLowerCase();
    return (
      m.subject.toLowerCase().includes(q) ||
      (m.resident_name ?? "").toLowerCase().includes(q) ||
      (m.family_member_name ?? "").toLowerCase().includes(q)
    );
  });

  /* group members by resident */
  const membersByResident = filteredMembers.reduce<Record<string, { name: string; members: FamilyMember[] }>>(
    (acc, m) => {
      const key = String(m.resident);
      if (!acc[key]) acc[key] = { name: m.resident_name ?? `Resident #${m.resident}`, members: [] };
      acc[key].members.push(m);
      return acc;
    },
    {}
  );

  /* save member */
  async function handleSaveMember() {
    if (!memberForm.resident || !memberForm.first_name || !memberForm.last_name) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/family/members/", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...memberForm, resident: Number(memberForm.resident) }),
      });
      if (res.ok) {
        const m = await res.json();
        setMembers(p => [m, ...p]);
        setShowMemberModal(false);
        setMemberForm(blankMemberForm);
      }
    } finally { setSaving(false); }
  }

  /* save message */
  async function handleSaveMessage() {
    if (!messageForm.resident || !messageForm.subject || !messageForm.body) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        direction: "outbound",
        resident: Number(messageForm.resident),
        subject: messageForm.subject,
        body: messageForm.body,
      };
      if (messageForm.family_member) payload.family_member = Number(messageForm.family_member);
      const res = await fetch("/api/v1/family/messages/", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(p => [msg, ...p]);
        setShowMessageModal(false);
        setMessageForm(blankMessageForm);
      }
    } finally { setSaving(false); }
  }

  /* mark message as read */
  async function markRead(msg: FamilyMessage) {
    if (msg.status !== "unread") return;
    const res = await fetch(`/api/v1/family/messages/${msg.id}/`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "read" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setMessages(p => p.map(m => m.id === updated.id ? updated : m));
    }
  }

  /* residents for selected member resident filter in message modal */
  const membersForResident = messageForm.resident
    ? members.filter(m => String(m.resident) === messageForm.resident)
    : [];

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <div className="space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(244,114,182,0.12)", border: "1px solid rgba(244,114,182,0.2)" }}>
            <Heart size={16} style={{ color: "#f472b6" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Family Portal</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Family members &amp; communications</p>
          </div>
        </div>
        <button
          onClick={() => activeTab === "members" ? setShowMemberModal(true) : setShowMessageModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
          <Plus size={14} />
          {activeTab === "members" ? "Add Family Member" : "New Message"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Family Members", value: totalMembers, color: "#f472b6", icon: Users },
          { label: "Primary Contacts", value: primaryContacts, color: "#34d399", icon: Star },
          { label: "Unread Messages", value: unreadMessages, color: "#fbbf24", icon: MessageSquare },
          { label: "Has Portal Access", value: portalAccess, color: "#60a5fa", icon: Key },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="rounded-2xl p-4 text-center"
            style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-hover)" }}>
            <div className="flex justify-center mb-1">
              <Icon size={14} style={{ color }} />
            </div>
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-hover)" }}>
        {(["members", "messages"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-1.5 text-sm font-medium rounded-lg transition-colors"
            style={activeTab === tab
              ? { background: "linear-gradient(135deg, #7c3aed, #3b82f6)", color: "#fff" }
              : { color: "var(--text-muted)" }}>
            {tab === "members" ? "Family Members" : "Messages"}
          </button>
        ))}
      </div>

      {/* ── Family Members Tab ── */}
      {activeTab === "members" && (
        <>
          {/* Search */}
          <div className="relative max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input type="text" placeholder="Search name, email, resident…" value={memberSearch}
              onChange={e => setMemberSearch(e.target.value)}
              className="w-full text-sm pl-9 pr-4 py-2 rounded-xl outline-none"
              style={{ background: "var(--input-bg)", border: "1px solid var(--bg-card-hover)", color: "var(--text-secondary)" }} />
          </div>

          {loadingMembers ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
            </div>
          ) : Object.keys(membersByResident).length === 0 ? (
            <EmptyState icon={Users} title="No family members found"
              description="Add a family member to get started."
              action={{ label: "Add Family Member", onClick: () => setShowMemberModal(true) }} />
          ) : (
            <div className="space-y-5">
              {Object.entries(membersByResident).map(([resId, { name, members: rMembers }]) => (
                <div key={resId}>
                  <p className="text-xs font-semibold mb-2 uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}>{name}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {rMembers.map(member => {
                      const rel = REL_COLOR[member.relationship] ?? REL_COLOR.other;
                      return (
                        <div key={member.id} className="rounded-2xl p-4"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-white truncate">
                                  {member.first_name} {member.last_name}
                                </span>
                                {member.is_primary_contact && (
                                  <Star size={12} style={{ color: "#fbbf24", fill: "#fbbf24", flexShrink: 0 }} />
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                  style={{ background: rel.bg, color: rel.color }}>
                                  {REL_LABEL[member.relationship] ?? member.relationship}
                                </span>
                                {member.is_emergency_contact && (
                                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                    style={{ background: "rgba(248,113,113,0.12)", color: "#f87171" }}>
                                    <Shield size={10} className="inline mr-0.5" />Emergency
                                  </span>
                                )}
                                {member.has_lasting_power_of_attorney && (
                                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                    style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24" }}>
                                    <Key size={10} className="inline mr-0.5" />LPA
                                  </span>
                                )}
                                {member.portal_access && (
                                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                    style={{ background: "rgba(96,165,250,0.12)", color: "#60a5fa" }}>
                                    Portal
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1 mt-2">
                            {member.phone && (
                              <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                                <Phone size={11} style={{ flexShrink: 0 }} />
                                <span className="truncate">{member.phone}</span>
                              </div>
                            )}
                            {member.email && (
                              <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                                <Mail size={11} style={{ flexShrink: 0 }} />
                                <span className="truncate">{member.email}</span>
                              </div>
                            )}
                          </div>
                          {member.notes && (
                            <p className="text-xs mt-2 leading-relaxed"
                              style={{ color: "rgba(255,255,255,0.35)" }}>
                              {member.notes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Messages Tab ── */}
      {activeTab === "messages" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input type="text" placeholder="Search subject, resident, sender…" value={msgSearch}
                onChange={e => setMsgSearch(e.target.value)}
                className="w-full text-sm pl-9 pr-4 py-2 rounded-xl outline-none"
                style={{ background: "var(--input-bg)", border: "1px solid var(--bg-card-hover)", color: "var(--text-secondary)" }} />
            </div>
            {[
              {
                value: filterDirection, set: setFilterDirection,
                opts: [["", "All Directions"], ["inbound", "Inbound"], ["outbound", "Outbound"]],
              },
              {
                value: filterStatus, set: setFilterStatus,
                opts: [["", "All Statuses"], ["unread", "Unread"], ["read", "Read"], ["replied", "Replied"], ["archived", "Archived"]],
              },
            ].map((f, i) => (
              <div key={i} className="relative">
                <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(255,255,255,0.25)" }} />
                <select value={f.value} onChange={e => f.set(e.target.value)}
                  className="text-sm pl-8 pr-8 py-2 rounded-xl outline-none appearance-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
                  {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "rgba(255,255,255,0.3)" }} />
              </div>
            ))}
          </div>

          {loadingMessages ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
          ) : filteredMessages.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No messages found"
              description="Compose a new message to a family member."
              action={{ label: "New Message", onClick: () => setShowMessageModal(true) }} />
          ) : (
            <div className="space-y-2">
              {filteredMessages.map(msg => {
                const status = STATUS_CFG[msg.status] ?? STATUS_CFG.read;
                const isInbound = msg.direction === "inbound";
                return (
                  <div key={msg.id}
                    onClick={() => markRead(msg)}
                    className="rounded-2xl p-4 cursor-pointer transition-colors"
                    style={{
                      background: msg.status === "unread"
                        ? "rgba(251,191,36,0.04)"
                        : "rgba(255,255,255,0.02)",
                      border: msg.status === "unread"
                        ? "1px solid rgba(251,191,36,0.15)"
                        : "1px solid rgba(255,255,255,0.06)",
                    }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {/* direction badge */}
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                            style={isInbound
                              ? { background: "rgba(96,165,250,0.12)", color: "#60a5fa" }
                              : { background: "rgba(167,139,250,0.12)", color: "#a78bfa" }}>
                            {isInbound
                              ? <ArrowDownLeft size={10} />
                              : <ArrowUpRight size={10} />}
                            {isInbound ? "Inbound" : "Outbound"}
                          </span>
                          {/* status badge */}
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: status.bg, color: status.color }}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-white truncate">{msg.subject}</p>
                        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                          {msg.body}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                            {msg.resident_name ?? `Resident #${msg.resident}`}
                          </span>
                          {msg.family_member_name && (
                            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                              {msg.family_member_name}
                            </span>
                          )}
                          {msg.sent_by_name && (
                            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                              {msg.sent_by_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{timeAgo(msg.sent_at)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Add Family Member Modal ── */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-lg my-4"
            style={{ background: "#0f1629", border: "1px solid rgba(124,58,237,0.25)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Add Family Member</h3>
              <button onClick={() => { setShowMemberModal(false); setMemberForm(blankMemberForm); }}
                style={{ color: "rgba(255,255,255,0.4)" }}>
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {/* Resident */}
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Resident *</label>
                <select value={memberForm.resident}
                  onChange={e => setMemberForm(f => ({ ...f, resident: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={fieldStyle()}>
                  <option value="">Select resident…</option>
                  {residents.map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
                </select>
              </div>
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>First Name *</label>
                  <input type="text" placeholder="First name" value={memberForm.first_name}
                    onChange={e => setMemberForm(f => ({ ...f, first_name: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={fieldStyle()} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Last Name *</label>
                  <input type="text" placeholder="Last name" value={memberForm.last_name}
                    onChange={e => setMemberForm(f => ({ ...f, last_name: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={fieldStyle()} />
                </div>
              </div>
              {/* Relationship */}
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Relationship</label>
                <select value={memberForm.relationship}
                  onChange={e => setMemberForm(f => ({ ...f, relationship: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={fieldStyle()}>
                  {RELATIONSHIPS.map(r => <option key={r} value={r}>{REL_LABEL[r]}</option>)}
                </select>
              </div>
              {/* Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Phone</label>
                  <input type="tel" placeholder="+44…" value={memberForm.phone}
                    onChange={e => setMemberForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={fieldStyle()} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Email</label>
                  <input type="email" placeholder="email@example.com" value={memberForm.email}
                    onChange={e => setMemberForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={fieldStyle()} />
                </div>
              </div>
              {/* Flags */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "is_primary_contact", label: "Primary Contact" },
                  { key: "is_emergency_contact", label: "Emergency Contact" },
                  { key: "has_lasting_power_of_attorney", label: "Has LPA" },
                  { key: "portal_access", label: "Portal Access" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox"
                      checked={memberForm[key as keyof typeof memberForm] as boolean}
                      onChange={e => setMemberForm(f => ({ ...f, [key]: e.target.checked }))}
                      className="rounded accent-purple-500" />
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{label}</span>
                  </label>
                ))}
              </div>
              {/* Notes */}
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Notes</label>
                <textarea rows={3} placeholder="Any additional notes…" value={memberForm.notes}
                  onChange={e => setMemberForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={fieldStyle()} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowMemberModal(false); setMemberForm(blankMemberForm); }}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}>
                Cancel
              </button>
              <button onClick={handleSaveMember}
                disabled={saving || !memberForm.resident || !memberForm.first_name || !memberForm.last_name}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── New Message Modal ── */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-lg my-4"
            style={{ background: "#0f1629", border: "1px solid rgba(124,58,237,0.25)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">New Message to Family</h3>
              <button onClick={() => { setShowMessageModal(false); setMessageForm(blankMessageForm); }}
                style={{ color: "rgba(255,255,255,0.4)" }}>
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {/* Resident */}
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Resident *</label>
                <select value={messageForm.resident}
                  onChange={e => setMessageForm(f => ({ ...f, resident: e.target.value, family_member: "" }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={fieldStyle()}>
                  <option value="">Select resident…</option>
                  {residents.map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
                </select>
              </div>
              {/* Family Member (optional) */}
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Family Member (optional)</label>
                <select value={messageForm.family_member}
                  onChange={e => setMessageForm(f => ({ ...f, family_member: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={fieldStyle()}
                  disabled={!messageForm.resident}>
                  <option value="">— none —</option>
                  {membersForResident.map(m => (
                    <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                  ))}
                </select>
              </div>
              {/* Subject */}
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Subject *</label>
                <input type="text" placeholder="Message subject…" value={messageForm.subject}
                  onChange={e => setMessageForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={fieldStyle()} />
              </div>
              {/* Body */}
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Message *</label>
                <textarea rows={5} placeholder="Write your message…" value={messageForm.body}
                  onChange={e => setMessageForm(f => ({ ...f, body: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={fieldStyle()} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowMessageModal(false); setMessageForm(blankMessageForm); }}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}>
                Cancel
              </button>
              <button onClick={handleSaveMessage}
                disabled={saving || !messageForm.resident || !messageForm.subject || !messageForm.body}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
                {saving ? "Sending…" : "Send Message"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
