"use client";

import { useEffect, useState } from "react";

const MAX_ROWS = 500;
const MAX_COLS = 60;

// Minimal RFC-4180-ish CSV parser (handles quoted fields, escaped quotes, newlines-in-quotes).
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(cur); cur = "";
    } else if (c === "\r") {
      // ignore — handled by \n
    } else if (c === "\n") {
      row.push(cur); rows.push(row); row = []; cur = "";
    } else cur += c;
  }
  if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

export default function SpreadsheetPreview({ fileId, kind }: { fileId: number; kind: "csv" | "excel" }) {
  const [rows, setRows] = useState<string[][] | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRows(null); setError(null); setTruncated(false);
    (async () => {
      try {
        const res = await fetch(`/api/v1/documents/files/${fileId}/preview/`, { credentials: "include" });
        if (!res.ok) throw new Error(String(res.status));
        let data: string[][];
        if (kind === "csv") {
          data = parseCsv(await res.text());
        } else {
          const buf = await res.arrayBuffer();
          const XLSX = await import("xlsx");
          const wb = XLSX.read(buf, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          data = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, blankrows: false, defval: "" });
        }
        if (cancelled) return;
        const isTrunc = data.length > MAX_ROWS || data.some(r => r.length > MAX_COLS);
        const clipped = data.slice(0, MAX_ROWS).map(r => r.slice(0, MAX_COLS));
        setTruncated(isTrunc);
        setRows(clipped);
      } catch {
        if (!cancelled) setError("Could not load this spreadsheet.");
      }
    })();
    return () => { cancelled = true; };
  }, [fileId, kind]);

  if (error) return <p className="text-sm py-12 text-center" style={{ color: "var(--text-muted)" }}>{error}</p>;
  if (!rows) return <div className="w-6 h-6 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />;
  if (rows.length === 0) return <p className="text-sm py-12 text-center" style={{ color: "var(--text-muted)" }}>This file is empty.</p>;

  const [header, ...body] = rows;
  return (
    <div className="w-full overflow-auto" style={{ maxHeight: "78vh" }}>
      <table className="text-xs border-collapse w-full" style={{ background: "var(--bg-card)" }}>
        <thead>
          <tr>
            {header.map((cell, i) => (
              <th key={i} className="px-3 py-2 text-left font-semibold sticky top-0 whitespace-nowrap"
                style={{ background: "var(--bg-elevated)", color: "var(--text-primary)", borderBottom: "1px solid var(--border-strong)", borderRight: "1px solid var(--border)" }}>
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((r, ri) => (
            <tr key={ri}>
              {header.map((_, ci) => (
                <td key={ci} className="px-3 py-1.5 whitespace-nowrap"
                  style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
                  {r[ci] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {truncated && (
        <p className="text-xs px-3 py-2" style={{ color: "var(--text-muted)" }}>
          Preview limited to the first {MAX_ROWS} rows / {MAX_COLS} columns — download the file to see everything.
        </p>
      )}
    </div>
  );
}
