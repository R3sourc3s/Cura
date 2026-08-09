"use client";

import { useEffect, useState, useCallback } from "react";
import { Plug, Key, Webhook, Plus, X, Copy, Check, Trash2, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/components/Toast";
import { useUser } from "@/context/UserContext";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface APIKeyItem {
  id: number; name: string; prefix: string; scope: "read_only" | "read_write";
  created_by_name?: string; is_active: boolean; last_used_at: string | null; created_at: string;
}
interface WebhookDelivery { id: number; event_type: string; status_code: number | null; success: boolean; error: string; delivered_at: string; }
interface WebhookItem {
  id: number; name: string; target_url: string; event_types: string[];
  secret: string; is_active: boolean; created_at: string; recent_deliveries: WebhookDelivery[];
}
interface EventTypeOption { value: string; label: string; }

const inputStyle = { background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" };

type Tab = "keys" | "webhooks";

export default function IntegrationsPage() {
  const { can } = useUser();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("keys");

  const [keys, setKeys] = useState<APIKeyItem[]>([]);
  const [keysLoading, setKeysLoading] = useState(true);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [keyForm, setKeyForm] = useState({ name: "", scope: "read_only" as "read_only" | "read_write" });
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revokeId, setRevokeId] = useState<number | null>(null);

  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [webhooksLoading, setWebhooksLoading] = useState(true);
  const [eventOptions, setEventOptions] = useState<EventTypeOption[]>([]);
  const [showHookModal, setShowHookModal] = useState(false);
  const [savingHook, setSavingHook] = useState(false);
  const [hookForm, setHookForm] = useState({ name: "", target_url: "", event_types: [] as string[] });

  const loadKeys = useCallback(() => {
    setKeysLoading(true);
    fetch("/api/v1/integrations/api-keys/", { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setKeys(d.results ?? d))
      .catch(console.error).finally(() => setKeysLoading(false));
  }, []);

  const loadWebhooks = useCallback(() => {
    setWebhooksLoading(true);
    fetch("/api/v1/integrations/webhooks/", { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setWebhooks(d.results ?? d))
      .catch(console.error).finally(() => setWebhooksLoading(false));
  }, []);

  useEffect(() => { loadKeys(); }, [loadKeys]);
  useEffect(() => { loadWebhooks(); }, [loadWebhooks]);
  useEffect(() => {
    fetch("/api/v1/integrations/webhooks/event_types/", { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(setEventOptions).catch(console.error);
  }, []);

  async function handleCreateKey() {
    if (!keyForm.name) return;
    setSavingKey(true);
    try {
      const res = await fetch("/api/v1/integrations/api-keys/", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(keyForm),
      });
      if (res.ok) {
        const n = await res.json();
        setKeys(p => [n, ...p]);
        setNewRawKey(n.raw_key);
        setKeyForm({ name: "", scope: "read_only" });
        toast("API key created.", "success");
      } else { toast("Could not create API key.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
    finally { setSavingKey(false); }
  }

  async function handleRevoke(id: number) {
    try {
      const res = await fetch(`/api/v1/integrations/api-keys/${id}/`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setKeys(p => p.map(k => k.id === id ? { ...k, is_active: false } : k));
        toast("API key revoked.", "success");
      } else { toast("Could not revoke key.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
  }

  async function handleCreateHook() {
    if (!hookForm.target_url || hookForm.event_types.length === 0) return;
    setSavingHook(true);
    try {
      const res = await fetch("/api/v1/integrations/webhooks/", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(hookForm),
      });
      if (res.ok) {
        const n = await res.json();
        setWebhooks(p => [n, ...p]);
        setShowHookModal(false);
        setHookForm({ name: "", target_url: "", event_types: [] });
        toast("Webhook subscription created.", "success");
      } else { toast("Could not create webhook.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
    finally { setSavingHook(false); }
  }

  function toggleEvent(v: string) {
    setHookForm(f => ({ ...f, event_types: f.event_types.includes(v) ? f.event_types.filter(e => e !== v) : [...f.event_types, v] }));
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(13,148,136,0.12)", border: "1px solid rgba(13,148,136,0.2)" }}>
            <Plug size={16} style={{ color: "var(--c-teal)" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Integrations</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>API keys &amp; webhooks for third-party partners</p>
          </div>
        </div>
        <a href="/docs/api" target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl"
          style={{ background: "var(--input-bg)", color: "var(--text-secondary)", border: "1px solid var(--bg-card-hover)" }}>
          API docs <ExternalLink size={12} />
        </a>
      </div>

      <div className="flex gap-1 rounded-xl p-1" style={{ background: "var(--bg-card)" }}>
        {[{ key: "keys" as Tab, label: "API Keys", icon: Key }, { key: "webhooks" as Tab, label: "Webhooks", icon: Webhook }].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex items-center gap-2 flex-1 justify-center py-2 text-sm font-medium rounded-lg transition-colors"
            style={tab === key ? { background: "#0d9488", color: "#fff" } : { color: "var(--text-muted)" }}>
            <Icon size={13} />{label}
          </button>
        ))}
      </div>

      {tab === "keys" && (
        <>
          <div className="flex justify-end">
            {can("integrations.manage") && (
              <button onClick={() => { setNewRawKey(null); setShowKeyModal(true); }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white"
                style={{ background: "#0d9488" }}>
                <Plus size={14} /> New API Key
              </button>
            )}
          </div>

          {keysLoading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" /></div>
          ) : keys.length === 0 ? (
            <EmptyState icon={Key} title="No API keys yet" description="Generate a key so a pharmacy, GP system, or other partner can integrate with Cura."
              action={{ label: "New API Key", onClick: () => setShowKeyModal(true) }} />
          ) : (
            <div className="space-y-2">
              {keys.map(k => (
                <div key={k.id} className="rounded-2xl p-4 flex items-center justify-between gap-3"
                  style={{ background: "rgba(var(--fg-rgb),0.03)", border: "1px solid rgba(var(--fg-rgb),0.07)" }}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{k.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: k.scope === "read_write" ? "rgba(251,191,36,0.12)" : "rgba(45,212,191,0.12)", color: k.scope === "read_write" ? "var(--c-amber)" : "var(--c-teal2)" }}>
                        {k.scope === "read_write" ? "Read & write" : "Read-only"}
                      </span>
                      {!k.is_active && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.12)", color: "var(--c-red)" }}>Revoked</span>
                      )}
                    </div>
                    <div className="text-xs mt-0.5 font-mono" style={{ color: "var(--text-muted)" }}>{k.prefix}…</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(var(--fg-rgb),0.35)" }}>
                      {k.last_used_at ? `Last used ${new Date(k.last_used_at).toLocaleDateString("en-GB")}` : "Never used"}
                    </div>
                  </div>
                  {can("integrations.manage") && k.is_active && (
                    <button onClick={() => setRevokeId(k.id)} className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(239,68,68,0.08)", color: "var(--c-red)" }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "webhooks" && (
        <>
          <div className="flex justify-end">
            {can("integrations.manage") && (
              <button onClick={() => setShowHookModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white"
                style={{ background: "#0d9488" }}>
                <Plus size={14} /> New Webhook
              </button>
            )}
          </div>

          {webhooksLoading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" /></div>
          ) : webhooks.length === 0 ? (
            <EmptyState icon={Webhook} title="No webhook subscriptions" description="Subscribe a URL to receive real-time events like incidents, low stock, and PRN administrations."
              action={{ label: "New Webhook", onClick: () => setShowHookModal(true) }} />
          ) : (
            <div className="space-y-3">
              {webhooks.map(w => (
                <div key={w.id} className="rounded-2xl p-4" style={{ background: "rgba(var(--fg-rgb),0.03)", border: "1px solid rgba(var(--fg-rgb),0.07)" }}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white">{w.name || w.target_url}</div>
                      <div className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{w.target_url}</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: w.is_active ? "rgba(52,211,153,0.12)" : "rgba(107,114,128,0.15)", color: w.is_active ? "var(--c-green)" : "#9ca3af" }}>
                      {w.is_active ? "Active" : "Paused"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {w.event_types.map(e => (
                      <code key={e} className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(var(--fg-rgb),0.05)", color: "var(--text-secondary)" }}>{e}</code>
                    ))}
                  </div>
                  {w.recent_deliveries.length > 0 && (
                    <div className="mt-2 pt-2 space-y-1" style={{ borderTop: "1px solid var(--border)" }}>
                      <div className="text-xs font-semibold" style={{ color: "rgba(var(--fg-rgb),0.4)" }}>Recent deliveries</div>
                      {w.recent_deliveries.slice(0, 3).map(d => (
                        <div key={d.id} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                          {d.success ? <CheckCircle2 size={11} style={{ color: "var(--c-green)" }} /> : <XCircle size={11} style={{ color: "var(--c-red)" }} />}
                          {d.event_type} · {d.status_code ?? "no response"} · {new Date(d.delivered_at).toLocaleString("en-GB")}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* New API key modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "var(--bg-elevated)", border: "1px solid rgba(13,148,136,0.25)" }}>
            {newRawKey ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white">Save your API key</h3>
                  <button onClick={() => { setShowKeyModal(false); setNewRawKey(null); }} style={{ color: "var(--text-muted)" }}><X size={18} /></button>
                </div>
                <p className="text-xs mb-3" style={{ color: "var(--c-amber)" }}>
                  This is shown once. Store it securely — Cura never stores the raw key and cannot show it again.
                </p>
                <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-4" style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)" }}>
                  <code className="text-xs flex-1 break-all" style={{ color: "var(--c-teal2)" }}>{newRawKey}</code>
                  <button onClick={() => { navigator.clipboard.writeText(newRawKey); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                    className="flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                    {copied ? <Check size={14} style={{ color: "var(--c-green)" }} /> : <Copy size={14} />}
                  </button>
                </div>
                <button onClick={() => { setShowKeyModal(false); setNewRawKey(null); }}
                  className="w-full py-2.5 text-sm font-semibold rounded-xl text-white" style={{ background: "#0d9488" }}>
                  Done
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold text-white">New API Key</h3>
                  <button onClick={() => setShowKeyModal(false)} style={{ color: "var(--text-muted)" }}><X size={18} /></button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Name *</label>
                    <input value={keyForm.name} onChange={e => setKeyForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Lloyds Pharmacy integration" className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Scope</label>
                    <select value={keyForm.scope} onChange={e => setKeyForm(f => ({ ...f, scope: e.target.value as "read_only" | "read_write" }))}
                      className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                      <option value="read_only">Read-only</option>
                      <option value="read_write">Read &amp; write</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setShowKeyModal(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{ background: "rgba(var(--fg-rgb),0.06)", color: "rgba(var(--fg-rgb),0.7)", border: "1px solid rgba(var(--fg-rgb),0.08)" }}>Cancel</button>
                  <button onClick={handleCreateKey} disabled={savingKey || !keyForm.name} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{ background: "#0d9488" }}>{savingKey ? "Creating…" : "Create Key"}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* New webhook modal */}
      {showHookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "var(--bg-elevated)", border: "1px solid rgba(13,148,136,0.25)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">New Webhook</h3>
              <button onClick={() => setShowHookModal(false)} style={{ color: "var(--text-muted)" }}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Name</label>
                <input value={hookForm.name} onChange={e => setHookForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Partner ops alerts" className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Target URL *</label>
                <input value={hookForm.target_url} onChange={e => setHookForm(f => ({ ...f, target_url: e.target.value }))} placeholder="https://partner.example.com/webhooks/cura" className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Events *</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {eventOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--text-secondary)" }}>
                      <input type="checkbox" checked={hookForm.event_types.includes(opt.value)} onChange={() => toggleEvent(opt.value)} />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowHookModal(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{ background: "rgba(var(--fg-rgb),0.06)", color: "rgba(var(--fg-rgb),0.7)", border: "1px solid rgba(var(--fg-rgb),0.08)" }}>Cancel</button>
              <button onClick={handleCreateHook} disabled={savingHook || !hookForm.target_url || hookForm.event_types.length === 0} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{ background: "#0d9488" }}>{savingHook ? "Creating…" : "Create Webhook"}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={revokeId !== null}
        title="Revoke API key?"
        message="Any partner using this key will immediately lose access. This cannot be undone."
        confirmLabel="Revoke"
        danger
        onConfirm={() => { if (revokeId !== null) { handleRevoke(revokeId); setRevokeId(null); } }}
        onCancel={() => setRevokeId(null)}
      />
    </div>
  );
}
