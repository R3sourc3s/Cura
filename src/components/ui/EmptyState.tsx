"use client";

import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <Icon size={24} style={{ color: "var(--text-muted)" }} />
      </div>
      <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{title}</h3>
      {description && (
        <p className="text-sm mb-5 max-w-xs" style={{ color: "var(--text-muted)" }}>{description}</p>
      )}
      {action && (
        <button onClick={action.onClick}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
          {action.label}
        </button>
      )}
    </div>
  );
}
