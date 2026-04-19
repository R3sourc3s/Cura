import { cookies } from "next/headers";
import type {
  Resident, MAREntry, CarePlan, ComplianceAudit,
  AuditAction, Shift, LeaveRequest, Training, User,
} from "@/types";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("emp_access")?.value;

  const url = new URL(`${API_URL}/api/v1${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

type List<T> = { results: T[]; count: number };

export const serverApi = {
  residents: {
    list: (p?: Record<string, string>) => get<List<Resident>>("/residents/", p),
  },
  medications: {
    list: (p?: Record<string, string>) => get<List<{ id: number; [key: string]: unknown }>>("/medications/", p),
    marList: (p?: Record<string, string>) => get<List<MAREntry>>("/medications/mar/", p),
  },
  carePlans: {
    list: (p?: Record<string, string>) => get<List<CarePlan>>("/care-plans/", p),
  },
  compliance: {
    audits: (p?: Record<string, string>) => get<List<ComplianceAudit>>("/compliance/audits/", p),
    actions: (p?: Record<string, string>) => get<List<AuditAction>>("/compliance/actions/", p),
  },
  staff: {
    shifts: (p?: Record<string, string>) => get<List<Shift>>("/staff/shifts/", p),
    leave: (p?: Record<string, string>) => get<List<LeaveRequest>>("/staff/leave/", p),
    training: (p?: Record<string, string>) => get<List<Training>>("/staff/training/", p),
  },
  auth: {
    me: () => get<User>("/auth/me/"),
    users: (p?: Record<string, string>) => get<List<User>>("/auth/users/", p),
  },
};
