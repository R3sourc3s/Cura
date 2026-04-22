import { API_URL } from "@/lib/config";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Role, Permission } from "@/lib/permissions";



const ALL: Permission[] = [
  "residents.view", "residents.create", "residents.edit", "residents.delete",
  "medications.view", "medications.create", "medications.edit", "medications.delete", "medications.administer",
  "care_plans.view", "care_plans.create", "care_plans.ai_summary",
  "staff.view", "staff.manage", "staff.request_leave",
  "compliance.view", "compliance.manage", "compliance.ai_report",
  "team.view", "team.manage",
  "ai.chat", "ai.risk_score", "ai.compliance_report",
];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ALL,

  manager: [
    "residents.view", "residents.create", "residents.edit",
    "medications.view", "medications.create", "medications.edit", "medications.administer",
    "care_plans.view", "care_plans.create", "care_plans.ai_summary",
    "staff.view", "staff.manage", "staff.request_leave",
    "compliance.view", "compliance.manage", "compliance.ai_report",
    "team.view",
    "ai.chat", "ai.risk_score", "ai.compliance_report",
  ],

  nurse: [
    "residents.view", "residents.create", "residents.edit",
    "medications.view", "medications.create", "medications.edit", "medications.administer",
    "care_plans.view", "care_plans.create", "care_plans.ai_summary",
    "staff.view", "staff.request_leave",
    "compliance.view",
    "ai.chat", "ai.risk_score",
  ],

  carer: [
    "residents.view",
    "medications.view", "medications.administer",
    "care_plans.view",
    "staff.view", "staff.request_leave",
    "compliance.view",
    "ai.chat",
  ],

  hr: [
    "staff.view", "staff.manage", "staff.request_leave",
    "team.view", "team.manage",
    "ai.chat",
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
