"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb { label: string; href?: string; }

export default function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1 text-xs mb-4 flex-wrap">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={12} style={{ color: "var(--text-muted)" }} />}
            {crumb.href && !isLast ? (
              <Link href={crumb.href}
                className="transition-colors hover:underline"
                style={{ color: "var(--text-muted)" }}>
                {crumb.label}
              </Link>
            ) : (
              <span style={{ color: isLast ? "var(--text-secondary)" : "var(--text-muted)" }}>
                {crumb.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
