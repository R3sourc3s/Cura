"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import { carePlans } from "@/lib/api";
import type { CarePlan, CarePlanSection, CarePlanNote } from "@/types";
import {
  Bot, Calendar, CheckCircle, ChevronDown, ChevronUp,
  Edit2, MessageSquare, Plus, Save, Trash2, X,
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

const STATUS = {
  active:       { bg: "rgba(52,211,153,0.12)",  text: "var(--c-green)",  label: "Active" },
  draft:        { bg: "var(--bg-card)",            text: "var(--text-secondary)", label: "Draft" },
  under_review: { bg: "rgba(251,146,60,0.12)",   text: "var(--c-orange)",  label: "Under Review" },
  archived:     { bg: "rgba(13, 148, 136,0.12)",   text: "var(--c-teal)",  label: "Archived" },
} as const;

const RISK_STYLE = {
  low:    { bg: "rgba(52,211,153,0.12)",  text: "var(--c-green)" },
  medium: { bg: "rgba(250,204,21,0.12)",  text: "var(--c-amber)" },
  high:   { bg: "rgba(239,68,68,0.12)",   text: "var(--c-red)" },
} as const;

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`}
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-strong)" }}>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 text-sm rounded-xl outline-none";
const inputStyle = { background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" };

function SectionEditor({
  planId,
  section,
  onSaved,
  onDeleted,
  onCancel,
}: {
  planId: number;
  section?: CarePlanSection;
  onSaved: (s: CarePlanSection) => void;
  onDeleted?: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(section?.title ?? "");
  const [content, setContent] = useState(section?.content ?? "");
  const [risk, setRisk] = useState(section?.risk_level ?? "low");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    try {
      const saved = section
        ? await carePlans.updateSection(planId, section.id, { title, content, risk_level: risk as CarePlanSection["risk_level"] })
        : await carePlans.createSection(planId, { title, content, risk_level: risk as CarePlanSection["risk_level"] });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function del() {
    if (!section) return;
    setSaving(true);
    try {
      await carePlans.deleteSection(planId, section.id);
      onDeleted?.();
    } catch { setSaving(false); }
  }

  return (
    <div className="rounded-2xl p-4 space-y-3"
      style={{ background: "var(--bg-card)", border: "1px solid rgba(13, 148, 136,0.25)" }}>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
      <input placeholder="Section title" className={inputCls} style={inputStyle}
        value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea placeholder="Section content…" className={inputCls} style={inputStyle}
        value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>Risk:</span>
        {(["low", "medium", "high"] as const).map((r) => (
          <button key={r} onClick={() => setRisk(r)}
            className="text-xs px-2.5 py-1 rounded-lg font-medium capitalize transition-all"
            style={{
              background: risk === r ? RISK_STYLE[r].bg : "var(--bg-card)",
              color: risk === r ? RISK_STYLE[r].text : "var(--text-muted)",
              border: risk === r ? `1px solid ${RISK_STYLE[r].text}40` : "1px solid transparent",
            }}>
            {r}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2 text-xs font-semibold rounded-xl"
          style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}>
          Cancel
        </button>
        {section && onDeleted && (
          <button onClick={del} disabled={saving} className="py-2 px-3 text-xs rounded-xl"
            style={{ background: "rgba(239,68,68,0.1)", color: "var(--c-red)" }}>
            <Trash2 size={12} />
          </button>
        )}
        <button onClick={save} disabled={saving || !title.trim()}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl text-white disabled:opacity-50"
          style={{ background: "#0d9488" }}>
          <Save size={12} />{saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

export default function CarePlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [plan, setPlan] = useState<CarePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [editSection, setEditSection] = useState<number | "new" | null>(null);
  const [noteBody, setNoteBody] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    carePlans.get(Number(id))
      .then(setPlan)
      .catch(() => router.replace("/dashboard/care-plans"))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function generateSummary() {
    if (!plan) return;
    setSummaryLoading(true);
    try {
      const r = await carePlans.generateSummary(plan.id);
      setPlan((p) => p ? { ...p, ai_summary: r.summary, ai_generated: true } : p);
    } catch (e) { console.error(e); }
    finally { setSummaryLoading(false); }
  }

  async function updateStatus(status: CarePlan["status"]) {
    if (!plan) return;
    setStatusSaving(true);
    try {
      const updated = await carePlans.update(plan.id, { status });
      setPlan(updated);
    } catch (e) { console.error(e); }
    finally { setStatusSaving(false); }
  }

  async function addNote() {
    if (!plan || !noteBody.trim()) return;
    setAddingNote(true);
    try {
      const note = await carePlans.addNote(plan.id, noteBody.trim());
      setPlan((p) => p ? { ...p, notes: [note, ...(p.notes ?? [])] } : p);
      setNoteBody("");
    } catch (e) { console.error(e); }
    finally { setAddingNote(false); }
  }

  function sectionSaved(s: CarePlanSection) {
    setPlan((p) => {
      if (!p) return p;
      const existing = (p.sections ?? []).findIndex((sec) => sec.id === s.id);
      const sections = existing >= 0
        ? (p.sections ?? []).map((sec) => sec.id === s.id ? s : sec)
        : [...(p.sections ?? []), s];
      return { ...p, sections };
    });
    setEditSection(null);
  }

  function sectionDeleted(id: number) {
    setPlan((p) => p ? { ...p, sections: (p.sections ?? []).filter((s) => s.id !== id) } : p);
    setEditSection(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!plan) return null;

  const s = STATUS[plan.status] ?? STATUS.draft;
  const sections = plan.sections ?? [];
  const notes = plan.notes ?? [];
  const overdue = plan.next_review_date && new Date(plan.next_review_date) < new Date();

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <Breadcrumbs crumbs={[
        { label: "Care Plans", href: "/dashboard/care-plans" },
        { label: `Care Plan v${plan.version}` },
      ]} />

      {/* Header */}
      <GlassCard>
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-xl font-bold text-white">Care Plan v{plan.version}</h1>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: s.bg, color: s.text }}>
                {s.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: "var(--text-muted)" }}>
              {plan.created_by_name && <span>Created by {plan.created_by_name}</span>}
              <span>Created {new Date(plan.created_at).toLocaleDateString("en-GB")}</span>
              {plan.next_review_date && (
                <span style={{ color: overdue ? "var(--c-red)" : undefined }}>
                  <Calendar size={10} className="inline mr-1" />
                  Review: {new Date(plan.next_review_date).toLocaleDateString("en-GB")}
                  {overdue ? " (overdue)" : ""}
                </span>
              )}
            </div>
          </div>
          {/* Status changer */}
          <div className="flex flex-wrap gap-2">
            {(["draft", "active", "under_review", "archived"] as const).map((st) => {
              const cfg = STATUS[st];
              return (
                <button key={st} onClick={() => updateStatus(st)} disabled={statusSaving || plan.status === st}
                  className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all disabled:opacity-40"
                  style={{
                    background: plan.status === st ? cfg.bg : "var(--bg-card)",
                    color: plan.status === st ? cfg.text : "var(--text-muted)",
                    border: plan.status === st ? `1px solid ${cfg.text}40` : "1px solid transparent",
                  }}>
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* AI Summary */}
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bot size={16} style={{ color: "var(--c-teal)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>AI Summary</h2>
            {plan.ai_generated && (
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(13, 148, 136,0.15)", color: "var(--c-teal)" }}>
                Generated
              </span>
            )}
          </div>
          <button onClick={generateSummary} disabled={summaryLoading}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50"
            style={{ background: "rgba(13, 148, 136,0.15)", color: "var(--c-teal)", border: "1px solid rgba(13, 148, 136,0.2)" }}>
            <Bot size={11} />
            {summaryLoading ? "Generating…" : plan.ai_summary ? "Regenerate" : "Generate"}
          </button>
        </div>
        {plan.ai_summary ? (
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {plan.ai_summary}
          </p>
        ) : (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No summary yet. Click Generate to create one using AI.
          </p>
        )}
      </GlassCard>

      {/* Sections */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
            Sections ({sections.length})
          </h2>
          <button onClick={() => setEditSection("new")}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
            style={{ background: "#0d9488" }}>
            <Plus size={12} /> Add Section
          </button>
        </div>

        <div className="space-y-3">
          {editSection === "new" && (
            <SectionEditor planId={plan.id} onSaved={sectionSaved} onCancel={() => setEditSection(null)} />
          )}
          {sections.length === 0 && editSection !== "new" && (
            <div className="text-center py-10 rounded-2xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No sections yet.</p>
            </div>
          )}
          {sections.map((sec) => {
            const rs = RISK_STYLE[sec.risk_level] ?? RISK_STYLE.low;
            const isEditing = editSection === sec.id;
            return (
              <div key={sec.id}>
                {isEditing ? (
                  <SectionEditor planId={plan.id} section={sec}
                    onSaved={sectionSaved}
                    onDeleted={() => sectionDeleted(sec.id)}
                    onCancel={() => setEditSection(null)} />
                ) : (
                  <div className="rounded-2xl p-4"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{sec.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                          style={{ background: rs.bg, color: rs.text }}>{sec.risk_level}</span>
                      </div>
                      <button onClick={() => setEditSection(sec.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "var(--bg-card)", color: "var(--text-muted)" }}>
                        <Edit2 size={12} />
                      </button>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {sec.content}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div>
        <button className="flex items-center gap-2 mb-3 w-full text-left"
          onClick={() => setExpandedNotes((v) => !v)}>
          <MessageSquare size={16} style={{ color: "var(--text-secondary)" }} />
          <h2 className="text-sm font-semibold flex-1" style={{ color: "var(--text-secondary)" }}>
            Progress Notes ({notes.length})
          </h2>
          {expandedNotes ? <ChevronUp size={14} style={{ color: "var(--text-muted)" }} /> : <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />}
        </button>

        {expandedNotes && (
          <div className="space-y-3">
            {/* Add note */}
            <div className="rounded-2xl p-4 space-y-3"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <textarea ref={noteRef} placeholder="Add a progress note…"
                className={inputCls} style={inputStyle}
                value={noteBody} onChange={(e) => setNoteBody(e.target.value)} rows={3} />
              <div className="flex justify-end">
                <button onClick={addNote} disabled={addingNote || !noteBody.trim()}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
                  style={{ background: "#0d9488" }}>
                  <CheckCircle size={12} />{addingNote ? "Adding…" : "Add Note"}
                </button>
              </div>
            </div>
            {notes.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>No notes yet.</p>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="rounded-2xl p-4"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                      style={{ background: "rgba(13, 148, 136,0.2)", color: "var(--c-teal)" }}>
                      {note.author_name?.[0] ?? "?"}
                    </div>
                    <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{note.author_name ?? "Unknown"}</span>
                    <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>
                      {new Date(note.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{note.body}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
