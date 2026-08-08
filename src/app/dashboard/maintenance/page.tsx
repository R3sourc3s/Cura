"use client";

import { useEffect, useState, useCallback } from "react";
import { Wrench, Plus, X, Search, ChevronDown } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/Toast";

interface MaintenanceIssue {
  id: number; reported_by_name?: string; assigned_to: string;
  category: string; title: string; description: string; location: string;
  priority: "low"|"medium"|"high"|"urgent"; status: "open"|"in_progress"|"resolved"|"closed";
  resolved_at: string|null; resolution_notes: string; created_at: string; updated_at: string;
}

const PRIORITY = { urgent: { label:"Urgent", color:"var(--c-red)", bg:"rgba(239,68,68,0.12)" }, high: { label:"High", color:"var(--c-orange)", bg:"rgba(251,146,60,0.12)" }, medium: { label:"Medium", color:"var(--c-amber)", bg:"rgba(250,204,21,0.12)" }, low: { label:"Low", color:"var(--c-green)", bg:"rgba(52,211,153,0.12)" } } as const;
const STATUS = { open: { label:"Open", color:"var(--c-red)", bg:"rgba(239,68,68,0.12)" }, in_progress: { label:"In Progress", color:"var(--c-teal2)", bg:"rgba(45, 212, 191,0.12)" }, resolved: { label:"Resolved", color:"var(--c-green)", bg:"rgba(52,211,153,0.12)" }, closed: { label:"Closed", color:"#6b7280", bg:"rgba(107,114,128,0.1)" } } as const;
const CATEGORIES = ["electrical","plumbing","heating","equipment","safety","cleaning","other"];

export default function MaintenancePage() {
  const [issues, setIssues] = useState<MaintenanceIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editIssue, setEditIssue] = useState<MaintenanceIssue | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({ title: "", category: "other", description: "", location: "", priority: "medium", assigned_to: "" });
  const [editForm, setEditForm] = useState({ status: "open", assigned_to: "", resolution_notes: "" });

  const load = useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams({ ordering: "-created_at" });
    if (filterStatus) qs.set("status", filterStatus);
    if (filterPriority) qs.set("priority", filterPriority);
    fetch(`/api/v1/maintenance/?${qs}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setIssues(d.results ?? d))
      .catch(console.error).finally(() => setLoading(false));
  }, [filterStatus, filterPriority]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    if (!form.title) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/maintenance/", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { const n = await res.json(); setIssues(p => [n, ...p]); setShowCreate(false); setForm({ title: "", category: "other", description: "", location: "", priority: "medium", assigned_to: "" }); toast("Issue reported.", "success"); }
      else { toast("Could not report issue.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
    finally { setSaving(false); }
  }

  async function handleUpdate() {
    if (!editIssue) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/maintenance/${editIssue.id}/`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
      if (res.ok) { const updated = await res.json(); setIssues(p => p.map(i => i.id === editIssue.id ? updated : i)); setEditIssue(null); toast("Issue updated.", "success"); }
      else { toast("Could not update issue.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
    finally { setSaving(false); }
  }

  function openEdit(issue: MaintenanceIssue) {
    setEditIssue(issue);
    setEditForm({ status: issue.status, assigned_to: issue.assigned_to, resolution_notes: issue.resolution_notes });
  }

  const filtered = issues.filter(i => !search.trim() || i.title.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase()));
  const open = issues.filter(i => i.status === "open").length;
  const urgent = issues.filter(i => i.priority === "urgent" && i.status !== "closed").length;
  const inProgress = issues.filter(i => i.status === "in_progress").length;
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const resolvedWeek = issues.filter(i => i.status === "resolved" && i.updated_at >= weekAgo).length;

  const inputStyle = { background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(251,146,60,0.12)", border: "1px solid rgba(251,146,60,0.2)" }}>
            <Wrench size={16} style={{ color: "var(--c-orange)" }} />
          </div>
          <div><h1 className="text-lg font-bold text-white">Maintenance</h1><p className="text-xs" style={{ color: "var(--text-muted)" }}>Issue tracker</p></div>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white" style={{ background: "#0d9488" }}>
          <Plus size={14} /> Report Issue
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[{ label:"Open Issues", value:open, color:"var(--c-red)" }, { label:"Urgent", value:urgent, color:"#ef4444" }, { label:"In Progress", value:inProgress, color:"var(--c-teal2)" }, { label:"Resolved This Week", value:resolvedWeek, color:"var(--c-green)" }].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-hover)" }}>
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input type="text" placeholder="Search issues…" value={search} onChange={e => setSearch(e.target.value)} className="w-full text-sm pl-9 pr-4 py-2 rounded-xl outline-none" style={{ background: "var(--input-bg)", border: "1px solid var(--bg-card-hover)", color: "var(--text-secondary)" }} />
        </div>
        {[
          { value: filterStatus, set: setFilterStatus, opts: [["","All Status"],["open","Open"],["in_progress","In Progress"],["resolved","Resolved"],["closed","Closed"]] },
          { value: filterPriority, set: setFilterPriority, opts: [["","All Priority"],["urgent","Urgent"],["high","High"],["medium","Medium"],["low","Low"]] },
        ].map((f, i) => (
          <div key={i} className="relative">
            <select value={f.value} onChange={e => f.set(e.target.value)} className="text-sm pl-3 pr-8 py-2 rounded-xl outline-none appearance-none" style={{ background: "var(--input-bg)", border: "1px solid var(--bg-card-hover)", color: "var(--text-secondary)" }}>
              {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
          </div>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" /></div> : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <EmptyState icon={Wrench} title="No maintenance issues" description="Report a new issue to get started." action={{ label: "Report Issue", onClick: () => setShowCreate(true) }} />
          ) : filtered.map(issue => {
            const p = PRIORITY[issue.priority]; const s = STATUS[issue.status];
            return (
              <div key={issue.id} className="rounded-2xl p-4 cursor-pointer" style={{ background: "var(--bg-card)", border: `1px solid var(--border)` }} onClick={() => openEdit(issue)} onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(13, 148, 136,0.3)")} onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-white">{issue.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: p.bg, color: p.color }}>{p.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    </div>
                    {issue.location && <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{issue.location}</div>}
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{issue.description}</p>
                    {issue.assigned_to && <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Assigned: {issue.assigned_to}</div>}
                  </div>
                  <div className="text-xs text-right flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                    <div>{new Date(issue.created_at).toLocaleDateString("en-GB")}</div>
                    <div>{issue.reported_by_name ?? ""}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "var(--bg-elevated)", border: "1px solid rgba(13, 148, 136,0.25)" }}>
            <div className="flex items-center justify-between mb-5"><h3 className="text-base font-bold text-white">Report Issue</h3><button onClick={() => setShowCreate(false)} style={{ color: "var(--text-muted)" }}><X size={18} /></button></div>
            <div className="space-y-3">
              {[
                { label: "Title *", el: <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="Brief description" /> },
                { label: "Category", el: <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>{CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}</select> },
                { label: "Priority", el: <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>{["low","medium","high","urgent"].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}</select> },
                { label: "Location", el: <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="Room, corridor…" /> },
                { label: "Description", el: <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={inputStyle} /> },
                { label: "Assigned To", el: <input value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="Contractor / staff name" /> },
              ].map(({ label, el }) => <div key={label}><label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>{label}</label>{el}</div>)}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{ background: "var(--bg-card-hover)", color: "var(--text-secondary)", border: "1px solid var(--bg-card-hover)" }}>Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.title} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{ background: "#0d9488" }}>{saving ? "Saving…" : "Report"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "var(--bg-elevated)", border: "1px solid rgba(13, 148, 136,0.25)" }}>
            <div className="flex items-center justify-between mb-3"><h3 className="text-base font-bold text-white">{editIssue.title}</h3><button onClick={() => setEditIssue(null)} style={{ color: "var(--text-muted)" }}><X size={18} /></button></div>
            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>{editIssue.description}</p>
            <div className="space-y-3">
              {[
                { label: "Status", el: <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>{["open","in_progress","resolved","closed"].map(s => <option key={s} value={s}>{STATUS[s as keyof typeof STATUS]?.label}</option>)}</select> },
                { label: "Assigned To", el: <input value={editForm.assigned_to} onChange={e => setEditForm(f => ({ ...f, assigned_to: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} /> },
                { label: "Resolution Notes", el: <textarea rows={3} value={editForm.resolution_notes} onChange={e => setEditForm(f => ({ ...f, resolution_notes: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={inputStyle} /> },
              ].map(({ label, el }) => <div key={label}><label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>{label}</label>{el}</div>)}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditIssue(null)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{ background: "var(--bg-card-hover)", color: "var(--text-secondary)", border: "1px solid var(--bg-card-hover)" }}>Cancel</button>
              <button onClick={handleUpdate} disabled={saving} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{ background: "#0d9488" }}>{saving ? "Saving…" : "Update"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
