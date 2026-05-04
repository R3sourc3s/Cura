import type {
  Resident,
  Medication,
  MAREntry,
  CarePlan,
  CarePlanSection,
  CarePlanNote,
  Shift,
  LeaveRequest,
  Training,
  ComplianceAudit,
  AuditAction,
  User,
  Incident,
  IncidentFollowUp,
  HandoverNote,
  VitalSign,
} from "@/types";

const BASE = "/api/v1";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail ?? "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function upload<T>(path: string, formData: FormData, method = "PATCH"): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: "include",
    body: formData,
  });

  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Session expired");
  }
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

function qs(params?: Record<string, string>) {
  return params ? "?" + new URLSearchParams(params) : "";
}

export const auth = {
  login: (username: string, password: string) =>
    request<{ access: string; refresh: string }>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  me: () => request<User>("/auth/me/"),
  users: (params?: Record<string, string>) =>
    request<{ results: User[]; count: number }>(`/auth/users/${qs(params)}`),
  createUser: (data: {
    username: string; email: string; first_name: string; last_name: string;
    password: string; role: string; phone?: string;
  }) => request<User>("/auth/users/create/", { method: "POST", body: JSON.stringify(data) }),
  updateUser: (id: number, data: Partial<User & { password?: string }>) =>
    request<User>(`/auth/users/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteUser: (id: number) =>
    request<void>(`/auth/users/${id}/`, { method: "DELETE" }),
};

export const residents = {
  list: (params?: Record<string, string>) =>
    request<{ results: Resident[]; count: number }>(`/residents/${qs(params)}`),
  get: (id: number) => request<Resident>(`/residents/${id}/`),
  create: (data: FormData) => upload<Resident>("/residents/", data, "POST"),
  update: (id: number, data: FormData) => upload<Resident>(`/residents/${id}/`, data, "PATCH"),
  delete: (id: number) => request<void>(`/residents/${id}/`, { method: "DELETE" }),
  medications: (id: number) =>
    request<{ results: Medication[]; count: number }>(`/medications/?resident=${id}&is_active=true`),
  carePlans: (id: number) =>
    request<{ results: CarePlan[]; count: number }>(`/care-plans/?resident=${id}`),
  mar: (residentId: number) =>
    request<{ results: MAREntry[]; count: number }>(`/medications/mar/?medication__resident=${residentId}`),
};

export const medications = {
  list: (params?: Record<string, string>) =>
    request<{ results: Medication[]; count: number }>(`/medications/${qs(params)}`),
  get: (id: number) => request<Medication>(`/medications/${id}/`),
  create: (data: Partial<Medication>) =>
    request<Medication>("/medications/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Medication>) =>
    request<Medication>(`/medications/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/medications/${id}/`, { method: "DELETE" }),
  marList: (params?: Record<string, string>) =>
    request<{ results: MAREntry[]; count: number }>(`/medications/mar/${qs(params)}`),
  updateMAR: (id: number, data: Partial<MAREntry>) =>
    request<MAREntry>(`/medications/mar/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

export const carePlans = {
  list: (params?: Record<string, string>) =>
    request<{ results: CarePlan[]; count: number }>(`/care-plans/${qs(params)}`),
  get: (id: number) => request<CarePlan>(`/care-plans/${id}/`),
  create: (data: Partial<CarePlan>) =>
    request<CarePlan>("/care-plans/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<CarePlan>) =>
    request<CarePlan>(`/care-plans/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/care-plans/${id}/`, { method: "DELETE" }),
  generateSummary: (id: number) =>
    fetch(`/api/ai/care-plans/${id}/generate-summary`, {
      method: "POST",
      credentials: "include",
    }).then(async (r) => {
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "AI unavailable");
      return r.json() as Promise<{ summary: string }>;
    }),
  createSection: (planId: number, data: Partial<CarePlanSection>) =>
    request<CarePlanSection>(`/care-plans/${planId}/sections/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSection: (planId: number, sectionId: number, data: Partial<CarePlanSection>) =>
    request<CarePlanSection>(`/care-plans/${planId}/sections/${sectionId}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteSection: (planId: number, sectionId: number) =>
    request<void>(`/care-plans/${planId}/sections/${sectionId}/`, { method: "DELETE" }),
  addNote: (planId: number, body: string) =>
    request<CarePlanNote>(`/care-plans/${planId}/notes/`, {
      method: "POST",
      body: JSON.stringify({ body }),
    }),
};

export const staff = {
  shifts: (params?: Record<string, string>) =>
    request<{ results: Shift[]; count: number }>(`/staff/shifts/${qs(params)}`),
  createShift: (data: Partial<Shift>) =>
    request<Shift>("/staff/shifts/", { method: "POST", body: JSON.stringify(data) }),
  updateShift: (id: number, data: Partial<Shift>) =>
    request<Shift>(`/staff/shifts/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteShift: (id: number) => request<void>(`/staff/shifts/${id}/`, { method: "DELETE" }),
  leave: (params?: Record<string, string>) =>
    request<{ results: LeaveRequest[]; count: number }>(`/staff/leave/${qs(params)}`),
  createLeave: (data: Partial<LeaveRequest>) =>
    request<LeaveRequest>("/staff/leave/", { method: "POST", body: JSON.stringify(data) }),
  updateLeave: (id: number, data: Partial<LeaveRequest>) =>
    request<LeaveRequest>(`/staff/leave/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  training: (params?: Record<string, string>) =>
    request<{ results: Training[]; count: number }>(`/staff/training/${qs(params)}`),
  createTraining: (data: Partial<Training>) =>
    request<Training>("/staff/training/", { method: "POST", body: JSON.stringify(data) }),
  updateTraining: (id: number, data: Partial<Training>) =>
    request<Training>(`/staff/training/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

export const compliance = {
  audits: (params?: Record<string, string>) =>
    request<{ results: ComplianceAudit[]; count: number }>(`/compliance/audits/${qs(params)}`),
  createAudit: (data: Partial<ComplianceAudit>) =>
    request<ComplianceAudit>("/compliance/audits/", { method: "POST", body: JSON.stringify(data) }),
  updateAudit: (id: number, data: Partial<ComplianceAudit>) =>
    request<ComplianceAudit>(`/compliance/audits/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  actions: (params?: Record<string, string>) =>
    request<{ results: AuditAction[]; count: number }>(`/compliance/actions/${qs(params)}`),
  createAction: (data: Partial<AuditAction>) =>
    request<AuditAction>("/compliance/actions/", { method: "POST", body: JSON.stringify(data) }),
  updateAction: (id: number, data: Partial<AuditAction>) =>
    request<AuditAction>(`/compliance/actions/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

export const incidents = {
  list: (params?: Record<string, string>) =>
    request<{ results: Incident[]; count: number }>(`/incidents/${qs(params)}`),
  get: (id: number) => request<Incident>(`/incidents/${id}/`),
  create: (data: Partial<Incident>) =>
    request<Incident>("/incidents/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Incident>) =>
    request<Incident>(`/incidents/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  addFollowUp: (incidentId: number, note: string) =>
    request<IncidentFollowUp>(`/incidents/${incidentId}/follow-ups/`, {
      method: "POST",
      body: JSON.stringify({ note }),
    }),
};

export const handover = {
  list: (params?: Record<string, string>) =>
    request<{ results: HandoverNote[]; count: number }>(`/handover/${qs(params)}`),
  create: (data: Partial<HandoverNote>) =>
    request<HandoverNote>("/handover/", { method: "POST", body: JSON.stringify(data) }),
  markRead: (id: number) =>
    request<{ ok: boolean }>(`/handover/${id}/mark-read/`, { method: "POST" }),
};

export const family = {
  myResident: () => request<Resident>("/auth/family/resident/"),
};

export const vitals = {
  list: (residentId: number) =>
    request<VitalSign[]>(`/vitals/?resident=${residentId}&ordering=-recorded_at`),
  create: (data: Partial<VitalSign>) =>
    request<VitalSign>("/vitals/", { method: "POST", body: JSON.stringify(data) }),
};

export const ai = {
  chat: (message: string, history: { role: string; content: string }[] = []) =>
    fetch("/api/ai/chat", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    }).then(async (r) => {
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "AI unavailable");
      return r.json() as Promise<{ response: string }>;
    }),
  riskScore: (residentId: number) =>
    fetch(`/api/ai/residents/${residentId}/risk-score`, {
      method: "POST",
      credentials: "include",
    }).then(async (r) => {
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "AI unavailable");
      return r.json() as Promise<{ risk_score: number; reasoning: string }>;
    }),
  complianceGapReport: () =>
    fetch("/api/ai/compliance-gap-report", {
      method: "POST",
      credentials: "include",
    }).then(async (r) => {
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "AI unavailable");
      return r.json() as Promise<{ report: string }>;
    }),
};
