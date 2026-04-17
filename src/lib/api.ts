import type {
  Resident,
  Medication,
  MAREntry,
  CarePlan,
  Shift,
  LeaveRequest,
  ComplianceAudit,
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

export const auth = {
  login: (username: string, password: string) =>
    request<{ access: string; refresh: string }>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  me: () => request<User>("/auth/me/"),
};

export const residents = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params) : "";
    return request<{ results: Resident[]; count: number }>(`/residents/${qs}`);
  },
  get: (id: number) => request<Resident>(`/residents/${id}/`),
  create: (data: Partial<Resident>) =>
    request<Resident>("/residents/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Resident>) =>
    request<Resident>(`/residents/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

export const medications = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params) : "";
    return request<{ results: Medication[]; count: number }>(`/medications/${qs}`);
  },
  get: (id: number) => request<Medication>(`/medications/${id}/`),
  marList: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params) : "";
    return request<{ results: MAREntry[]; count: number }>(`/medications/mar/${qs}`);
  },
  updateMAR: (id: number, data: Partial<MAREntry>) =>
    request<MAREntry>(`/medications/mar/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

export const carePlans = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params) : "";
    return request<{ results: CarePlan[]; count: number }>(`/care-plans/${qs}`);
  },
  get: (id: number) => request<CarePlan>(`/care-plans/${id}/`),
  create: (data: Partial<CarePlan>) =>
    request<CarePlan>("/care-plans/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<CarePlan>) =>
    request<CarePlan>(`/care-plans/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  generateSummary: (id: number) =>
    request<{ summary: string }>(`/care-plans/${id}/generate-summary/`, { method: "POST" }),
};

export const staff = {
  shifts: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params) : "";
    return request<{ results: Shift[]; count: number }>(`/staff/shifts/${qs}`);
  },
  leave: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params) : "";
    return request<{ results: LeaveRequest[]; count: number }>(`/staff/leave/${qs}`);
  },
  updateLeave: (id: number, data: Partial<LeaveRequest>) =>
    request<LeaveRequest>(`/staff/leave/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

export const compliance = {
  audits: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params) : "";
    return request<{ results: ComplianceAudit[]; count: number }>(`/compliance/audits/${qs}`);
  },
};

export const ai = {
  chat: (message: string, context?: Record<string, unknown>) =>
    request<{ response: string }>("/ai/chat/", {
      method: "POST",
      body: JSON.stringify({ message, context }),
    }),
};
