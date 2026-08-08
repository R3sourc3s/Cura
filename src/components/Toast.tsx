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

const STYLES: Record<ToastType, { color: string; bg: string; border: string }> = {
  success: { color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)"  },
  error:   { color: "#f87171", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)"   },
  warning: { color: "#fbbf24", bg: "rgba(250,204,21,0.1)",  border: "rgba(250,204,21,0.25)"  },
  info:    { color: "#2dd4bf", bg: "rgba(45, 212, 191,0.1)",  border: "rgba(45, 212, 191,0.25)"  },
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
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 360 }}>
        {toasts.map((t) => {
          const s = STYLES[t.type];
          const Icon = ICONS[t.type];
          return (
            <div key={t.id}
              className="flex items-start gap-3 px-4 py-3 rounded-xl pointer-events-auto"
              style={{
                background: "rgba(10,16,32,0.96)",
                border: `1px solid ${s.border}`,
                backdropFilter: "blur(12px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                animation: "slideInRight 0.2s ease-out",
              }}>
              <Icon size={16} style={{ color: s.color, flexShrink: 0, marginTop: 1 }} />
              <span className="text-sm flex-1" style={{ color: "var(--text-primary)" }}>{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="flex-shrink-0 opacity-40 hover:opacity-70 transition-opacity">
                <X size={14} style={{ color: "white" }} />
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
