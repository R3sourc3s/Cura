"use client";

import { useEffect, useState, useCallback } from "react";
import { Award, Plus, X, Search, Filter, ChevronDown, ShieldCheck, AlertTriangle } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

interface Skill {
  id: number;
  care_home: number;
  name: string;
  category: string;
  description: string;
  is_mandatory: boolean;
  staff_count: number;
}

interface StaffSkill {
  id: number;
  staff_member: number;
  staff_name?: string;
  skill: number;
  skill_name?: string;
  skill_category?: string;
  proficiency: string;
  certified: boolean;
  certification_expiry: string | null;
  notes: string;
  verified_by: number | null;
  verified_by_name?: string;
  acquired_date: string | null;
  is_expiring_soon: boolean;
  created_at: string;
  updated_at: string;
}

interface StaffMember { id: number; full_name: string; role: string; }

const CATEGORY_CFG: Record<string, { label: string; color: string; bg: string }> = {
  clinical:      { label: "Clinical",       color: "#f87171", bg: "rgba(239,68,68,0.12)" },
  care:          { label: "Care",           color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  admin:         { label: "Administrative", color: "#9ca3af", bg: "rgba(156,163,175,0.12)" },
  technical:     { label: "Technical",      color: "#a78bfa", bg: "rgba(124,58,237,0.12)" },
  leadership:    { label: "Leadership",     color: "#fb923c", bg: "rgba(251,146,60,0.12)" },
  communication: { label: "Communication",  color: "#2dd4bf", bg: "rgba(45,212,191,0.12)" },
  other:         { label: "Other",          color: "#9ca3af", bg: "rgba(156,163,175,0.12)" },
};

const PROFICIENCY_CFG: Record<string, { label: string; color: string; bg: string }> = {
  beginner:   { label: "Beginner",   color: "#9ca3af", bg: "rgba(156,163,175,0.12)" },
  competent:  { label: "Competent",  color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  proficient: { label: "Proficient", color: "#a78bfa", bg: "rgba(124,58,237,0.12)" },
  expert:     { label: "Expert",     color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
};

const CATEGORIES = ["clinical", "care", "admin", "technical", "leadership", "communication", "other"];
const PROFICIENCIES = ["beginner", "competent", "proficient", "expert"];

const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "rgba(255,255,255,0.8)",
};

export default function SkillsPage() {
  const [tab, setTab] = useState<"library" | "staff">("library");

  // Skills library state
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [savingSkill, setSavingSkill] = useState(false);
  const [skillForm, setSkillForm] = useState({
    name: "", category: "care", description: "", is_mandatory: false,
  });

  // Staff skills state
  const [staffSkills, setStaffSkills] = useState<StaffSkill[]>([]);
  const [staffSkillsLoading, setStaffSkillsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterProficiency, setFilterProficiency] = useState("");
  const [filterSkillCategory, setFilterSkillCategory] = useState("");
  const [showAddStaffSkill, setShowAddStaffSkill] = useState(false);
  const [savingStaffSkill, setSavingStaffSkill] = useState(false);
  const [staffSkillForm, setStaffSkillForm] = useState({
    staff_member: "", skill: "", proficiency: "competent",
    certified: false, certification_expiry: "", acquired_date: "", notes: "",
  });

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);

  // Load skills library
  const loadSkills = useCallback(() => {
    setSkillsLoading(true);
    const qs = new URLSearchParams({ page_size: "200" });
    if (filterCategory) qs.set("category", filterCategory);
    fetch(`/api/v1/skills/?${qs}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setSkills(d.results ?? d))
      .catch(console.error)
      .finally(() => setSkillsLoading(false));
  }, [filterCategory]);

  // Load staff skills
  const loadStaffSkills = useCallback(() => {
    setStaffSkillsLoading(true);
    const qs = new URLSearchParams({ page_size: "200" });
    if (filterProficiency) qs.set("proficiency", filterProficiency);
    fetch(`/api/v1/skills/staff-skills/?${qs}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setStaffSkills(d.results ?? d))
      .catch(console.error)
      .finally(() => setStaffSkillsLoading(false));
  }, [filterProficiency]);

  useEffect(() => { loadSkills(); }, [loadSkills]);
  useEffect(() => { loadStaffSkills(); }, [loadStaffSkills]);

  useEffect(() => {
    fetch("/api/v1/auth/users/?page_size=200", { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setStaffMembers((d.results ?? d).filter((u: StaffMember) => u.role !== "family")));
  }, []);

  async function handleAddSkill() {
    if (!skillForm.name) return;
    setSavingSkill(true);
    try {
      const res = await fetch("/api/v1/skills/", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skillForm),
      });
      if (res.ok) {
        const created = await res.json();
        setSkills(p => [...p, created]);
        setShowAddSkill(false);
        setSkillForm({ name: "", category: "care", description: "", is_mandatory: false });
      }
    } finally { setSavingSkill(false); }
  }

  async function handleAddStaffSkill() {
    if (!staffSkillForm.staff_member || !staffSkillForm.skill) return;
    setSavingStaffSkill(true);
    try {
      const body = {
        staff_member: Number(staffSkillForm.staff_member),
        skill: Number(staffSkillForm.skill),
        proficiency: staffSkillForm.proficiency,
        certified: staffSkillForm.certified,
        certification_expiry: staffSkillForm.certification_expiry || null,
        acquired_date: staffSkillForm.acquired_date || null,
        notes: staffSkillForm.notes,
      };
      const res = await fetch("/api/v1/skills/staff-skills/", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const created = await res.json();
        setStaffSkills(p => [...p, created]);
        setShowAddStaffSkill(false);
        setStaffSkillForm({ staff_member: "", skill: "", proficiency: "competent", certified: false, certification_expiry: "", acquired_date: "", notes: "" });
      }
    } finally { setSavingStaffSkill(false); }
  }

  // Derived stats
  const totalSkills = skills.length;
  const mandatorySkills = skills.filter(s => s.is_mandatory).length;
  const expiringCerts = staffSkills.filter(ss => ss.is_expiring_soon).length;
  const totalStaffSkills = staffSkills.length;

  // Group skills by category for library view
  const skillsByCategory: Record<string, Skill[]> = {};
  for (const s of skills) {
    if (!skillsByCategory[s.category]) skillsByCategory[s.category] = [];
    skillsByCategory[s.category].push(s);
  }

  // Filtered staff skills
  const filteredStaffSkills = staffSkills.filter(ss => {
    if (filterSkillCategory && ss.skill_category !== filterSkillCategory) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (ss.staff_name ?? "").toLowerCase().includes(q) ||
      (ss.skill_name ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <Award size={16} style={{ color: "#a78bfa" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Skills &amp; Competencies</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Manage staff skills and certifications</p>
          </div>
        </div>
        <button
          onClick={() => tab === "library" ? setShowAddSkill(true) : setShowAddStaffSkill(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
          <Plus size={14} /> {tab === "library" ? "Add Skill" : "Add Staff Skill"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Skills",             value: totalSkills,      color: "#a78bfa" },
          { label: "Mandatory Skills",          value: mandatorySkills,  color: "#f87171" },
          { label: "Expiring Certifications",   value: expiringCerts,    color: "#fbbf24" },
          { label: "Staff-Skill Records",       value: totalStaffSkills, color: "#60a5fa" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4 text-center"
            style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-hover)" }}>
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Expiry alert */}
      {expiringCerts > 0 && (
        <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl w-fit"
          style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24" }}>
          <AlertTriangle size={12} />
          <strong>{expiringCerts}</strong>&nbsp;certification{expiringCerts !== 1 ? "s" : ""} expiring within 30 days
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "var(--bg-card)" }}>
        {(["library", "staff"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 text-sm font-medium rounded-lg transition-all"
            style={{
              background: tab === t ? "rgba(124,58,237,0.2)" : "transparent",
              color: tab === t ? "#a78bfa" : "var(--text-muted)",
              border: tab === t ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
            }}>
            {t === "library" ? "Skills Library" : "Staff Skills"}
          </button>
        ))}
      </div>

      {/* ── SKILLS LIBRARY TAB ── */}
      {tab === "library" && (
        <>
          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(255,255,255,0.25)" }} />
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                className="text-sm pl-8 pr-8 py-2 rounded-xl outline-none appearance-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{CATEGORY_CFG[c]?.label ?? c}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "rgba(255,255,255,0.3)" }} />
            </div>
          </div>

          {skillsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
          ) : skills.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No skills defined yet"
              description="Add skills to start building your competency library."
              action={{ label: "Add Skill", onClick: () => setShowAddSkill(true) }}
            />
          ) : (
            <div className="space-y-6">
              {(filterCategory ? [filterCategory] : CATEGORIES)
                .filter(cat => skillsByCategory[cat]?.length)
                .map(cat => {
                  const cfg = CATEGORY_CFG[cat] ?? CATEGORY_CFG.other;
                  return (
                    <div key={cat}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-lg"
                          style={{ background: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {skillsByCategory[cat].length} skill{skillsByCategory[cat].length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {skillsByCategory[cat].map(skill => (
                          <div key={skill.id} className="rounded-2xl p-4"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="text-sm font-semibold text-white">{skill.name}</span>
                                  {skill.is_mandatory && (
                                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                                      style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}>
                                      <ShieldCheck size={10} /> Mandatory
                                    </span>
                                  )}
                                </div>
                                {skill.description && (
                                  <p className="text-xs leading-relaxed mb-2"
                                    style={{ color: "rgba(255,255,255,0.45)" }}>
                                    {skill.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: cfg.bg, color: cfg.color }}>
                                {cfg.label}
                              </span>
                              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                {skill.staff_count} staff member{skill.staff_count !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </>
      )}

      {/* ── STAFF SKILLS TAB ── */}
      {tab === "staff" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }} />
              <input type="text" placeholder="Search staff or skill…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full text-sm pl-9 pr-4 py-2 rounded-xl outline-none"
                style={{ background: "var(--input-bg)", border: "1px solid var(--bg-card-hover)", color: "var(--text-secondary)" }} />
            </div>
            {[
              {
                value: filterSkillCategory,
                set: setFilterSkillCategory,
                opts: [["", "All Categories"], ...CATEGORIES.map(c => [c, CATEGORY_CFG[c]?.label ?? c])],
              },
              {
                value: filterProficiency,
                set: setFilterProficiency,
                opts: [["", "All Proficiencies"], ...PROFICIENCIES.map(p => [p, PROFICIENCY_CFG[p]?.label ?? p])],
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

          {staffSkillsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
          ) : filteredStaffSkills.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No staff skill records found"
              description="Assign skills to staff members to track competencies."
              action={{ label: "Add Staff Skill", onClick: () => setShowAddStaffSkill(true) }}
            />
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
                    {["Staff Member", "Skill", "Category", "Proficiency", "Certified", "Expiry", "Acquired"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStaffSkills.map(ss => {
                    const profCfg = PROFICIENCY_CFG[ss.proficiency] ?? PROFICIENCY_CFG.competent;
                    const catCfg = CATEGORY_CFG[ss.skill_category ?? "other"] ?? CATEGORY_CFG.other;
                    const expiryDate = ss.certification_expiry ? new Date(ss.certification_expiry) : null;
                    const expiryStr = expiryDate ? expiryDate.toLocaleDateString("en-GB") : "—";
                    const expiryColor = ss.is_expiring_soon
                      ? "#f87171"
                      : "var(--text-secondary)";
                    return (
                      <tr key={ss.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td className="px-4 py-3 text-sm font-medium text-white">
                          {ss.staff_name ?? `Staff #${ss.staff_member}`}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                          {ss.skill_name ?? `Skill #${ss.skill}`}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: catCfg.bg, color: catCfg.color }}>
                            {catCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: profCfg.bg, color: profCfg.color }}>
                            {profCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {ss.certified ? (
                            <span className="flex items-center gap-1 text-xs w-fit px-2 py-0.5 rounded-lg"
                              style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}>
                              <ShieldCheck size={11} /> Yes
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>No</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs font-medium" style={{ color: expiryColor }}>
                          {ss.is_expiring_soon && expiryDate ? (
                            <span className="flex items-center gap-1">
                              <AlertTriangle size={11} /> {expiryStr}
                            </span>
                          ) : expiryStr}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                          {ss.acquired_date ? new Date(ss.acquired_date).toLocaleDateString("en-GB") : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── ADD SKILL MODAL ── */}
      {showAddSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md"
            style={{ background: "#0f1629", border: "1px solid rgba(124,58,237,0.25)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Add Skill</h3>
              <button onClick={() => setShowAddSkill(false)} style={{ color: "rgba(255,255,255,0.4)" }}>
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Skill Name *</label>
                <input value={skillForm.name} onChange={e => setSkillForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Manual Handling, Dementia Care…"
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Category</label>
                <select value={skillForm.category} onChange={e => setSkillForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{CATEGORY_CFG[c]?.label ?? c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Description</label>
                <textarea rows={3} value={skillForm.description}
                  onChange={e => setSkillForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of this skill…"
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={inputStyle} />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={skillForm.is_mandatory}
                    onChange={e => setSkillForm(f => ({ ...f, is_mandatory: e.target.checked }))}
                    className="rounded" />
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Mandatory skill</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddSkill(false)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}>
                Cancel
              </button>
              <button onClick={handleAddSkill} disabled={savingSkill || !skillForm.name}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
                {savingSkill ? "Saving…" : "Add Skill"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD STAFF SKILL MODAL ── */}
      {showAddStaffSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md"
            style={{ background: "#0f1629", border: "1px solid rgba(124,58,237,0.25)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Add Staff Skill</h3>
              <button onClick={() => setShowAddStaffSkill(false)} style={{ color: "rgba(255,255,255,0.4)" }}>
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Staff Member *</label>
                <select value={staffSkillForm.staff_member}
                  onChange={e => setStaffSkillForm(f => ({ ...f, staff_member: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                  <option value="">Select staff member…</option>
                  {staffMembers.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Skill *</label>
                <select value={staffSkillForm.skill}
                  onChange={e => setStaffSkillForm(f => ({ ...f, skill: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                  <option value="">Select skill…</option>
                  {skills.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({CATEGORY_CFG[s.category]?.label ?? s.category})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Proficiency</label>
                <select value={staffSkillForm.proficiency}
                  onChange={e => setStaffSkillForm(f => ({ ...f, proficiency: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                  {PROFICIENCIES.map(p => (
                    <option key={p} value={p}>{PROFICIENCY_CFG[p]?.label ?? p}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Acquired Date</label>
                  <input type="date" value={staffSkillForm.acquired_date}
                    onChange={e => setStaffSkillForm(f => ({ ...f, acquired_date: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Cert. Expiry</label>
                  <input type="date" value={staffSkillForm.certification_expiry}
                    onChange={e => setStaffSkillForm(f => ({ ...f, certification_expiry: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={staffSkillForm.certified}
                    onChange={e => setStaffSkillForm(f => ({ ...f, certified: e.target.checked }))}
                    className="rounded" />
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Certified</span>
                </label>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Notes</label>
                <textarea rows={2} value={staffSkillForm.notes}
                  onChange={e => setStaffSkillForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Optional notes…"
                  className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={inputStyle} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddStaffSkill(false)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}>
                Cancel
              </button>
              <button onClick={handleAddStaffSkill}
                disabled={savingStaffSkill || !staffSkillForm.staff_member || !staffSkillForm.skill}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
                {savingStaffSkill ? "Saving…" : "Add Staff Skill"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
