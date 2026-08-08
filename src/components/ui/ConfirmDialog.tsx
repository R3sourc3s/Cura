"use client";

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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
        <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{title}</h3>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-card-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--bg-card)")}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: danger ? "#ef4444" : "linear-gradient(135deg,#7c3aed,#14b8a6)" }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
