"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CheckSquare, Plus, X, Search, Filter, ChevronDown, Check, AlertCircle, Clock, Ban,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/Toast";

interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  assigned_to: number | null;
  assigned_to_name?: string;
  created_by: number | null;
  created_by_name?: string;
  resident: number | null;
  resident_name?: string;
  due_date: string | null;
  completed_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface Resident {
  id: number;
  full_name: string;
}

const PRIORITY_CFG = {
  low:    { label: "Low",    color: "rgba(var(--fg-rgb),0.5)",  bg: "rgba(var(--fg-rgb),0.07)" },
  medium: { label: "Medium", color: "var(--c-teal2)",                bg: "rgba(45, 212, 191,0.12)"  },
  high:   { label: "High",   color: "var(--c-orange)",                bg: "rgba(251,146,60,0.12)"  },
  urgent: { label: "Urgent", color: "var(--c-red)",                bg: "rgba(248,113,113,0.15)" },
} as const;

const STATUS_CFG = {
  pending:     { label: "Pending",     icon: Clock,        color: "var(--c-amber)", bg: "rgba(251,191,36,0.10)"  },
  in_progress: { label: "In Progress", icon: AlertCircle,  color: "var(--c-teal2)", bg: "rgba(45, 212, 191,0.10)"  },
  completed:   { label: "Completed",   icon: Check,        color: "var(--c-green)", bg: "rgba(52,211,153,0.10)"  },
  cancelled:   { label: "Cancelled",   icon: Ban,          color: "#6b7280", bg: "rgba(107,114,128,0.10)" },
} as const;

const CATEGORY_LABEL: Record<string, string> = {
  care: "Care", admin: "Administrative", maintenance: "Maintenance",
  medication: "Medication", safety: "Safety", general: "General",
};

const CATEGORIES = ["care", "admin", "maintenance", "medication", "safety", "general"];
const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
const STATUSES = ["pending", "in_progress", "completed", "cancelled"] as const;

const FIELD_STYLE: React.CSSProperties = {
  background: "rgba(var(--fg-rgb),0.05)",
  border: "1px solid rgba(var(--fg-rgb),0.1)",
  color: "rgba(var(--fg-rgb),0.85)",
};

function inputClass() {
  return "w-full text-sm px-3 py-2 rounded-xl outline-none";
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "general",
    assigned_to_text: "",
    resident: "",
    due_date: "",
    notes: "",
  });

  const load = useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams({ page_size: "100" });
    if (filterPriority) qs.set("priority", filterPriority);
    if (filterCategory) qs.set("category", filterCategory);
    fetch(`/api/v1/tasks/?${qs}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setTasks(d.results ?? d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterPriority, filterCategory]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch("/api/v1/residents/?is_active=true&page_size=100", { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setResidents(d.results ?? []));
  }, []);

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        category: form.category,
        notes: form.notes,
      };
      if (form.resident) body.resident = Number(form.resident);
      if (form.due_date) body.due_date = new Date(form.due_date).toISOString();
      const res = await fetch("/api/v1/tasks/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const t = await res.json();
        setTasks(prev => [t, ...prev]);
        setShowModal(false);
        setForm({ title: "", description: "", priority: "medium", category: "general", assigned_to_text: "", resident: "", due_date: "", notes: "" });
        toast("Task created.", "success");
      } else { toast("Could not create task.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
    finally {
      setSaving(false);
    }
  }

  async function updateStatus(task: Task, newStatus: string) {
    setUpdatingId(task.id);
    try {
      const res = await fetch(`/api/v1/tasks/${task.id}/`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
        toast(`Task marked ${newStatus.replace("_", " ")}.`, "success");
      } else { toast("Could not update task.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
    finally {
      setUpdatingId(null);
    }
  }

  async function markComplete(task: Task) {
    await updateStatus(task, "completed");
  }

  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const filtered = tasks.filter(t => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return t.title.toLowerCase().includes(q) || (t.description ?? "").toLowerCase().includes(q);
  });

  // Stats
  const totalCount = tasks.length;
  const pendingCount = tasks.filter(t => t.status === "pending").length;
  const inProgressCount = tasks.filter(t => t.status === "in_progress").length;
  const completedTodayCount = tasks.filter(t => t.status === "completed" && t.completed_at?.startsWith(today)).length;

  // Group for status columns
  const grouped: Record<string, Task[]> = { pending: [], in_progress: [], completed: [], cancelled: [] };
  for (const t of filtered) {
    if (grouped[t.status]) grouped[t.status].push(t);
  }

  function isOverdue(task: Task) {
    return task.due_date && task.status !== "completed" && task.status !== "cancelled" && new Date(task.due_date) < now;
  }

  function TaskCard({ task }: { task: Task }) {
    const pri = PRIORITY_CFG[task.priority] ?? PRIORITY_CFG.medium;
    const catLabel = CATEGORY_LABEL[task.category] ?? task.category;
    const overdue = isOverdue(task);
    const canComplete = task.status === "pending" || task.status === "in_progress";
    const isUpdating = updatingId === task.id;

    return (
      <div className="rounded-2xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        {/* Title + priority badge */}
        <div className="flex items-start gap-2 mb-2">
          <p className="flex-1 text-sm font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>{task.title}</p>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
            style={{ background: pri.bg, color: pri.color }}>{pri.label}</span>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs mb-2 leading-relaxed line-clamp-2" style={{ color: "var(--text-muted)" }}>{task.description}</p>
        )}

        {/* Category + resident */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(var(--fg-rgb),0.05)", color: "var(--text-muted)" }}>{catLabel}</span>
          {task.resident_name && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(13, 148, 136,0.10)", color: "var(--c-teal)" }}>{task.resident_name}</span>
          )}
        </div>

        {/* Assignee + due date */}
        <div className="flex items-center justify-between gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
          <span>{task.assigned_to_name ?? (task.assigned_to ? `User #${task.assigned_to}` : "Unassigned")}</span>
          {task.due_date && (
            <span style={{ color: overdue ? "var(--c-red)" : "var(--text-muted)" }}>
              {overdue ? "Overdue · " : "Due "}
              {new Date(task.due_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
            </span>
          )}
        </div>

        {/* Actions row */}
        <div className="flex items-center gap-2 mt-3">
          {/* Status dropdown */}
          <div className="relative flex-1">
            <select
              disabled={isUpdating}
              value={task.status}
              onChange={e => updateStatus(task, e.target.value)}
              className="w-full text-xs pl-2 pr-6 py-1.5 rounded-lg outline-none appearance-none disabled:opacity-50"
              style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.08)", color: "rgba(var(--fg-rgb),0.6)" }}
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{STATUS_CFG[s].label}</option>
              ))}
            </select>
            <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(var(--fg-rgb),0.3)" }} />
          </div>

          {/* Mark Complete shortcut */}
          {canComplete && (
            <button
              disabled={isUpdating}
              onClick={() => markComplete(task)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
              style={{ background: "rgba(52,211,153,0.12)", color: "var(--c-green)", border: "1px solid rgba(52,211,153,0.2)" }}
            >
              <Check size={11} />
              {isUpdating ? "…" : "Done"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(13, 148, 136,0.12)", border: "1px solid rgba(13, 148, 136,0.2)" }}>
            <CheckSquare size={16} style={{ color: "var(--c-teal)" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Tasks</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Manage and track care home tasks</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white"
          style={{ background: "#0d9488" }}
        >
          <Plus size={14} /> Add Task
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Tasks",       value: totalCount,          color: "var(--c-teal)" },
          { label: "Pending",           value: pendingCount,        color: "var(--c-amber)" },
          { label: "In Progress",       value: inProgressCount,     color: "var(--c-teal2)" },
          { label: "Completed Today",   value: completedTodayCount, color: "var(--c-green)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4 text-center"
            style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-hover)" }}>
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search tasks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-sm pl-9 pr-4 py-2 rounded-xl outline-none"
            style={{ background: "var(--input-bg)", border: "1px solid var(--bg-card-hover)", color: "var(--text-secondary)" }}
          />
        </div>
        {[
          { value: filterPriority, set: setFilterPriority, opts: [["", "All Priorities"], ...PRIORITIES.map(p => [p, PRIORITY_CFG[p].label])] },
          { value: filterCategory, set: setFilterCategory, opts: [["", "All Categories"], ...CATEGORIES.map(c => [c, CATEGORY_LABEL[c]])] },
        ].map((f, i) => (
          <div key={i} className="relative">
            <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(var(--fg-rgb),0.25)" }} />
            <select
              value={f.value}
              onChange={e => f.set(e.target.value)}
              className="text-sm pl-8 pr-8 py-2 rounded-xl outline-none appearance-none"
              style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.08)", color: "rgba(var(--fg-rgb),0.6)" }}
            >
              {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(var(--fg-rgb),0.3)" }} />
          </div>
        ))}
      </div>

      {/* Board */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description="Create a task to track work across the care home."
          action={{ label: "Add Task", onClick: () => setShowModal(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {STATUSES.map(status => {
            const cfg = STATUS_CFG[status];
            const StatusIcon = cfg.icon;
            const col = grouped[status] ?? [];
            return (
              <div key={status} className="flex flex-col gap-3">
                {/* Column header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <StatusIcon size={14} style={{ color: cfg.color }} />
                    <span className="text-sm font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: cfg.bg, color: cfg.color }}>{col.length}</span>
                </div>
                {/* Cards */}
                <div className="flex flex-col gap-3">
                  {col.length === 0 ? (
                    <div className="rounded-2xl p-5 text-center text-xs" style={{ color: "var(--text-muted)", background: "rgba(var(--fg-rgb),0.02)", border: "1px dashed rgba(var(--fg-rgb),0.06)" }}>
                      No {cfg.label.toLowerCase()} tasks
                    </div>
                  ) : (
                    col.map(task => <TaskCard key={task.id} task={task} />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-lg my-4"
            style={{ background: "var(--bg-elevated)", border: "1px solid rgba(13, 148, 136,0.25)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Add Task</h3>
              <button onClick={() => setShowModal(false)} style={{ color: "rgba(var(--fg-rgb),0.4)" }}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Title */}
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>Title *</label>
                <input
                  type="text"
                  placeholder="Task title…"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className={inputClass()}
                  style={FIELD_STYLE}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Optional details…"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className={`${inputClass()} resize-none`}
                  style={FIELD_STYLE}
                />
              </div>

              {/* Priority + Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    className={inputClass()}
                    style={FIELD_STYLE}
                  >
                    {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_CFG[p].label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className={inputClass()}
                    style={FIELD_STYLE}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
                  </select>
                </div>
              </div>

              {/* Assigned to (text) */}
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>Assigned To</label>
                <input
                  type="text"
                  placeholder="Staff name…"
                  value={form.assigned_to_text}
                  onChange={e => setForm(f => ({ ...f, assigned_to_text: e.target.value }))}
                  className={inputClass()}
                  style={FIELD_STYLE}
                />
              </div>

              {/* Resident (optional) */}
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>Resident (optional)</label>
                <select
                  value={form.resident}
                  onChange={e => setForm(f => ({ ...f, resident: e.target.value }))}
                  className={inputClass()}
                  style={FIELD_STYLE}
                >
                  <option value="">None</option>
                  {residents.map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
                </select>
              </div>

              {/* Due date */}
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>Due Date</label>
                <input
                  type="datetime-local"
                  value={form.due_date}
                  onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                  className={inputClass()}
                  style={FIELD_STYLE}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional notes…"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className={`${inputClass()} resize-none`}
                  style={FIELD_STYLE}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
                style={{ background: "rgba(var(--fg-rgb),0.06)", color: "rgba(var(--fg-rgb),0.7)", border: "1px solid rgba(var(--fg-rgb),0.08)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
                style={{ background: "#0d9488" }}
              >
                {saving ? "Saving…" : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
