import { API_URL } from "@/lib/config";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Role, Permission } from "@/lib/permissions";

// Mirrors backend/apps/authentication/permissions.py ROLE_PERMISSIONS exactly —
// keep these in sync. (Previously this list drifted badly out of date and was
// missing pharmacy/recruitment/leave/tasks/enquiries/billing/gp/family/skills/
// integrations entirely, which silently hid those nav items for every role,
// admin included.)

const ADMIN: Permission[] = [
  "residents.view", "residents.create", "residents.edit", "residents.delete",
  "medications.view", "medications.create", "medications.edit", "medications.delete", "medications.administer",
  "care_plans.view", "care_plans.create", "care_plans.ai_summary",
  "staff.view", "staff.manage", "staff.request_leave",
  "compliance.view", "compliance.manage", "compliance.ai_report",
  "team.view", "team.manage",
  "ai.chat", "ai.risk_score", "ai.compliance_report",
  "incidents.view", "incidents.create", "incidents.manage",
  "handover.view", "handover.create", "handover.manage",
  "audit.view",
  "kpi.view",
  "care_notes.view", "care_notes.create",
  "visitors.view", "visitors.create",
  "maintenance.view", "maintenance.create", "maintenance.manage",
  "activities.view", "activities.create",
  "appointments.view", "appointments.create",
  "documents.view", "documents.upload",
  "rota.view", "rota.manage",
  "body_map.view", "body_map.create",
  "mar.view",
  "training.view", "training.manage",
  "nutrition.view", "nutrition.create",
  "falls_risk.view", "falls_risk.create",
  "overnight_checks.view", "overnight_checks.create",
  "safeguarding.view", "safeguarding.create", "safeguarding.manage",
  "messages.view", "messages.create",
  "cqc.view",
  "prn.view", "prn.administer",
  "family.view_resident",
  "pharmacy.view", "pharmacy.manage",
  "recruitment.view", "recruitment.manage",
  "leave.view", "leave.manage", "leave.request",
  "tasks.view", "tasks.create", "tasks.manage",
  "enquiries.view", "enquiries.manage",
  "billing.view", "billing.manage",
  "gp.view", "gp.manage",
  "family.view", "family.manage",
  "skills.view", "skills.manage",
  "integrations.view", "integrations.manage",
  "devices.view", "devices.manage",
];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ADMIN,

  manager: [
    "residents.view", "residents.create", "residents.edit",
    "medications.view", "medications.create", "medications.edit", "medications.administer",
    "care_plans.view", "care_plans.create", "care_plans.ai_summary",
    "staff.view", "staff.manage", "staff.request_leave",
    "compliance.view", "compliance.manage", "compliance.ai_report",
    "team.view",
    "ai.chat", "ai.risk_score", "ai.compliance_report",
    "incidents.view", "incidents.create", "incidents.manage",
    "handover.view", "handover.create", "handover.manage",
    "audit.view",
    "kpi.view",
    "care_notes.view", "care_notes.create",
    "visitors.view", "visitors.create",
    "maintenance.view", "maintenance.create", "maintenance.manage",
    "activities.view", "activities.create",
    "appointments.view", "appointments.create",
    "documents.view", "documents.upload",
    "rota.view", "rota.manage",
    "body_map.view", "body_map.create",
    "mar.view",
    "training.view", "training.manage",
    "nutrition.view", "nutrition.create",
    "falls_risk.view", "falls_risk.create",
    "overnight_checks.view", "overnight_checks.create",
    "safeguarding.view", "safeguarding.create", "safeguarding.manage",
    "messages.view", "messages.create",
    "cqc.view",
    "prn.view", "prn.administer",
    "pharmacy.view", "pharmacy.manage",
    "recruitment.view", "recruitment.manage",
    "leave.view", "leave.manage", "leave.request",
    "tasks.view", "tasks.create", "tasks.manage",
    "enquiries.view", "enquiries.manage",
    "billing.view", "billing.manage",
    "gp.view", "gp.manage",
    "family.view", "family.manage",
    "skills.view", "skills.manage",
    "integrations.view", "integrations.manage",
    "devices.view", "devices.manage",
  ],

  nurse: [
    "residents.view", "residents.create", "residents.edit",
    "medications.view", "medications.create", "medications.edit", "medications.administer",
    "care_plans.view", "care_plans.create", "care_plans.ai_summary",
    "staff.view", "staff.request_leave",
    "compliance.view",
    "ai.chat", "ai.risk_score",
    "incidents.view", "incidents.create",
    "handover.view", "handover.create",
    "kpi.view",
    "care_notes.view", "care_notes.create",
    "visitors.view",
    "maintenance.view", "maintenance.create",
    "activities.view", "activities.create",
    "appointments.view", "appointments.create",
    "documents.view",
    "rota.view",
    "body_map.view", "body_map.create",
    "mar.view",
    "nutrition.view", "nutrition.create",
    "falls_risk.view", "falls_risk.create",
    "overnight_checks.view", "overnight_checks.create",
    "safeguarding.view",
    "messages.view", "messages.create",
    "cqc.view",
    "prn.view", "prn.administer",
    "pharmacy.view",
    "leave.view", "leave.request",
    "tasks.view", "tasks.create",
    "gp.view",
    "family.view",
    "skills.view",
    "devices.view",
  ],

  carer: [
    "residents.view",
    "medications.view", "medications.administer",
    "care_plans.view",
    "staff.view", "staff.request_leave",
    "compliance.view",
    "ai.chat",
    "incidents.view", "incidents.create",
    "handover.view", "handover.create",
    "care_notes.view", "care_notes.create",
    "visitors.view", "visitors.create",
    "maintenance.view", "maintenance.create",
    "activities.view", "activities.create",
    "appointments.view",
    "documents.view",
    "rota.view",
    "body_map.view", "body_map.create",
    "mar.view",
    "nutrition.view", "nutrition.create",
    "falls_risk.view",
    "overnight_checks.view", "overnight_checks.create",
    "messages.view", "messages.create",
    "prn.view", "prn.administer",
    "leave.view", "leave.request",
    "tasks.view", "tasks.create",
    "devices.view",
  ],

  hr: [
    "staff.view", "staff.manage", "staff.request_leave",
    "team.view", "team.manage",
    "ai.chat",
    "handover.view",
    "documents.view", "documents.upload",
    "rota.view", "rota.manage",
    "training.view", "training.manage",
    "messages.view", "messages.create",
    "recruitment.view", "recruitment.manage",
    "leave.view", "leave.manage",
    "skills.view", "skills.manage",
  ],

  family: [
    "family.view_resident",
  ],
};

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("emp_access")?.value;

  if (!token) {
    return NextResponse.json({ permissions: [] }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_URL}/api/v1/auth/me/`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ permissions: [] }, { status: 401 });
    }

    const user = await res.json();
    const role = user.role as Role;
    const permissions: Permission[] = ROLE_PERMISSIONS[role] ?? [];

    return NextResponse.json({ role, permissions });
  } catch {
    return NextResponse.json({ permissions: [] }, { status: 502 });
  }
}
