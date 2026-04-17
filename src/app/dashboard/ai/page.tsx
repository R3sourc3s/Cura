"use client";

import { useEffect, useRef, useState } from "react";
import { ai } from "@/lib/api";
import { Send, Bot, User, Sparkles, Zap } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  ts: Date;
}

const SUGGESTED = [
  "What residents have critical fall risk?",
  "Summarise today's medication administration",
  "Which care plans are due for review?",
  "Draft a handover note for the night shift",
];

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your Empathika AI assistant, powered by Claude. I can help you with resident care, medication management, compliance queries, and more. What would you like to know?",
      ts: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content, ts: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await ai.chat(content);
      setMessages((prev) => [...prev, { role: "assistant", content: res.response, ts: new Date() }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please check that the AI assistant backend is configured correctly.",
        ts: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
          <Bot size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            AI Assistant
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}>
              Claude
            </span>
          </h1>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            Powered by Anthropic Claude · Care-aware AI
          </p>
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto rounded-2xl p-4 space-y-4 mb-4"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${msg.role === "assistant" ? "mt-0.5" : ""}`}
              style={{
                background: msg.role === "assistant"
                  ? "linear-gradient(135deg, #7c3aed, #3b82f6)"
                  : "rgba(255,255,255,0.1)",
              }}>
              {msg.role === "assistant"
                ? <Sparkles size={12} className="text-white" />
                : <User size={12} style={{ color: "rgba(255,255,255,0.7)" }} />}
            </div>
            {/* Bubble */}
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"
            }`}
              style={{
                background: msg.role === "user"
                  ? "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(59,130,246,0.3))"
                  : "rgba(255,255,255,0.05)",
                border: msg.role === "user"
                  ? "1px solid rgba(124,58,237,0.3)"
                  : "1px solid rgba(255,255,255,0.08)",
                color: msg.role === "user" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.75)",
                whiteSpace: "pre-wrap",
              }}>
              {msg.content}
              <div className="text-xs mt-1.5 opacity-40">
                {msg.ts.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
              <Sparkles size={12} className="text-white" />
            </div>
            <div className="rounded-2xl rounded-tl-sm px-4 py-3"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: "#a78bfa", animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs px-3 py-1.5 rounded-xl transition-all"
              style={{ background: "rgba(124,58,237,0.1)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.1)")}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3 items-end rounded-2xl px-4 py-3"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-1.5 mb-1">
          <Zap size={12} style={{ color: "#7c3aed" }} />
        </div>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about residents, medications, compliance…"
          disabled={loading}
          rows={1}
          className="flex-1 bg-transparent outline-none text-sm resize-none"
          style={{ color: "rgba(255,255,255,0.8)", maxHeight: "120px" }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
        >
          <Send size={14} className="text-white" />
        </button>
      </div>
      <p className="text-center text-xs mt-2" style={{ color: "rgba(255,255,255,0.2)" }}>
        AI may make mistakes. Always verify clinical decisions with qualified staff.
      </p>
    </div>
  );
}
