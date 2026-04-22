"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Bell, ChevronDown, ClipboardList, LogOut, Menu, Pill, Search, UserCircle, X } from "lucide-react";
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
  id: string;
  type: "leave" | "stock" | "review";
  message: string;
  href: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function NotifIcon({ type }: { type: Notif["type"] }) {
  if (type === "leave") return <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />;
  if (type === "stock") return <Pill size={14} className="text-red-400 flex-shrink-0" />;
  return <ClipboardList size={14} className="text-blue-400 flex-shrink-0" />;
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
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.7)",
  };

  return (
    <div ref={wrapRef} className={`relative ${mobile ? "w-full" : "hidden md:block"}`}>
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: "rgba(255,255,255,0.25)" }} />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search residents…"
        className={`text-sm pl-9 pr-4 py-1.5 rounded-lg outline-none transition-all ${mobile ? "w-full py-2 rounded-xl" : "w-56 lg:w-72"}`}
        style={inputStyle}
        onFocus={e => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
        onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      )}
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1.5 left-0 w-72 rounded-xl py-1 z-50 overflow-hidden"
          style={{ background: "#0d1424", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
          {results.map(r => (
            <button key={r.id} onClick={() => pick(r)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.75)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
                {r.full_name[0]}
              </div>
              <div>
                <div className="font-medium leading-none">{r.full_name}</div>
                {r.room_number && <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Room {r.room_number}</div>}
              </div>
            </button>
          ))}
        </div>
      )}
      {open && !loading && query.trim() && results.length === 0 && (
        <div className="absolute top-full mt-1.5 left-0 w-72 rounded-xl px-4 py-3 z-50"
          style={{ background: "#0d1424", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
          No residents found
        </div>
      )}
    </div>
  );
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [notifsLoaded, setNotifsLoaded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifsRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/notifications")
      .then(r => r.ok ? r.json() : { items: [] })
      .then(data => { setNotifs(data.items ?? []); setNotifsLoaded(true); })
      .catch(() => setNotifsLoaded(true));
  }, []);

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

  const initials = user
    ? ((user.first_name?.[0] ?? user.username[0]) + (user.last_name?.[0] ?? "")).toUpperCase()
    : "?";

  const roleLabel: Record<string, string> = {
    admin: "Administrator", manager: "Care Manager",
    nurse: "Nurse", carer: "Carer", hr: "HR",
  };

  const dismissNotif = useCallback((id: string) => {
    setNotifs(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <>
      <header className="h-14 flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-10"
        style={{ background: "rgba(5,9,20,0.9)", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>

        {/* Left */}
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick}
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Menu size={18} style={{ color: "rgba(255,255,255,0.6)" }} />
          </button>
          <SearchInput />
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Mobile search toggle */}
          <button onClick={() => setSearchOpen(v => !v)}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {searchOpen
              ? <X size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
              : <Search size={16} style={{ color: "rgba(255,255,255,0.6)" }} />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifsRef}>
            <button onClick={() => setNotifsOpen(v => !v)}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: notifsOpen ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Bell size={15} style={{ color: "rgba(255,255,255,0.5)" }} />
              {notifsLoaded && notifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#050914]" />
              )}
            </button>

            {notifsOpen && (
              <div className="absolute right-0 mt-1.5 w-80 rounded-xl py-1 z-50"
                style={{ background: "#0d1424", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
                <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>Notifications</span>
                  {notifs.length > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
                      {notifs.length}
                    </span>
                  )}
                </div>
                {notifs.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                    No new notifications
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto">
                    {notifs.map(n => (
                      <div key={n.id} className="flex items-start gap-3 px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                        <div className="mt-0.5"><NotifIcon type={n.type} /></div>
                        <Link href={n.href} onClick={() => { dismissNotif(n.id); setNotifsOpen(false); }}
                          className="flex-1 text-xs leading-relaxed hover:underline"
                          style={{ color: "rgba(255,255,255,0.65)" }}>
                          {n.message}
                        </Link>
                        <button onClick={() => dismissNotif(n.id)} className="flex-shrink-0 mt-0.5 opacity-40 hover:opacity-70 transition-opacity">
                          <X size={12} style={{ color: "rgba(255,255,255,0.6)" }} />
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
              style={{ background: menuOpen ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
                {initials}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-medium leading-none" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {user?.full_name || user?.username || "…"}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {user?.role ? (roleLabel[user.role] ?? user.role) : ""}
                </div>
              </div>
              <ChevronDown size={12} className="hidden sm:block" style={{ color: "rgba(255,255,255,0.3)" }} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1.5 w-52 rounded-xl py-1 z-50"
                style={{ background: "#0d1424", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>{user?.full_name || user?.username}</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{user?.email}</div>
                </div>
                <Link href="/dashboard/profile" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors"
                  style={{ color: "rgba(255,255,255,0.65)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <UserCircle size={14} /> My Profile
                </Link>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "4px 0" }} />
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
        <div className="md:hidden px-4 py-2 border-b" style={{ background: "rgba(5,9,20,0.95)", borderColor: "rgba(255,255,255,0.06)" }}>
          <SearchInput mobile inputRef={mobileSearchRef} />
        </div>
      )}
    </>
  );
}
