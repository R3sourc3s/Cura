"use client";

import { useEffect, useState, useCallback } from "react";
import { FolderOpen, Plus, X, Search, Download, FileText, AlertTriangle, Eye, Pencil, Trash2, User, UserRound } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import FilePreviewModal from "@/components/documents/FilePreviewModal";

interface DocFile {
  id: number; name: string; file_url: string;
  file_size: number; file_type: string; created_at: string;
}
interface Doc {
  id: number;
  resident: number|null; resident_name?: string|null;
  staff_member: number|null; staff_member_name?: string|null;
  uploaded_by_name?: string;
  category: string; title: string;
  files: DocFile[]; file_count: number; total_size: number;
  version: string; expiry_date: string|null; is_active: boolean; notes: string;
  created_at: string; is_expired: boolean;
}
interface Person { id: number; full_name: string; role?: string; }

const CATEGORIES = ["policy","procedure","certificate","dbs","contract","resident","risk_assessment","other"];
const CAT_LABEL: Record<string, string> = { policy:"Policy", procedure:"Procedure", certificate:"Certificate", dbs:"DBS Check", contract:"Contract", resident:"Resident Doc", risk_assessment:"Risk Assessment", other:"Other" };

const emptyForm = { title: "", category: "policy", version: "", expiry_date: "", notes: "", resident: "", staff_member: "" };

function formatBytes(b: number) { if (!b) return "0 B"; if (b < 1024) return `${b} B`; if (b < 1048576) return `${(b/1024).toFixed(1)} KB`; return `${(b/1048576).toFixed(1)} MB`; }
function fileExt(name: string) { const m = /\.([a-z0-9]+)$/i.exec(name || ""); return m ? m[1].toLowerCase() : ""; }
function isImageType(ft: string) { return ft?.startsWith("image/"); }
function isPdfType(ft: string) { return ft?.includes("pdf"); }
function isCsv(f: DocFile) { return fileExt(f.name) === "csv" || f.file_type?.includes("csv"); }
function isExcel(f: DocFile) { const e = fileExt(f.name); return e === "xlsx" || e === "xls" || e === "xlsm" || f.file_type?.includes("spreadsheetml") || f.file_type?.includes("ms-excel"); }
function canPreview(f: DocFile) { return isImageType(f.file_type) || isPdfType(f.file_type) || isCsv(f) || isExcel(f); }

export default function DocumentsPage() {
  const { can } = useUser();
  const { toast } = useToast();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Doc | null>(null);
  const [confirmUpdate, setConfirmUpdate] = useState(false);
  const [fileToRemove, setFileToRemove] = useState<DocFile | null>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [filterResident, setFilterResident] = useState("");
  const [filterStaff, setFilterStaff] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editDoc, setEditDoc] = useState<Doc | null>(null);
  const [previewFile, setPreviewFile] = useState<DocFile | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<File[]>([]);
  const [linkType, setLinkType] = useState<"none" | "resident" | "staff">("none");
  const [residents, setResidents] = useState<Person[]>([]);
  const [staff, setStaff] = useState<Person[]>([]);

  useEffect(() => {
    fetch("/api/v1/residents/?is_active=true&page_size=200&ordering=full_name", { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] }).then(d => setResidents(d.results ?? d)).catch(() => {});
    fetch("/api/v1/auth/users/?page_size=200", { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] }).then(d => setStaff((d.results ?? d).filter((u: Person) => u.role !== "family"))).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams({ ordering: "-created_at" });
    if (activeTab) qs.set("category", activeTab);
    if (filterResident) qs.set("resident", filterResident);
    if (filterStaff) qs.set("staff_member", filterStaff);
    fetch(`/api/v1/documents/?${qs}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setDocs(d.results ?? d))
      .catch(console.error).finally(() => setLoading(false));
  }, [activeTab, filterResident, filterStaff]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditDoc(null); setForm(emptyForm); setFiles([]); setLinkType("none"); setError(null); setShowModal(true);
  }
  function openEdit(doc: Doc) {
    setEditDoc(doc);
    setForm({ title: doc.title, category: doc.category, version: doc.version ?? "", expiry_date: doc.expiry_date ?? "", notes: doc.notes ?? "", resident: doc.resident ? String(doc.resident) : "", staff_member: doc.staff_member ? String(doc.staff_member) : "" });
    setLinkType(doc.resident ? "resident" : doc.staff_member ? "staff" : "none");
    setFiles([]); setError(null); setShowModal(true);
  }

  function parseErr(err: unknown, status: number) {
    return err ? Object.entries(err as Record<string, unknown>).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" · ") : `Failed (error ${status}).`;
  }

  // Create saves immediately; updates go through a confirmation modal first.
  function handleSaveClick() {
    setError(null);
    if (!form.title.trim()) { setError("Please give the record a title."); return; }
    if (!editDoc && files.length === 0) { setError("Please add at least one file."); return; }
    if (editDoc) { setConfirmUpdate(true); return; }
    doSave();
  }

  async function doSave() {
    const isEdit = !!editDoc;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("category", form.category);
      fd.append("version", form.version);
      fd.append("notes", form.notes);
      fd.append("resident", linkType === "resident" ? form.resident : "");
      fd.append("staff_member", linkType === "staff" ? form.staff_member : "");
      if (form.expiry_date) fd.append("expiry_date", form.expiry_date);
      files.forEach(f => fd.append("files", f));

      const url = editDoc ? `/api/v1/documents/${editDoc.id}/` : "/api/v1/documents/";
      const method = editDoc ? "PATCH" : "POST";
      const res = await fetch(url, { method, credentials: "include", body: fd });
      if (res.ok) {
        const n: Doc = await res.json();
        setDocs(p => editDoc ? p.map(d => d.id === n.id ? n : d) : [n, ...p]);
        setShowModal(false); setForm(emptyForm); setFiles([]); setEditDoc(null); setConfirmUpdate(false);
        toast(isEdit ? "Document updated." : "Document uploaded.", "success");
      } else {
        const msg = parseErr(await res.json().catch(() => null), res.status);
        setError(msg); setConfirmUpdate(false);
        toast(msg, "error");
      }
    } catch {
      setError("Network error — please try again."); setConfirmUpdate(false);
      toast("Network error — please try again.", "error");
    } finally { setSaving(false); }
  }

  async function doDeleteDoc() {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/v1/documents/${deleteTarget.id}/`, { method: "DELETE", credentials: "include" });
      if (res.ok || res.status === 204) {
        setDocs(p => p.filter(d => d.id !== deleteTarget.id));
        toast("Document deleted.", "error");
        setDeleteTarget(null);
      } else {
        toast("Could not delete the document.", "error");
      }
    } catch {
      toast("Network error — please try again.", "error");
    } finally { setBusy(false); }
  }

  async function doRemoveFile() {
    if (!editDoc || !fileToRemove) return;
    const fileId = fileToRemove.id;
    setBusy(true);
    try {
      const res = await fetch(`/api/v1/documents/files/${fileId}/`, { method: "DELETE", credentials: "include" });
      if (res.ok || res.status === 204) {
        const upd = (d: Doc): Doc => ({ ...d, files: d.files.filter(f => f.id !== fileId), file_count: Math.max(0, d.file_count - 1) });
        setEditDoc(d => d ? upd(d) : d);
        setDocs(p => p.map(d => d.id === editDoc.id ? upd(d) : d));
        toast("File removed.", "error");
        setFileToRemove(null);
      } else {
        toast("Could not remove that file.", "error");
      }
    } catch {
      toast("Network error — please try again.", "error");
    } finally { setBusy(false); }
  }

  const filtered = docs.filter(d => !search.trim() || d.title.toLowerCase().includes(search.toLowerCase()));
  const expired = docs.filter(d => d.is_expired).length;

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.2)" }}>
            <FolderOpen size={16} style={{ color: "var(--c-amber)" }} />
          </div>
          <div><h1 className="text-lg font-bold text-white">Document Vault</h1><p className="text-xs" style={{ color: "var(--text-muted)" }}>Policies, certificates & records</p></div>
        </div>
        <div className="flex items-center gap-3">
          {expired > 0 && <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl" style={{ background: "rgba(239,68,68,0.12)", color: "var(--c-red)" }}><AlertTriangle size={12} />{expired} expired</div>}
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white" style={{ background: "#0d9488" }}><Plus size={14} /> Upload</button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 flex-wrap">
        {[["", "All"], ...CATEGORIES.map(c => [c, CAT_LABEL[c]])].map(([v, l]) => (
          <button key={v} onClick={() => setActiveTab(v)}
            className="text-xs px-3 py-1.5 rounded-xl font-medium transition-all"
            style={{ background: activeTab === v ? "rgba(13, 148, 136,0.2)" : "var(--bg-card)", color: activeTab === v ? "var(--c-teal)" : "var(--text-secondary)", border: activeTab === v ? "1px solid rgba(13, 148, 136,0.3)" : "1px solid transparent" }}>
            {l}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input type="text" placeholder="Search documents…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full text-sm pl-9 pr-4 py-2 rounded-xl outline-none"
            style={{ background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--text-secondary)" }} />
        </div>
        <select value={filterResident} onChange={e => { setFilterResident(e.target.value); if (e.target.value) setFilterStaff(""); }}
          className="text-sm px-3 py-2 rounded-xl outline-none sm:w-48"
          style={{ background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: filterResident ? "var(--text-primary)" : "var(--text-muted)" }}>
          <option value="">All residents</option>
          {residents.map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
        </select>
        <select value={filterStaff} onChange={e => { setFilterStaff(e.target.value); if (e.target.value) setFilterResident(""); }}
          className="text-sm px-3 py-2 rounded-xl outline-none sm:w-48"
          style={{ background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: filterStaff ? "var(--text-primary)" : "var(--text-muted)" }}>
          <option value="">All staff</option>
          {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
        </select>
      </div>

      {loading ? <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.length === 0 ? (
            <div className="col-span-3 text-center py-12 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <FolderOpen size={28} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No documents found.</p>
            </div>
          ) : filtered.map(doc => (
            <div key={doc.id} className="rounded-2xl p-4 flex flex-col" style={{ background: "var(--bg-card)", border: `1px solid ${doc.is_expired ? "rgba(239,68,68,0.2)" : "var(--border)"}` }}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(251,191,36,0.12)" }}>
                  <FolderOpen size={18} style={{ color: "var(--c-amber)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white leading-snug truncate">{doc.title}</div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--border)", color: "var(--text-muted)" }}>{CAT_LABEL[doc.category] ?? doc.category}</span>
                    {doc.version && <span className="text-xs" style={{ color: "var(--text-muted)" }}>v{doc.version}</span>}
                    {doc.is_expired && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.12)", color: "var(--c-red)" }}>Expired</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => openEdit(doc)} title="Edit" className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ background: "var(--bg-card-hover)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                    <Pencil size={12} />
                  </button>
                  {can("staff.manage") && (
                    <button onClick={() => setDeleteTarget(doc)} title="Delete record" className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ background: "rgba(239,68,68,0.1)", color: "var(--c-red)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* File list */}
              <div className="space-y-1.5 mb-3 flex-1 max-h-52 overflow-auto">
                {doc.files.length === 0 ? (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>No files.</p>
                ) : doc.files.map(f => (
                  <div key={f.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: "var(--input-bg)" }}>
                    <FileText size={14} className="flex-shrink-0" style={{ color: isPdfType(f.file_type) ? "var(--c-red)" : "var(--c-teal2)" }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate" style={{ color: "var(--text-primary)" }}>{f.name}</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{formatBytes(f.file_size)}</div>
                    </div>
                    {canPreview(f) && (
                      <button onClick={() => setPreviewFile(f)} title="Preview" className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ color: "var(--c-teal2)" }}>
                        <Eye size={13} />
                      </button>
                    )}
                    <a href={`/api/v1/documents/files/${f.id}/download/`} download title="Download" className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ color: "var(--c-teal)" }}>
                      <Download size={13} />
                    </a>
                  </div>
                ))}
              </div>

              {(doc.resident_name || doc.staff_member_name) && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {doc.resident_name && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(13, 148, 136,0.1)", color: "var(--c-teal)" }}>
                      <UserRound size={11} /> {doc.resident_name}
                    </span>
                  )}
                  {doc.staff_member_name && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(45, 212, 191,0.1)", color: "var(--c-teal2)" }}>
                      <User size={11} /> {doc.staff_member_name}
                    </span>
                  )}
                </div>
              )}
              <div className="text-xs pt-1" style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border)" }}>
                {doc.expiry_date && <span style={{ color: doc.is_expired ? "var(--c-red)" : "var(--text-muted)" }}>Expires {new Date(doc.expiry_date).toLocaleDateString("en-GB")} · </span>}
                {doc.file_count} file{doc.file_count === 1 ? "" : "s"} · {formatBytes(doc.total_size)}
                {doc.uploaded_by_name && <><br/>Uploaded by {doc.uploaded_by_name}</>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-auto" style={{ background: "var(--bg-elevated)", border: "1px solid rgba(13, 148, 136,0.25)" }}>
            <div className="flex items-center justify-between mb-5"><h3 className="text-base font-bold text-white">{editDoc ? "Edit Document" : "Upload Document"}</h3><button onClick={() => setShowModal(false)} style={{ color: "var(--text-muted)" }}><X size={18} /></button></div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Title *</label>
                <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={{background:"var(--input-bg)",border:"1px solid var(--border-strong)",color:"var(--text-primary)"}} placeholder="Record name (e.g. Fire Safety Policy)" />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Category</label>
                <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={{background:"var(--input-bg)",border:"1px solid var(--border-strong)",color:"var(--text-primary)"}}>{CATEGORIES.map(c=><option key={c} value={c}>{CAT_LABEL[c]}</option>)}</select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Link to (optional)</label>
                <div className="flex gap-1 p-1 rounded-xl mb-2" style={{ background: "var(--input-bg)", border: "1px solid var(--border-strong)" }}>
                  {([["none","None"],["resident","Resident"],["staff","Staff member"]] as const).map(([v,l]) => (
                    <button key={v} type="button" onClick={()=>setLinkType(v)}
                      className="flex-1 text-xs font-medium py-1.5 rounded-lg transition-all"
                      style={ linkType===v ? { background:"#0d9488", color:"#fff" } : { background:"transparent", color:"var(--text-secondary)" }}>
                      {l}
                    </button>
                  ))}
                </div>
                {linkType === "resident" && (
                  <select value={form.resident} onChange={e=>setForm(f=>({...f,resident:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={{background:"var(--input-bg)",border:"1px solid var(--border-strong)",color:"var(--text-primary)"}}>
                    <option value="">Select resident…</option>
                    {residents.map(r=><option key={r.id} value={r.id}>{r.full_name}</option>)}
                  </select>
                )}
                {linkType === "staff" && (
                  <select value={form.staff_member} onChange={e=>setForm(f=>({...f,staff_member:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={{background:"var(--input-bg)",border:"1px solid var(--border-strong)",color:"var(--text-primary)"}}>
                    <option value="">Select staff member…</option>
                    {staff.map(s=><option key={s.id} value={s.id}>{s.full_name}{s.role?` (${s.role})`:""}</option>)}
                  </select>
                )}
              </div>

              {/* Existing files (edit mode) */}
              {editDoc && editDoc.files.length > 0 && (
                <div>
                  <label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Files in this record</label>
                  <div className="space-y-1">
                    {editDoc.files.map(f => (
                      <div key={f.id} className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg" style={{ background:"var(--input-bg)", color:"var(--text-secondary)" }}>
                        <FileText size={13} className="flex-shrink-0" style={{ color: isPdfType(f.file_type) ? "var(--c-red)" : "var(--c-teal2)" }} />
                        <span className="flex-1 truncate">{f.name} · {formatBytes(f.file_size)}</span>
                        <button onClick={()=>setFileToRemove(f)} className="flex-shrink-0" style={{ color:"var(--c-red)" }} title="Remove file"><Trash2 size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>{editDoc ? "Add more files" : "Files *"}</label>
                <input type="file" multiple onChange={e=>setFiles(Array.from(e.target.files ?? []))} className="w-full text-sm px-3 py-2 rounded-xl" style={{background:"var(--input-bg)",border:"1px solid var(--border-strong)",color:"var(--text-secondary)"}} />
                {files.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-40 overflow-auto">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 text-xs px-2.5 py-1.5 rounded-lg" style={{ background:"var(--input-bg)", color:"var(--text-secondary)" }}>
                        <span className="truncate">{f.name} · {formatBytes(f.size)}</span>
                        <button onClick={()=>setFiles(prev=>prev.filter((_,j)=>j!==i))} className="flex-shrink-0" style={{ color:"var(--text-muted)" }} title="Remove"><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
                {files.length > 1 && <p className="text-xs mt-1.5" style={{ color:"var(--text-muted)" }}>{files.length} files will be added to this one record.</p>}
              </div>

              <div>
                <label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Version</label>
                <input value={form.version} onChange={e=>setForm(f=>({...f,version:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={{background:"var(--input-bg)",border:"1px solid var(--border-strong)",color:"var(--text-primary)"}} placeholder="e.g. 2.1" />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Expiry Date</label>
                <input type="date" value={form.expiry_date} onChange={e=>setForm(f=>({...f,expiry_date:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={{background:"var(--input-bg)",border:"1px solid var(--border-strong)",color:"var(--text-primary)"}} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{color:"var(--text-secondary)"}}>Notes</label>
                <textarea rows={2} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={{background:"var(--input-bg)",border:"1px solid var(--border-strong)",color:"var(--text-primary)"}} />
              </div>
            </div>
            {error && <p className="mt-3 text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(225,29,72,0.1)", color: "var(--c-red)" }}>{error}</p>}
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowModal(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl" style={{background:"var(--border)",color:"var(--text-secondary)",border:"1px solid var(--border-strong)"}}>Cancel</button>
              <button onClick={handleSaveClick} disabled={saving||!form.title.trim()||(!editDoc&&files.length===0)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50" style={{background:"linear-gradient(135deg,#0d9488,#10b981)"}}>{saving?(editDoc?"Saving…":`Uploading…`):(editDoc?"Save Changes":(files.length>1?`Upload ${files.length} files`:"Upload"))}</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewFile && <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}

      {/* Confirmations */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete document record?"
        message={deleteTarget ? `This will permanently delete “${deleteTarget.title}” and its ${deleteTarget.file_count} file${deleteTarget.file_count === 1 ? "" : "s"}. This cannot be undone.` : ""}
        confirmLabel={busy ? "Deleting…" : "Delete"}
        danger
        onConfirm={doDeleteDoc}
        onCancel={() => setDeleteTarget(null)}
      />
      <ConfirmDialog
        open={confirmUpdate}
        title="Save changes?"
        message="Update this document record with your changes?"
        confirmLabel={saving ? "Saving…" : "Save changes"}
        onConfirm={doSave}
        onCancel={() => setConfirmUpdate(false)}
      />
      <ConfirmDialog
        open={!!fileToRemove}
        title="Remove file?"
        message={fileToRemove ? `Remove “${fileToRemove.name}” from this record? This cannot be undone.` : ""}
        confirmLabel={busy ? "Removing…" : "Remove file"}
        danger
        onConfirm={doRemoveFile}
        onCancel={() => setFileToRemove(null)}
      />
    </div>
  );
}
