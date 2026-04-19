"use client";

import { useState } from "react";
import { auth as authApi } from "@/lib/api";
import type { User } from "@/types";
import { useToast } from "@/components/Toast";
import {
  Users, Plus, X, Save, Search, Shield, Edit2, Trash2,
  CheckCircle, XCircle, Mail, Phone,
} from "lucide-react";

const ROLES: { value: User["role"]; label: string; color: string; bg: string }[] = [
  { value: "admin",   label: "Admin",        color: "#f87171", bg: "rgba(239,68,68,0.12)"   },
  { value: "manager", label: "Care Manager", color: "#fb923c", bg: "rgba(251,146,60,0.12)"  },
  { value: "nurse",   label: "Nurse",        color: "#34d399", bg: "rgba(52,211,153,0.12)"  },
  { value: "carer",   label: "Carer",        color: "#60a5fa", bg: "rgba(96,165,250,0.12)"  },
  { value: "hr",      label: "HR",           color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
];

function roleConfig(role: string) {
  return ROLES.find((r) => r.value === role) ?? { label: role, color: "#9ca3af", bg: "rgba(255,255,255,0.06)" };
}

const inputCls = "w-full px-3 py-2.5 text-sm rounded-xl outline-none";
const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "white",
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function Avatar({ user, size = 36 }: { user: User; size?: number }) {
  const initials = `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase();
  const rc = roleConfig(user.role);
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
      style={{ width: size, height: size, background: rc.bg, color: rc.color, border: `1px solid ${rc.color}30` }}
    >
      {user.avatar
        ? <img src={user.avatar} alt={user.full_name} className="w-full h-full rounded-full object-cover" />
        : initials}
    </div>
  );
}

type FormData = {
  first_name: string; last_name: string; email: string;
  username: string; role: User["role"]; phone: string;
  password: string; confirm_password: string;
};

const EMPTY_FORM: FormData = {
  first_name: "", last_name: "", email: "", username: "",
  role: "carer", phone: "", password: "", confirm_password: "",
};

function UserModal({ user, onClose, onSaved }: {
  user: User | null; onClose: () => void; onSaved: (u: User) => void;
}) {
  const isEdit = !!user;
  const [form, setForm] = useState<FormData>(
    user
      ? { first_name: user.first_name, last_name: user.last_name, email: user.email, username: user.username, role: user.role, phone: user.phone ?? "", password: "", confirm_password: "" }
      : EMPTY_FORM,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(k: keyof FormData, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isEdit && form.password !== form.confirm_password) { setError("Passwords do not match."); return; }
    if (!isEdit && form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (isEdit && form.password && form.password !== form.confirm_password) { setError("Passwords do not match."); return; }
    setSaving(true); setError("");
    try {
      let saved: User;
      if (isEdit) {
        const payload: Partial<User & { password?: string }> = { first_name: form.first_name, last_name: form.last_name, email: form.email, role: form.role, phone: form.phone };
        if (form.password) payload.password = form.password;
        saved = await authApi.updateUser(user.id, payload);
      } else {
        saved = await authApi.createUser({ first_name: form.first_name, last_name: form.last_name, email: form.email, username: form.username, role: form.role, phone: form.phone, password: form.password });
      }
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save user.");
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-lg rounded-2xl flex flex-col max-h-[90vh]"
        style={{ background: "#0d1526", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
              {isEdit ? <Edit2 size={14} className="text-white" /> : <Plus size={14} className="text-white" />}
            </div>
            <h2 className="text-base font-bold text-white">{isEdit ? `Edit ${user.full_name}` : "Add Team Member"}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <X size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm text-red-300"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" required>
              <input className={inputCls} style={inputStyle} value={form.first_name}
                onChange={(e) => set("first_name", e.target.value)} required placeholder="Jane" />
            </Field>
            <Field label="Last Name" required>
              <input className={inputCls} style={inputStyle} value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)} required placeholder="Smith" />
            </Field>
          </div>
          {!isEdit && (
            <Field label="Username" required>
              <input className={inputCls} style={inputStyle} value={form.username}
                onChange={(e) => set("username", e.target.value.toLowerCase().replace(/\s/g, ""))}
                required placeholder="j.smith" autoComplete="off" />
            </Field>
          )}
          <Field label="Email" required>
            <input type="email" className={inputCls} style={inputStyle} value={form.email}
              onChange={(e) => set("email", e.target.value)} required placeholder="jane@sunrise.co.uk" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Role" required>
              <select className={inputCls} style={inputStyle} value={form.role}
                onChange={(e) => set("role", e.target.value as User["role"])}>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </Field>
            <Field label="Phone">
              <input className={inputCls} style={inputStyle} value={form.phone}
                onChange={(e) => set("phone", e.target.value)} placeholder="07700 900000" />
            </Field>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" }}>
            <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
              {isEdit ? "Leave password blank to keep current password." : "Set a secure password (min. 8 characters)."}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label={isEdit ? "New Password" : "Password"} required={!isEdit}>
                <input type="password" className={inputCls} style={inputStyle} value={form.password}
                  onChange={(e) => set("password", e.target.value)} required={!isEdit} autoComplete="new-password" placeholder="••••••••" />
              </Field>
              <Field label="Confirm Password" required={!isEdit}>
                <input type="password" className={inputCls} style={inputStyle} value={form.confirm_password}
                  onChange={(e) => set("confirm_password", e.target.value)} required={!isEdit} placeholder="••••••••" />
              </Field>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 flex gap-3 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
            Cancel
          </button>
          <button onClick={() => (document.querySelector("form") as HTMLFormElement)?.requestSubmit()} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
            <Save size={14} />{saving ? "Saving…" : isEdit ? "Save Changes" : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ user, onClose, onDeleted }: {
  user: User; onClose: () => void; onDeleted: (id: number) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true); setError("");
    try {
      await authApi.deleteUser(user.id);
      onDeleted(user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user.");
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-sm rounded-2xl p-6 space-y-5"
        style={{ background: "#0d1526", border: "1px solid rgba(239,68,68,0.2)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)" }}>
            <Trash2 size={18} style={{ color: "#f87171" }} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Remove Team Member</h3>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
          Are you sure you want to remove <span className="text-white font-semibold">{user.full_name}</span>?
          Their records (shifts, leave, training) will be preserved.
        </p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
            style={{ background: "rgba(239,68,68,0.8)" }}>
            {deleting ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeamClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  async function toggleActive(user: User) {
    setTogglingId(user.id);
    try {
      const updated = await authApi.updateUser(user.id, { is_active: !user.is_active });
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, ...updated } : u));
      toast(`${user.full_name} ${!user.is_active ? "activated" : "deactivated"}.`);
    } catch { toast("Failed to update status.", "error"); }
    finally { setTogglingId(null); }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const activeCount = users.filter((u) => u.is_active).length;
  const roleGroups = ROLES.map((r) => ({ ...r, count: users.filter((u) => u.role === r.value).length })).filter((r) => r.count > 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Users size={22} style={{ color: "#a78bfa" }} /> Team
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            {activeCount} active · {users.length} total
          </p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold rounded-xl text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
          <Plus size={14} /> <span className="hidden sm:inline">Add Member</span><span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {roleGroups.map((r) => (
          <button key={r.value} onClick={() => setRoleFilter(roleFilter === r.value ? "" : r.value)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{ background: roleFilter === r.value ? r.bg : "rgba(255,255,255,0.03)", color: roleFilter === r.value ? r.color : "rgba(255,255,255,0.4)", border: roleFilter === r.value ? `1px solid ${r.color}40` : "1px solid rgba(255,255,255,0.07)" }}>
            <Shield size={11} style={{ color: r.color }} />
            {r.label} <span style={{ opacity: 0.6 }}>{r.count}</span>
          </button>
        ))}
        {roleFilter && (
          <button onClick={() => setRoleFilter("")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium"
            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <X size={10} /> Clear
          </button>
        )}
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
        <input
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }}
          placeholder="Search by name, email or username…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table — desktop */}
      <div className="hidden md:block rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {["Member", "Role", "Contact", "Status", ""].map((h) => (
                <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3.5"
                  style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No team members found.</td></tr>
            ) : filtered.map((u) => {
              const rc = roleConfig(u.role);
              return (
                <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar user={u} size={36} />
                      <div>
                        <div className="text-sm font-semibold text-white">{u.full_name}</div>
                        <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: rc.bg, color: rc.color }}>{rc.label}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.5)" }}><Mail size={11} />{u.email}</div>
                    {u.phone && <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}><Phone size={11} />{u.phone}</div>}
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => toggleActive(u)} disabled={togglingId === u.id}
                      className="flex items-center gap-1.5 text-xs font-medium disabled:opacity-50">
                      {u.is_active
                        ? <><CheckCircle size={13} style={{ color: "#34d399" }} /><span style={{ color: "#34d399" }}>Active</span></>
                        : <><XCircle size={13} style={{ color: "#f87171" }} /><span style={{ color: "#f87171" }}>Inactive</span></>}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => setEditUser(u)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <Edit2 size={12} style={{ color: "rgba(255,255,255,0.5)" }} />
                      </button>
                      <button onClick={() => setDeleteUser(u)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
                        <Trash2 size={12} style={{ color: "#f87171" }} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No team members found.</p>
          </div>
        ) : filtered.map((u) => {
          const rc = roleConfig(u.role);
          return (
            <div key={u.id} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-start gap-3 mb-3">
                <Avatar user={u} size={42} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-white">{u.full_name}</div>
                      <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>@{u.username}</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: rc.bg, color: rc.color }}>{rc.label}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1 mb-3">
                <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}><Mail size={11} />{u.email}</div>
                {u.phone && <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}><Phone size={11} />{u.phone}</div>}
              </div>
              <div className="flex gap-2 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <button onClick={() => toggleActive(u)} disabled={togglingId === u.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-xl disabled:opacity-50"
                  style={{ background: u.is_active ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)", color: u.is_active ? "#34d399" : "#f87171" }}>
                  {u.is_active ? <><CheckCircle size={12} />Active</> : <><XCircle size={12} />Inactive</>}
                </button>
                <button onClick={() => setEditUser(u)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-xl"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)" }}>
                  <Edit2 size={12} />Edit
                </button>
                <button onClick={() => setDeleteUser(u)}
                  className="w-9 flex items-center justify-center py-2 rounded-xl" style={{ background: "rgba(239,68,68,0.08)" }}>
                  <Trash2 size={13} style={{ color: "#f87171" }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <UserModal user={null} onClose={() => setShowAdd(false)}
          onSaved={(u) => { setUsers((prev) => [u, ...prev]); setShowAdd(false); toast(`${u.full_name} added to the team.`); }} />
      )}
      {editUser && (
        <UserModal user={editUser} onClose={() => setEditUser(null)}
          onSaved={(u) => { setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, ...u } : x)); setEditUser(null); toast(`${u.full_name} updated.`); }} />
      )}
      {deleteUser && (
        <DeleteConfirmModal user={deleteUser} onClose={() => setDeleteUser(null)}
          onDeleted={(id) => { setUsers((prev) => prev.filter((u) => u.id !== id)); setDeleteUser(null); toast("Team member removed.", "warning"); }} />
      )}
    </div>
  );
}
