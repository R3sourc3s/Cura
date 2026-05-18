// Types only — the actual role→permission mapping lives server-side in /api/auth/permissions

export type Role = "admin" | "manager" | "nurse" | "carer" | "hr" | "family";

export type Permission =
  | "residents.view" | "residents.create" | "residents.edit" | "residents.delete"
  | "medications.view" | "medications.create" | "medications.edit" | "medications.delete" | "medications.administer"
  | "care_plans.view" | "care_plans.create" | "care_plans.ai_summary"
  | "staff.view" | "staff.manage" | "staff.request_leave"
  | "compliance.view" | "compliance.manage" | "compliance.ai_report"
  | "team.view" | "team.manage"
  | "ai.chat" | "ai.risk_score" | "ai.compliance_report"
  | "incidents.view" | "incidents.create" | "incidents.manage"
  | "handover.view" | "handover.create" | "handover.manage"
  | "family.view_resident"
  | "audit.view"
  | "kpi.view"
  | "care_notes.view" | "care_notes.create"
  | "visitors.view" | "visitors.create"
  | "maintenance.view" | "maintenance.create" | "maintenance.manage"
  | "activities.view" | "activities.create"
  | "appointments.view" | "appointments.create"
  | "documents.view" | "documents.upload"
  | "rota.view" | "rota.manage"
  | "body_map.view" | "body_map.create"
  | "mar.view"
  | "training.view" | "training.manage"
  | "nutrition.view" | "nutrition.create"
  | "falls_risk.view" | "falls_risk.create"
  | "overnight_checks.view" | "overnight_checks.create"
  | "safeguarding.view" | "safeguarding.create" | "safeguarding.manage"
  | "messages.view" | "messages.create"
  | "cqc.view"
  | "prn.view" | "prn.administer"
  | "pharmacy.view" | "pharmacy.manage"
  | "recruitment.view" | "recruitment.manage"
  | "leave.view" | "leave.manage" | "leave.request"
  | "tasks.view" | "tasks.create" | "tasks.manage"
  | "enquiries.view" | "enquiries.manage"
  | "billing.view" | "billing.manage"
  | "gp.view" | "gp.manage"
  | "family.view" | "family.manage"
  | "skills.view" | "skills.manage";

/** Which permission gates each nav item (null = always visible). */
export const NAV_ACCESS: { label: string; href: string; permission: Permission | null }[] = [
  { label: "Overview",         href: "/dashboard",                  permission: null },
  { label: "KPI Dashboard",    href: "/dashboard/kpi",              permission: "kpi.view" },
  { label: "Residents",        href: "/dashboard/residents",        permission: "residents.view" },
  { label: "Medications",      href: "/dashboard/medications",      permission: "medications.view" },
  { label: "MAR Chart",        href: "/dashboard/mar",              permission: "mar.view" },
  { label: "Care Plans",       href: "/dashboard/care-plans",       permission: "care_plans.view" },
  { label: "Care Notes",       href: "/dashboard/care-notes",       permission: "care_notes.view" },
  { label: "Body Map",         href: "/dashboard/body-map",         permission: "body_map.view" },
  { label: "Falls Risk",       href: "/dashboard/falls-risk",       permission: "falls_risk.view" },
  { label: "Fluid & Nutrition",href: "/dashboard/nutrition",        permission: "nutrition.view" },
  { label: "Overnight Checks", href: "/dashboard/overnight-checks", permission: "overnight_checks.view" },
  { label: "Appointments",     href: "/dashboard/appointments",     permission: "appointments.view" },
  { label: "Handover",         href: "/dashboard/handover",         permission: "handover.view" },
  { label: "Incidents",        href: "/dashboard/incidents",        permission: "incidents.view" },
  { label: "Safeguarding",     href: "/dashboard/safeguarding",     permission: "safeguarding.view" },
  { label: "Activities",       href: "/dashboard/activities",       permission: "activities.view" },
  { label: "Visitors",         href: "/dashboard/visitors",         permission: "visitors.view" },
  { label: "Maintenance",      href: "/dashboard/maintenance",      permission: "maintenance.view" },
  { label: "Documents",        href: "/dashboard/documents",        permission: "documents.view" },
  { label: "Staff Rota",       href: "/dashboard/rota",             permission: "rota.view" },
  { label: "Staff Training",   href: "/dashboard/training",         permission: "training.view" },
  { label: "Staff",            href: "/dashboard/staff",            permission: "staff.view" },
  { label: "Team",             href: "/dashboard/team",             permission: "team.view" },
  { label: "Compliance",       href: "/dashboard/compliance",       permission: "compliance.view" },
  { label: "Audit Trail",      href: "/dashboard/audit",            permission: "audit.view" },
  { label: "PRN Medications",  href: "/dashboard/prn",              permission: "prn.view" },
  { label: "Messages",         href: "/dashboard/messages",         permission: "messages.view" },
  { label: "CQC Readiness",   href: "/dashboard/cqc",              permission: "cqc.view" },
  { label: "AI Assistant",    href: "/dashboard/ai",               permission: "ai.chat" },
  { label: "Pharmacy",        href: "/dashboard/pharmacy",         permission: "pharmacy.view" },
  { label: "Recruitment",     href: "/dashboard/recruitment",      permission: "recruitment.view" },
  { label: "Leave",           href: "/dashboard/leave",            permission: "leave.view" },
  { label: "Tasks",           href: "/dashboard/tasks",            permission: "tasks.view" },
  { label: "Enquiries",       href: "/dashboard/enquiries",        permission: "enquiries.view" },
  { label: "Billing",         href: "/dashboard/billing",          permission: "billing.view" },
  { label: "GP & Hospital",   href: "/dashboard/gp",              permission: "gp.view" },
  { label: "Family Portal",   href: "/dashboard/family",           permission: "family.view" },
  { label: "Skills",          href: "/dashboard/skills",           permission: "skills.view" },
];
