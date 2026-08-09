"use client";

import { useEffect, useState } from "react";
import { FolderOpen, FileText, Download, Eye } from "lucide-react";
import FilePreviewModal, { canPreviewFile, type PreviewFile } from "./FilePreviewModal";

interface LinkedFile { id: number; name: string; file_size: number; file_type: string; }
interface LinkedDoc {
  id: number; title: string; category: string; version: string;
  expiry_date: string | null; is_expired: boolean;
  files: LinkedFile[]; file_count: number; total_size: number;
  uploaded_by_name?: string; created_at: string;
}

const CAT_LABEL: Record<string, string> = { policy:"Policy", procedure:"Procedure", certificate:"Certificate", dbs:"DBS Check", contract:"Contract", resident:"Resident Doc", risk_assessment:"Risk Assessment", other:"Other" };
function fmtBytes(b: number) { if (!b) return "0 B"; if (b < 1024) return `${b} B`; if (b < 1048576) return `${(b/1024).toFixed(1)} KB`; return `${(b/1048576).toFixed(1)} MB`; }
function isPdfType(ft: string) { return ft?.includes("pdf"); }

export default function LinkedDocuments({ residentId, staffId, emptyHint }: { residentId?: number; staffId?: number; emptyHint?: string }) {
  const [docs, setDocs] = useState<LinkedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);

  const filterParam = residentId ? `resident=${residentId}` : staffId ? `staff_member=${staffId}` : "";

  useEffect(() => {
    if (!filterParam) { setDocs([]); setLoading(false); return; }
    setLoading(true);
    fetch(`/api/v1/documents/?${filterParam}&ordering=-created_at&page_size=100`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setDocs(d.results ?? d))
      .catch(console.error).finally(() => setLoading(false));
  }, [filterParam]);

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" /></div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{docs.length} document record{docs.length === 1 ? "" : "s"} linked</p>
        <a href="/dashboard/documents" className="text-xs" style={{ color: "var(--c-teal)" }}>Open Document Vault →</a>
      </div>

      {docs.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <FolderOpen size={28} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No documents linked yet.</p>
          {emptyHint && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{emptyHint}</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {docs.map(doc => (
            <div key={doc.id} className="rounded-2xl p-4 flex flex-col" style={{ background: "var(--bg-card)", border: `1px solid ${doc.is_expired ? "rgba(239,68,68,0.2)" : "var(--border)"}` }}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(251,191,36,0.12)" }}>
                  <FolderOpen size={16} style={{ color: "var(--c-amber)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white leading-snug truncate">{doc.title}</div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--border)", color: "var(--text-muted)" }}>{CAT_LABEL[doc.category] ?? doc.category}</span>
                    {doc.version && <span className="text-xs" style={{ color: "var(--text-muted)" }}>v{doc.version}</span>}
                    {doc.is_expired && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.12)", color: "var(--c-red)" }}>Expired</span>}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 mb-3 flex-1 max-h-52 overflow-auto">
                {doc.files.map(f => (
                  <div key={f.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: "var(--input-bg)" }}>
                    <FileText size={14} className="flex-shrink-0" style={{ color: isPdfType(f.file_type) ? "var(--c-red)" : "var(--c-teal2)" }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate" style={{ color: "var(--text-primary)" }}>{f.name}</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{fmtBytes(f.file_size)}</div>
                    </div>
                    {canPreviewFile(f) && (
                      <button onClick={() => setPreviewFile(f)} aria-label={`Preview ${f.name}`} title="Preview" className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ color: "var(--c-teal2)" }}><Eye size={13} /></button>
                    )}
                    <a href={`/api/v1/documents/files/${f.id}/download/`} download aria-label={`Download ${f.name}`} title="Download" className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ color: "var(--c-teal)" }}><Download size={13} /></a>
                  </div>
                ))}
              </div>

              <div className="text-xs pt-1" style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border)" }}>
                {doc.expiry_date && <span style={{ color: doc.is_expired ? "var(--c-red)" : "var(--text-muted)" }}>Expires {new Date(doc.expiry_date).toLocaleDateString("en-GB")} · </span>}
                {doc.file_count} file{doc.file_count === 1 ? "" : "s"} · {fmtBytes(doc.total_size)}
                {doc.uploaded_by_name && <><br/>Uploaded by {doc.uploaded_by_name}</>}
              </div>
            </div>
          ))}
        </div>
      )}

      {previewFile && <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
    </div>
  );
}
