"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MessageSquare, Send, Plus, X, Pin } from "lucide-react";

interface Message {
  id: number; channel: string; author_name?: string; author_role?: string;
  content: string; is_pinned: boolean; created_at: string;
  author?: number;
}

const CHANNELS = [
  { id:"general",    label:"General",      color:"#60a5fa" },
  { id:"handover",   label:"Handover",     color:"#a78bfa" },
  { id:"clinical",   label:"Clinical",     color:"#34d399" },
  { id:"management", label:"Management",   color:"#fbbf24" },
  { id:"urgent",     label:"🚨 Urgent",    color:"#f87171" },
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff/60000), h = Math.floor(m/60), d = Math.floor(h/24);
  if (m<2) return "just now";
  if (m<60) return `${m}m ago`;
  if (h<24) return `${h}h ago`;
  return `${d}d ago`;
}

const ROLE_COLOR: Record<string,string> = { admin:"#f87171", manager:"#fbbf24", nurse:"#34d399", carer:"#60a5fa", hr:"#a78bfa" };

export default function MessagesPage() {
  const [channel, setChannel] = useState("general");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    fetch(`/api/v1/messages/?channel=${channel}&ordering=created_at&page_size=100`, { credentials:"include" })
      .then(r => r.ok ? r.json() : { results:[] })
      .then(d => { setMessages(d.results ?? d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [channel]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  useEffect(() => {
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages]);

  async function handleSend() {
    if (!content.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/v1/messages/", { method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ channel, content: content.trim() }) });
      if (res.ok) { const n = await res.json(); setMessages(p => [...p, n]); setContent(""); }
    } finally { setSending(false); }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  async function togglePin(id: number, pinned: boolean) {
    const res = await fetch(`/api/v1/messages/${id}/`, { method:"PATCH", credentials:"include", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ is_pinned: !pinned }) });
    if (res.ok) { const u = await res.json(); setMessages(p => p.map(m => m.id===id ? u : m)); }
  }

  const pinned = messages.filter(m => m.is_pinned);
  const channelCfg = CHANNELS.find(c => c.id === channel) ?? CHANNELS[0];

  return (
    <div className="flex h-[calc(100vh-120px)] max-w-5xl mx-auto gap-4">
      {/* Channel sidebar */}
      <div className="w-48 flex-shrink-0 rounded-2xl p-3 space-y-1" style={{ background:"var(--bg-card)", border:"1px solid var(--border)" }}>
        <div className="flex items-center gap-2 px-2 py-2 mb-2">
          <MessageSquare size={14} style={{ color:"var(--text-muted)" }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color:"var(--text-muted)" }}>Channels</span>
        </div>
        {CHANNELS.map(ch => (
          <button key={ch.id} onClick={() => setChannel(ch.id)}
            className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
            style={{ background: channel===ch.id ? `${ch.color}18` : "transparent", color: channel===ch.id ? ch.color : "rgba(255,255,255,0.5)", border: channel===ch.id ? `1px solid ${ch.color}30` : "1px solid transparent" }}>
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ch.color }} />
            {ch.label}
          </button>
        ))}
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col rounded-2xl overflow-hidden" style={{ background:"var(--bg-card)", border:"1px solid var(--border)" }}>
        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom:"1px solid var(--border)", background:"var(--bg-card)" }}>
          <div className="w-2 h-2 rounded-full" style={{ background: channelCfg.color }} />
          <span className="text-sm font-semibold text-white">{channelCfg.label}</span>
          {pinned.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded ml-auto" style={{ background:"rgba(251,191,36,0.1)", color:"#fbbf24" }}>
              <Pin size={10} className="inline mr-1" />{pinned.length} pinned
            </span>
          )}
        </div>

        {/* Pinned messages */}
        {pinned.length > 0 && (
          <div className="px-4 py-2 space-y-1" style={{ background:"rgba(251,191,36,0.04)", borderBottom:"1px solid rgba(251,191,36,0.1)" }}>
            {pinned.map(m => (
              <div key={m.id} className="flex items-center gap-2 text-xs" style={{ color:"var(--text-secondary)" }}>
                <Pin size={9} style={{ color:"#fbbf24" }} />
                <span style={{ color:"#fbbf24" }}>{m.author_name}:</span>
                <span className="truncate">{m.content}</span>
              </div>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare size={28} className="mx-auto mb-2" style={{ color:"var(--text-muted)" }} />
              <p className="text-sm" style={{ color:"var(--text-muted)" }}>No messages yet. Start the conversation!</p>
            </div>
          ) : messages.map(m => {
            const roleColor = ROLE_COLOR[m.author_role ?? ""] ?? "#a78bfa";
            return (
              <div key={m.id} className="group flex gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style={{ background:`${roleColor}20`, color:roleColor }}>
                  {(m.author_name??"?").slice(0,1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-xs font-semibold" style={{ color:roleColor }}>{m.author_name ?? "Unknown"}</span>
                    <span className="text-xs capitalize" style={{ color:"var(--text-muted)" }}>{m.author_role}</span>
                    <span className="text-xs" style={{ color:"var(--text-muted)" }}>{timeAgo(m.created_at)}</span>
                    <button onClick={() => togglePin(m.id, m.is_pinned)}
                      className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity ml-auto"
                      title={m.is_pinned ? "Unpin" : "Pin"}>
                      <Pin size={11} style={{ color: m.is_pinned ? "#fbbf24" : "var(--text-muted)" }} />
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color:"var(--text-secondary)" }}>{m.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3" style={{ borderTop:"1px solid var(--border)" }}>
          <div className="flex gap-2 items-end">
            <textarea value={content} onChange={e=>setContent(e.target.value)} onKeyDown={handleKey}
              placeholder={`Message #${channelCfg.label.toLowerCase().replace("🚨 ","")}…`}
              rows={2}
              className="flex-1 text-sm px-3 py-2 rounded-xl outline-none resize-none"
              style={{ background:"var(--input-bg)", border:"1px solid var(--border-strong)", color:"var(--text-primary)" }} />
            <button onClick={handleSend} disabled={sending||!content.trim()} className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
              style={{ background:"linear-gradient(135deg,#7c3aed,#3b82f6)" }}>
              <Send size={14} className="text-white" />
            </button>
          </div>
          <p className="text-xs mt-1" style={{ color:"var(--text-muted)" }}>Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
