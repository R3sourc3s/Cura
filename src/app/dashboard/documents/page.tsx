"use client";

import { useEffect, useState, useCallback } from "react";
import { FolderOpen, Plus, X, Search, Download, FileText, AlertTriangle } from "lucide-react";

interface Doc {
  id: number; resident_name?: string; uploaded_by_name?: string;
  category: string; title: string; file_url: string;
  file_size: number; file_type: string; version: string;
  expiry_date: string|null; is_active: boolean; notes: string;
  created_at: string; is_expired: boolean;
}

const CATEGORIES = ["policy","procedure","certificate","dbs","contract","resident","risk_assessment","other"];
const CAT_LABEL: Record<string, string> = { policy:"Policy", procedure:"Procedure", certificate:"Certificate", dbs:"DBS Check", contract:"Contract", resident:"Resident Doc", risk_assessment:"Risk Assessment", other:"Other" };

function formatBytes(b: number) { if (b < 1024) return `${b} B`; if (b < 1048576) return `${(b/1024).toFixed(1)} KB`; return `${(b/1048576).toFixed(1)} MB`; }

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", category: "policy", version: "", expiry_date: "", notes: "" });
  const [file, setFile] = useState<File | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams({ ordering: "-created_at" });
    if (activeTab) qs.set("category", activeTab);
    fetch(`/api/v1/documents/?${qs}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setDocs(d.results ?? d))
      .catch(console.error).finally(() => setLoading(false));
  }, [activeTab]);

  useEffect(() => { load(); }, [load]);

  async function handleUpload() {
    if (!form.title || !file) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title); fd.append("category", form.category);
      fd.append("file", file);
      if (form.version) fd.append("version", form.version);
      if (form.expiry_date) fd.append("expiry_date", form.expiry_date);
      if (form.notes) fd.append("notes", form.notes);
      const res = await fetch("/api/v1/documents/", { method: "POST", credentials: "include", body: fd });
      if (res.ok) { const n = await res.json(); setDocs(p => [n, ...p]); setShowModal(false); setForm({ title: "", category: "policy", version: "", expiry_date: "", notes: "" }); setFile(null); }
    } finally { setSaving(false); }
  }

  const filtered = docs.filter(d => !search.trim() || d.title.toLowerCase().includes(search.toLowerCase()));
  const expired = docs.filter(d => d.is_expired).length;

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.2)" }}>
            <FolderOpen size={16} style={{ color: "#fbbf24" }} />
          </div>
          <div><h1 className="text-lg font-bold text-white">Document Vault</h1><p className="text-xs" style={{ color: "var(--text-muted)" }}>Policies, certificates & records</p></div>
        </div>
        <div className="flex items-center gap-3">
          {expired > 0 && <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}><AlertTriangle size={12} />{expired} expired</div>}
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white" style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}><Plus size={14} /> Upload</button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 flex-wrap">
        {[["", "All"], ...CATEGORIES.map(c => [c, CAT_LABEL[c]])].map(([v, l]) => (
          <button key={v} onClick={() => setActiveTab(v)}
            className="text-xs px-3 py-1.5 rounded-xl font-medium transition-all"
            style={{ background: activeTab === v ? "rgba(124,58,237,0.2)" : "var(--bg-card)", color: activeTab === v ? "#a78bfa" : "var(--text-secondary)", border: activeTab === v ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent" }}>
            {l}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
        <input type="text" placeholder="Search documents…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full text-sm pl-9 pr-4 py-2 rounded-xl outline-none"
          style={{ background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--text-secondary)" }} />
      </div>

      {loading ? <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.length === 0 ? (
            <div className="col-span-3 text-center py-12 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <FolderOpen size={28} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No documents found.</p>
            </div>
          ) : filtered.map(doc => (
            <div key={doc.id} className="rounded-2xl p-4" style={{ background: "var(--bg-card)", border: `1px solid ${doc.is_expired ? "rgba(239,68,68,0.2)" : "var(--border)"}` }}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: doc.file_type?.includes("pdf") ? "rgba(239,68,68,0.12)" : "rgba(96,165,250,0.12)" }}>
                  <FileText size={18} style={{ color: doc.file_type?.includes("pdf") ? "#f87171" : "#60a5fa" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white leading-snug truncate">{doc.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--border)", color: "var(--text-muted)" }}>{CAT_LABEL[doc.category] ?? doc.category}</span>
                    {doc.version && <span className="text-xs" style={{ color: "var(--text-muted)" }}>v{doc.version}</span>}
                    {doc.is_expired && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}>Expired</span>}
                  </div>
                </div>
              </div>
              <div className="space-y-1 mb-3">
                {doc.expiry_date && <div className="text-xs" style={{ color: doc.is_expired ? "#f87171" : "rgba(255,255,255,0.4)" }}>Expires: {new Date(doc.expiry_date).toLocaleDateString("en-GB")}</div>}
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {doc.uploaded_by_name && <span>{doc.uploaded_by_name} · </span>}
                  {formatBytes(doc.file_size)} · {new Date(doc.created_at).toLocaleDateString("en-GB")}
                </div>
              </div>
              {doc.file_url && (
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs w-full justify-center py-2 rounded-xl transition-all"
                  style={{ background: "rgba(124,58,237,0.1)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}>
                  <Download size={12} /> Download
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "var(--bg-elevated)", border: "1px solid rgba(124,58,237,0.25)" }}>
            <div className="flex items-center justify-between mb-5"><h3 className="text-base font-bold text-white">Upload Document</h3><button onClick={() => setShowModal(false)} style={{ color: "var(--text-muted)" }}><X size={18} /></button></div>
            <div className="space-y-3">
              {[
                { label:"Title *", el:<input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={{background:"var(--input-bg)",border:"1px solid var(--border-strong)",color:"var(--text-primary)"}} placeholder="Document name" /> },
                { label:"Category", el:<select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={{background:"var(--input-bg)",border:"1px solid var(--border-strong)",color:"var(--text-primary)"}}>{CATEGORIES.map(c=><option key={c} value={c}>{CAT_LABEL[c]}</option>)}</select> },
                { label:"File *", el:<input type="file" onChange={e=>setFile(e.target.files?.[0]??null)} className="w-full text-sm px-3 py-2 rounded-xl" style={{background:"var(--input-bg)",border:"1px solid var(--border-strong)",color:"var(--text-secondary)"}} /> },
                { label:"Version", el:<input value={form.version} onChange={e=>setForm(f=>({...f,version:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={{background:"var(--input-bg)",border:"1px solid var(--border-strong)",color:"var(--text-primary)"}} placeholder="e.g. 2.1" /> },
                { label:"Expiry Date", el:<input type="date" value={form.expiry_date} onChange={e=>setForm(f=>({...f,expiry_date:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={{background:"var(--input-bg)",border:"1px solid var(--border-strong)",color:"var(--text-primary)"}} /> },
                { label:"Notes", el:<textarea rows={2} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={{background:"var(--input-bg)",border:"1px solid var(--border-strong)",color:"var(--text-primary)"}} /> },
              ].map(({label,el})=><div key={label}><label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>{label}</label>{el}</div>)}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowModal(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{background:"var(--border)",color:"var(--text-secondary)",border:"1px solid var(--border-strong)"}}>Cancel</button>
              <button onClick={handleUpload} disabled={saving||!form.title||!file} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{background:"linear-gradient(135deg,#7c3aed,#3b82f6)"}}>{saving?"Uploading…":"Upload"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
