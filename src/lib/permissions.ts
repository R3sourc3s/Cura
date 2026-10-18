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
  | "skills.view" | "skills.manage"
  | "integrations.view" | "integrations.manage"
  | "devices.view" | "devices.manage";

export type NavSection =
  | "Main" | "Residents" | "Medication" | "Shift" | "Staff" | "Compliance" | "Home & Admin" | "Settings";

/** Sidebar section order. "Main" renders ungrouped at the top. */
export const NAV_SECTIONS: NavSection[] = [
  "Main", "Residents", "Medication", "Shift", "Staff", "Compliance", "Home & Admin", "Settings",
];

export interface NavItem { label: string; href: string; permission: Permission | null; section: NavSection }

/** Which permission gates each nav item (null = always visible), grouped by sidebar section. */
export const NAV_ACCESS: NavItem[] = [
  { label: "Overview",          href: "/dashboard",                  permission: null,                    section: "Main" },
  { label: "Tasks",             href: "/dashboard/tasks",            permission: "tasks.view",            section: "Main" },
  { label: "Messages",          href: "/dashboard/messages",         permission: "messages.view",         section: "Main" },
  { label: "AI Assistant",      href: "/dashboard/ai",               permission: "ai.chat",               section: "Main" },

  { label: "Residents",         href: "/dashboard/residents",        permission: "residents.view",        section: "Residents" },
  { label: "Wings & Occupancy", href: "/dashboard/wings",            permission: "residents.view",        section: "Residents" },
  { label: "Care Plans",        href: "/dashboard/care-plans",       permission: "care_plans.view",       section: "Residents" },
  { label: "Care Notes",        href: "/dashboard/care-notes",       permission: "care_notes.view",       section: "Residents" },
  { label: "Body Map",          href: "/dashboard/body-map",         permission: "body_map.view",         section: "Residents" },
  { label: "Falls Risk",        href: "/dashboard/falls-risk",       permission: "falls_risk.view",       section: "Residents" },
  { label: "Fluid & Nutrition", href: "/dashboard/nutrition",        permission: "nutrition.view",        section: "Residents" },
  { label: "Overnight Checks",  href: "/dashboard/overnight-checks", permission: "overnight_checks.view", section: "Residents" },
  { label: "Appointments",      href: "/dashboard/appointments",     permission: "appointments.view",     section: "Residents" },

  { label: "Medications",       href: "/dashboard/medications",      permission: "medications.view",      section: "Medication" },
  { label: "MAR Chart",         href: "/dashboard/mar",              permission: "mar.view",              section: "Medication" },
  { label: "PRN Medications",   href: "/dashboard/prn",              permission: "prn.view",              section: "Medication" },
  { label: "Pharmacy",          href: "/dashboard/pharmacy",         permission: "pharmacy.view",         section: "Medication" },

  { label: "Handover",          href: "/dashboard/handover",         permission: "handover.view",         section: "Shift" },
  { label: "Incidents",         href: "/dashboard/incidents",        permission: "incidents.view",        section: "Shift" },
  { label: "Safeguarding",      href: "/dashboard/safeguarding",     permission: "safeguarding.view",     section: "Shift" },
  { label: "Visitors",          href: "/dashboard/visitors",         permission: "visitors.view",         section: "Shift" },
  { label: "Activities",        href: "/dashboard/activities",       permission: "activities.view",       section: "Shift" },

  { label: "Staff Overview",    href: "/dashboard/staff",            permission: "staff.view",            section: "Staff" },
  { label: "Staff Rota",        href: "/dashboard/rota",             permission: "rota.view",             section: "Staff" },
  { label: "Leave",             href: "/dashboard/leave",            permission: "leave.view",            section: "Staff" },
  { label: "Training",          href: "/dashboard/training",         permission: "training.view",         section: "Staff" },
  { label: "Skills Matrix",     href: "/dashboard/skills",           permission: "skills.view",           section: "Staff" },
  { label: "Recruitment",       href: "/dashboard/recruitment",      permission: "recruitment.view",      section: "Staff" },
  { label: "User Accounts",     href: "/dashboard/team",             permission: "team.view",             section: "Staff" },

  { label: "CQC Readiness",     href: "/dashboard/cqc",              permission: "cqc.view",              section: "Compliance" },
  { label: "Compliance",        href: "/dashboard/compliance",       permission: "compliance.view",       section: "Compliance" },
  { label: "KPI Dashboard",     href: "/dashboard/kpi",              permission: "kpi.view",              section: "Compliance" },
  { label: "Audit Trail",       href: "/dashboard/audit",            permission: "audit.view",            section: "Compliance" },
  { label: "Documents",         href: "/dashboard/documents",        permission: "documents.view",        section: "Compliance" },

  { label: "Enquiries",         href: "/dashboard/enquiries",        permission: "enquiries.view",        section: "Home & Admin" },
  { label: "Billing",           href: "/dashboard/billing",          permission: "billing.view",          section: "Home & Admin" },
  { label: "GP & Hospital",     href: "/dashboard/gp",               permission: "gp.view",               section: "Home & Admin" },
  { label: "Family Portal",     href: "/dashboard/family",           permission: "family.view",           section: "Home & Admin" },
  { label: "Maintenance",       href: "/dashboard/maintenance",      permission: "maintenance.view",      section: "Home & Admin" },

  { label: "Integrations",      href: "/dashboard/integrations",     permission: "integrations.view",     section: "Settings" },
  { label: "Devices & Sensors", href: "/dashboard/devices",          permission: "devices.view",          section: "Settings" },
];
