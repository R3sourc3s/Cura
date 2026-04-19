"use client";

import { useState } from "react";
import { auth as authApi } from "@/lib/api";
import type { User } from "@/types";
import { useToast } from "@/components/Toast";
import { UserCircle, Save, Lock, Phone, Mail, BadgeCheck } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin", manager: "Care Manager", nurse: "Nurse", carer: "Carer", hr: "HR",
};

const inputCls = "w-full px-3 py-2.5 text-sm rounded-xl outline-none";
const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" };

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center gap-2.5 px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <Icon size={15} style={{ color: "#a78bfa" }} />
        <h2 className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>{title}</h2>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</label>
      {children}
    </div>
  );
}

export default function ProfileClient({ initialUser }: { initialUser: User }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User>(initialUser);
  const [profile, setProfile] = useState({
    first_name: initialUser.first_name,
    last_name: initialUser.last_name,
    email: initialUser.email,
    phone: initialUser.phone ?? "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwords, setPasswords] = useState({ next: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await authApi.updateUser(user.id, profile);
      setUser((u) => ({ ...u, ...updated }));
      window.dispatchEvent(new CustomEvent("profile-updated"));
      toast("Profile updated successfully.");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update profile.", "error");
    } finally { setSavingProfile(false); }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) { toast("New passwords do not match.", "error"); return; }
    if (passwords.next.length < 8) { toast("Password must be at least 8 characters.", "error"); return; }
    setSavingPw(true);
    try {
      await authApi.updateUser(user.id, { password: passwords.next });
      setPasswords({ next: "", confirm: "" });
      toast("Password changed successfully.");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to change password.", "error");
    } finally { setSavingPw(false); }
  }

  const initials = `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase();

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <UserCircle size={22} style={{ color: "#a78bfa" }} /> My Profile
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
          Manage your account details and password
        </p>
      </div>

      <div className="rounded-2xl p-5 flex items-center gap-5"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0 text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
          {user.avatar
            ? <img src={user.avatar} alt={user.full_name} className="w-full h-full rounded-2xl object-cover" />
            : initials}
        </div>
        <div className="min-w-0">
          <div className="text-lg font-bold text-white">{user.full_name}</div>
          <div className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>@{user.username}</div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <BadgeCheck size={12} style={{ color: "#a78bfa" }} />
            <span className="text-xs font-medium" style={{ color: "#a78bfa" }}>
              {ROLE_LABELS[user.role] ?? user.role}
            </span>
          </div>
        </div>
      </div>

      <Section title="Personal Details" icon={Mail}>
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name">
              <input className={inputCls} style={inputStyle} value={profile.first_name}
                onChange={(e) => setProfile((p) => ({ ...p, first_name: e.target.value }))} required placeholder="Jane" />
            </Field>
            <Field label="Last Name">
              <input className={inputCls} style={inputStyle} value={profile.last_name}
                onChange={(e) => setProfile((p) => ({ ...p, last_name: e.target.value }))} required placeholder="Smith" />
            </Field>
          </div>
          <Field label="Email">
            <input type="email" className={inputCls} style={inputStyle} value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} required placeholder="jane@sunrise.co.uk" />
          </Field>
          <Field label="Phone">
            <div className="relative">
              <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
              <input className={`${inputCls} pl-9`} style={inputStyle} value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} placeholder="07700 900000" />
            </div>
          </Field>
          <button type="submit" disabled={savingProfile}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
            <Save size={14} />{savingProfile ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </Section>

      <Section title="Change Password" icon={Lock}>
        <form onSubmit={savePassword} className="space-y-4">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            Choose a strong password of at least 8 characters.
          </p>
          <Field label="New Password">
            <input type="password" className={inputCls} style={inputStyle} value={passwords.next}
              onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
              required minLength={8} autoComplete="new-password" placeholder="••••••••" />
          </Field>
          <Field label="Confirm New Password">
            <input type="password" className={inputCls} style={inputStyle} value={passwords.confirm}
              onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
              required autoComplete="new-password" placeholder="••••••••" />
          </Field>
          <button type="submit" disabled={savingPw}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
            <Lock size={14} />{savingPw ? "Updating…" : "Change Password"}
          </button>
        </form>
      </Section>
    </div>
  );
}
