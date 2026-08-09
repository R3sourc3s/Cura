"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

// Solid backgrounds: green for success (create/update), red for destructive.
const STYLES: Record<ToastType, { bg: string }> = {
  success: { bg: "#059669" },
  error:   { bg: "#dc2626" },
  warning: { bg: "#d97706" },
  info:    { bg: "#0d9488" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 360 }}
        role="status" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => {
          const s = STYLES[t.type];
          const Icon = ICONS[t.type];
          return (
            <div key={t.id}
              className="flex items-start gap-3 px-4 py-3 rounded-xl pointer-events-auto"
              style={{
                background: s.bg,
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
                animation: "slideInRight 0.2s ease-out",
              }}>
              <Icon size={16} style={{ color: "#fff", flexShrink: 0, marginTop: 1 }} />
              <span className="text-sm flex-1 font-medium" style={{ color: "#fff" }}>{t.message}</span>
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity">
                <X size={14} style={{ color: "#fff" }} />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
