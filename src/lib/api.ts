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
} from "@/types";

const BASE = "/api/v1";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) return request<T>(path, options);
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail ?? "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function upload<T>(path: string, formData: FormData, method = "PATCH"): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

async function refreshToken(): Promise<boolean> {
  const refresh =
    typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
  if (!refresh) return false;

  try {
    const res = await fetch(`${BASE}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const { access } = await res.json();
    localStorage.setItem("access_token", access);
    return true;
  } catch {
    return false;
  }
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
    request<{ summary: string }>(`/care-plans/${id}/generate-summary/`, { method: "POST" }),
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

export const ai = {
  chat: (message: string, context?: Record<string, unknown>) =>
    request<{ response: string }>("/ai/chat/", {
      method: "POST",
      body: JSON.stringify({ message, context }),
    }),
  riskScore: (residentId: number) =>
    request<{ risk_score: number }>(`/ai/residents/${residentId}/risk-score/`, { method: "POST" }),
  complianceGapReport: () =>
    request<{ report: string }>("/ai/compliance-gap-report/", { method: "POST" }),
};
