"use client";

import { X, Download, FileText } from "lucide-react";
import SpreadsheetPreview from "./SpreadsheetPreview";

export interface PreviewFile {
  id: number;
  name: string;
  file_type: string;
  file_size: number;
}

function ext(name: string) { const m = /\.([a-z0-9]+)$/i.exec(name || ""); return m ? m[1].toLowerCase() : ""; }
function isImage(f: PreviewFile) { return f.file_type?.startsWith("image/"); }
function isPdf(f: PreviewFile) { return f.file_type?.includes("pdf"); }
function isCsv(f: PreviewFile) { return ext(f.name) === "csv" || f.file_type?.includes("csv"); }
function isExcel(f: PreviewFile) { const e = ext(f.name); return e === "xlsx" || e === "xls" || e === "xlsm" || f.file_type?.includes("spreadsheetml") || f.file_type?.includes("ms-excel"); }

export function canPreviewFile(f: PreviewFile) { return isImage(f) || isPdf(f) || isCsv(f) || isExcel(f); }

function fmtBytes(b: number) { if (!b) return "0 B"; if (b < 1024) return `${b} B`; if (b < 1048576) return `${(b/1024).toFixed(1)} KB`; return `${(b/1048576).toFixed(1)} MB`; }

export default function FilePreviewModal({ file, onClose }: { file: PreviewFile; onClose: () => void }) {
  const previewUrl = `/api/v1/documents/files/${file.id}/preview/`;
  const downloadUrl = `/api/v1/documents/files/${file.id}/download/`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div className="rounded-2xl w-full max-w-4xl flex flex-col" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">{file.name}</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>{fmtBytes(file.file_size)}</div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a href={downloadUrl} download className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background: "rgba(13, 148, 136,0.1)", color: "var(--c-teal)", border: "1px solid rgba(13, 148, 136,0.2)" }}><Download size={12} /> Download</a>
            <button onClick={onClose} style={{ color: "var(--text-muted)" }}><X size={18} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center" style={{ background: "var(--bg-secondary)", minHeight: "300px" }}>
          {isImage(file) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt={file.name} style={{ maxWidth: "100%", maxHeight: "78vh", objectFit: "contain" }} />
          ) : isPdf(file) ? (
            <iframe src={previewUrl} title={file.name} style={{ width: "100%", height: "78vh", border: "none", borderRadius: 8, background: "#fff" }} />
          ) : isCsv(file) ? (
            <SpreadsheetPreview fileId={file.id} kind="csv" />
          ) : isExcel(file) ? (
            <SpreadsheetPreview fileId={file.id} kind="excel" />
          ) : (
            <div className="text-center py-12">
              <FileText size={32} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Preview isn&apos;t available for this file type.</p>
              <a href={downloadUrl} download className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl text-white" style={{ background: "#0d9488" }}><Download size={14} /> Download instead</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
