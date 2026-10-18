"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ShieldAlert, ShieldX } from "lucide-react";
import { ApiError } from "@/lib/api";
import type { SafetyIssue } from "@/types";

interface SafetyPayload { safety_issues: SafetyIssue[]; overridable: boolean }

function safetyPayload(err: unknown): SafetyPayload | null {
  if (err instanceof ApiError && err.status === 409 && Array.isArray(err.data.safety_issues)) {
    return err.data as unknown as SafetyPayload;
  }
  return null;
}

/** Turn a raw fetch() 409 response into an ApiError so PRN-style callers can share the dialog. */
export async function throwIfNotOk(res: Response): Promise<Response> {
  if (res.ok) return res;
  const data = await res.json().catch(() => ({ detail: "Request failed" }));
  throw new ApiError(data.detail ?? "Request failed", res.status, data);
}

const ISSUE_LABEL: Record<SafetyIssue["code"], string> = {
  allergy: "Allergy",
  duplicate_dose: "Possible double dose",
  prn_interval: "PRN interval",
  prn_max_daily: "PRN 24-hour maximum",
};

/**
 * Wraps a medication write so a 409 safety response opens a review dialog.
 *
 *   const { guard, dialog } = useSafetyCheck();
 *   const saved = await guard(reason => medications.updateMAR(id, { status: "given", safety_override_reason: reason }));
 *   ...
 *   return <>{...}{dialog}</>;
 *
 * `guard` resolves with the result, or `null` if the user cancelled / the issue can't be overridden.
 * Any other error is re-thrown for the caller's usual handling.
 */
export function useSafetyCheck() {
  const [pending, setPending] = useState<{
    payload: SafetyPayload;
    retry: (reason: string) => Promise<void>;
    cancel: () => void;
  } | null>(null);

  const guard = useCallback(<T,>(fn: (overrideReason?: string) => Promise<T>): Promise<T | null> => {
    return fn().catch((err) => {
      const payload = safetyPayload(err);
      if (!payload) throw err;
      return new Promise<T | null>((resolve, reject) => {
        setPending({
          payload,
          retry: async (reason) => {
            try {
              const result = await fn(reason);
              setPending(null);
              resolve(result);
            } catch (e) {
              const again = safetyPayload(e);
              if (again) { setPending((p) => p && { ...p, payload: again }); return; }
              setPending(null);
              reject(e);
            }
          },
          cancel: () => { setPending(null); resolve(null); },
        });
      });
    });
  }, []);

  const dialog = pending ? (
    <SafetyDialog
      issues={pending.payload.safety_issues}
      overridable={pending.payload.overridable}
      onOverride={pending.retry}
      onCancel={pending.cancel}
    />
  ) : null;

  return { guard, dialog };
}

function SafetyDialog({ issues, overridable, onOverride, onCancel }: {
  issues: SafetyIssue[];
  overridable: boolean;
  onOverride: (reason: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const Icon = overridable ? ShieldAlert : ShieldX;
  const accent = overridable ? "var(--c-amber)" : "var(--c-red)";

  useEffect(() => {
    cancelRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) { if (e.key === "Escape") onCancel(); }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  async function submit() {
    if (!reason.trim()) return;
    setSubmitting(true);
    try { await onOverride(reason.trim()); } finally { setSubmitting(false); }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onCancel}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="safety-title"
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: "var(--bg-elevated)", border: `1px solid ${accent}`, boxShadow: "var(--shadow-lg)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2.5 mb-4">
          <Icon size={20} style={{ color: accent }} />
          <h3 id="safety-title" className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            {overridable ? "Check before continuing" : "Dose blocked"}
          </h3>
        </div>

        <ul className="space-y-2.5 mb-5">
          {issues.map((issue, i) => (
            <li key={i} className="rounded-xl px-3.5 py-2.5 text-sm"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-0.5"
                style={{ color: issue.overridable ? "var(--c-amber)" : "var(--c-red)" }}>
                {ISSUE_LABEL[issue.code] ?? issue.code}
              </div>
              <div style={{ color: "var(--text-secondary)" }}>{issue.message}</div>
            </li>
          ))}
        </ul>

        {overridable ? (
          <label className="block mb-5">
            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Reason for overriding (recorded and sent to managers)
            </span>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2}
              placeholder="e.g. GP verbal order confirmed by phone at 14:10"
              className="mt-1.5 w-full text-sm px-3 py-2 rounded-xl outline-none resize-none"
              style={{ background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }} />
          </label>
        ) : (
          <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
            This can&apos;t be overridden here. Don&apos;t give the dose — contact the prescriber or pharmacist.
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <button ref={cancelRef} onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            {overridable ? "Don't give" : "Close"}
          </button>
          {overridable && (
            <button onClick={submit} disabled={!reason.trim() || submitting}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50"
              style={{ background: "#b45309" }}>
              {submitting ? "Recording…" : "Override and record"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
