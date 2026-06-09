"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Bell, ChevronDown, ClipboardList, LogOut, Menu, Moon, Pill, Search, Shield, Sun, UserCircle, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout as doLogout } from "@/lib/auth";
import { useUser } from "@/context/UserContext";

interface HeaderProps {
  onMenuClick: () => void;
}

interface Resident {
  id: number;
  full_name: string;
  room_number?: string;
}

interface Notif {
  id: number;
  notif_type: "incident" | "leave" | "stock" | "handover" | "general";
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function NotifIcon({ type }: { type: Notif["notif_type"] }) {
  if (type === "leave") return <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />;
  if (type === "stock") return <Pill size={14} className="text-red-400 flex-shrink-0" />;
  if (type === "incident") return <Shield size={14} className="text-orange-400 flex-shrink-0" />;
  if (type === "handover") return <ClipboardList size={14} className="text-purple-400 flex-shrink-0" />;
  return <Bell size={14} className="text-blue-400 flex-shrink-0" />;
}

function SearchInput({ mobile = false, inputRef }: { mobile?: boolean; inputRef?: React.RefObject<HTMLInputElement | null> }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Resident[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const debouncedQ = useDebounce(query, 280);

  useEffect(() => {
    if (!debouncedQ.trim()) { setResults([]); setOpen(false); return; }
    setLoading(true);
    fetch(`/api/v1/residents/?search=${encodeURIComponent(debouncedQ)}&is_active=true&page_size=6`)
      .then(r => r.ok ? r.json() : { results: [] })
      .then(data => { setResults(data.results ?? []); setOpen(true); })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQ]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pick = (r: Resident) => {
    setQuery(""); setOpen(false);
    router.push(`/dashboard/residents/${r.id}`);
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--input-bg)",
    border: "1px solid var(--border-strong)",
    color: "var(--text-secondary)",
  };

  return (
    <div ref={wrapRef} className={`relative ${mobile ? "w-full" : "hidden md:block"}`}>
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: "var(--text-muted)" }} />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search residents…"
        className={`text-sm pl-9 pr-4 py-1.5 rounded-lg outline-none transition-all ${mobile ? "w-full py-2 rounded-xl" : "w-56 lg:w-72"}`}
        style={inputStyle}
        onFocus={e => (e.target.style.borderColor = "rgba(45,90,61,0.5)")}
        onBlur={e => (e.target.style.borderColor = "var(--border-strong)")}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#2d5a3d", borderTopColor: "transparent" }} />
      )}
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1.5 left-0 w-72 rounded-xl py-1 z-50 overflow-hidden"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-strong)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
          {results.map(r => (
            <button key={r.id} onClick={() => pick(r)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--input-bg)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: "#2d5a3d" }}>
                {r.full_name[0]}
              </div>
              <div>
                <div className="font-medium leading-none">{r.full_name}</div>
                {r.room_number && <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Room {r.room_number}</div>}
              </div>
            </button>
          ))}
        </div>
      )}
      {open && !loading && query.trim() && results.length === 0 && (
        <div className="absolute top-full mt-1.5 left-0 w-72 rounded-xl px-4 py-3 z-50"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-strong)", color: "var(--text-muted)", fontSize: 13 }}>
          No residents found
        </div>
      )}
    </div>
  );
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useUser();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [notifsLoaded, setNotifsLoaded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifsRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const fetchNotifs = useCallback(() => {
    fetch("/api/v1/notifications/")
      .then(r => r.ok ? r.json() : [])
      .then((data: Notif[]) => { setNotifs(Array.isArray(data) ? data : []); setNotifsLoaded(true); })
      .catch(() => setNotifsLoaded(true));
  }, []);

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) setNotifsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (searchOpen) mobileSearchRef.current?.focus();
  }, [searchOpen]);

  const openNotifs = () => {
    setNotifsOpen(v => !v);
    if (!notifsOpen) {
      const unread = notifs.filter(n => !n.is_read);
      if (unread.length > 0) {
        fetch("/api/v1/notifications/mark-all-read/", { method: "POST" })
          .then(() => setNotifs(prev => prev.map(n => ({ ...n, is_read: true }))))
          .catch(() => {});
      }
    }
  };

  const dismissNotif = useCallback((id: number) => {
    fetch(`/api/v1/notifications/${id}/read/`, { method: "PATCH" }).catch(() => {});
    setNotifs(prev => prev.filter(n => n.id !== id));
  }, []);

  const unreadCount = notifs.filter(n => !n.is_read).length;

  const initials = user
    ? ((user.first_name?.[0] ?? user.username[0]) + (user.last_name?.[0] ?? "")).toUpperCase()
    : "?";

  const roleLabel: Record<string, string> = {
    admin: "Administrator", manager: "Care Manager",
    nurse: "Nurse", carer: "Carer", hr: "HR",
  };

  return (
    <>
      <header className="h-14 flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-10"
        style={{ background: "var(--header-bg)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(20px)" }}>

        {/* Left */}
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick}
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--input-bg)", border: "1px solid var(--border-strong)" }}>
            <Menu size={18} style={{ color: "var(--text-secondary)" }} />
          </button>
          <SearchInput />
          <button
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
            onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }))}>
            <Search size={11} />
            <span>Quick find</span>
            <kbd style={{ background: "var(--border)", borderRadius: 4, padding: "1px 5px", fontFamily: "monospace", fontSize: 10 }}>⌘K</kbd>
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Mobile search toggle */}
          <button onClick={() => setSearchOpen(v => !v)}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "var(--input-bg)", border: "1px solid var(--border-strong)" }}>
            {searchOpen
              ? <X size={16} style={{ color: "var(--text-secondary)" }} />
              : <Search size={16} style={{ color: "var(--text-secondary)" }} />}
          </button>

          {/* Theme toggle */}
          <button onClick={toggle}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            {theme === "dark"
              ? <Sun size={15} style={{ color: "var(--text-secondary)" }} />
              : <Moon size={15} style={{ color: "var(--text-secondary)" }} />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifsRef}>
            <button onClick={openNotifs}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: notifsOpen ? "rgba(45,90,61,0.08)" : "var(--input-bg)", border: "1px solid var(--border-strong)" }}>
              <Bell size={15} style={{ color: "var(--text-secondary)" }} />
              {notifsLoaded && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full border-2 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notifsOpen && (
              <div className="absolute right-0 mt-1.5 w-80 rounded-xl py-1 z-50"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-strong)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
                <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Notifications</span>
                  {notifs.length > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
                      {notifs.length}
                    </span>
                  )}
                </div>
                {notifs.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    No new notifications
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto">
                    {notifs.map(n => (
                      <div key={n.id}
                        className="flex items-start gap-3 px-4 py-3 border-b"
                        style={{ borderColor: "var(--bg-card)", background: n.is_read ? "transparent" : "rgba(45,90,61,0.04)" }}>
                        <div className="mt-0.5"><NotifIcon type={n.notif_type} /></div>
                        <Link href={n.link || "#"} onClick={() => { dismissNotif(n.id); setNotifsOpen(false); }}
                          className="flex-1 text-xs leading-relaxed hover:underline"
                          style={{ color: "var(--text-secondary)" }}>
                          {n.message}
                        </Link>
                        <button onClick={() => dismissNotif(n.id)} className="flex-shrink-0 mt-0.5 opacity-40 hover:opacity-70 transition-opacity">
                          <X size={12} style={{ color: "var(--text-secondary)" }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-xl transition-all"
              style={{ background: menuOpen ? "rgba(45,90,61,0.08)" : "var(--input-bg)", border: "1px solid var(--border-strong)" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: "#2d5a3d" }}>
                {initials}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-medium leading-none" style={{ color: "var(--text-primary)" }}>
                  {user?.full_name || user?.username || "…"}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {user?.role ? (roleLabel[user.role] ?? user.role) : ""}
                </div>
              </div>
              <ChevronDown size={12} className="hidden sm:block" style={{ color: "var(--text-muted)" }} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1.5 w-52 rounded-xl py-1 z-50"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-strong)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                  <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{user?.full_name || user?.username}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{user?.email}</div>
                </div>
                <Link href="/dashboard/profile" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--input-bg)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <UserCircle size={14} /> My Profile
                </Link>
                <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />
                <button onClick={() => doLogout()}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors"
                  style={{ color: "#f87171" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="md:hidden px-4 py-2 border-b" style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}>
          <SearchInput mobile inputRef={mobileSearchRef} />
        </div>
      )}
    </>
  );
}
