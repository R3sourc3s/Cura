// Types only — the actual role→permission mapping lives server-side in /api/auth/permissions

export type Role = "admin" | "manager" | "nurse" | "carer" | "hr";

export type Permission =
  | "residents.view" | "residents.create" | "residents.edit" | "residents.delete"
  | "medications.view" | "medications.create" | "medications.edit" | "medications.delete" | "medications.administer"
  | "care_plans.view" | "care_plans.create" | "care_plans.ai_summary"
  | "staff.view" | "staff.manage" | "staff.request_leave"
  | "compliance.view" | "compliance.manage" | "compliance.ai_report"
  | "team.view" | "team.manage"
  | "ai.chat" | "ai.risk_score" | "ai.compliance_report";

/** Which permission gates each nav item (null = always visible). */
export const NAV_ACCESS: { label: string; href: string; permission: Permission | null }[] = [
  { label: "Overview",     href: "/dashboard",            permission: null },
  { label: "Residents",    href: "/dashboard/residents",  permission: "residents.view" },
  { label: "Medications",  href: "/dashboard/medications",permission: "medications.view" },
  { label: "Care Plans",   href: "/dashboard/care-plans", permission: "care_plans.view" },
  { label: "Staff",        href: "/dashboard/staff",      permission: "staff.view" },
  { label: "Team",         href: "/dashboard/team",       permission: "team.view" },
  { label: "Compliance",   href: "/dashboard/compliance", permission: "compliance.view" },
  { label: "AI Assistant", href: "/dashboard/ai",         permission: "ai.chat" },
];
