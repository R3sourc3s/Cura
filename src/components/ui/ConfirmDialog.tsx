"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open, title, message, confirmLabel = "Confirm", danger = false, onConfirm, onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = "confirm-dialog-title";

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}>
      <div className="w-full max-w-sm rounded-2xl p-6"
        role="alertdialog" aria-modal="true" aria-labelledby={titleId}
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}
        onClick={e => e.stopPropagation()}>
        <h3 id={titleId} className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{title}</h3>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>{message}</p>
        <div className="flex gap-3 justify-end">
          <button ref={cancelRef} onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-card-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--bg-card)")}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: danger ? "#dc2626" : "#0d9488" }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
