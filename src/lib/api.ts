/**
 * Typed API client for the Empathika Django backend.
 * All requests go through Next.js rewrites → Django.
 */

import type {
  Resident,
  Medication,
  MAREntry,
  CarePlan,
  Staff,
  ComplianceRecord,
} from "@/types";

const BASE = "/api/v1";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    // Attempt silent token refresh
    const refreshed = await refreshToken();
    if (refreshed) {
      return request<T>(path, options);
    }
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
  const refresh = localStorage.getItem("refresh_token");
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

// Auth
export const auth = {
  login: (username: string, password: string) =>
    request<{ access: string; refresh: string }>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  me: () => request<{ id: number; username: string; role: string; full_name: string }>("/auth/me/"),
};

// Residents
export const residents = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params) : "";
    return request<{ results: Resident[]; count: number }>(`/residents/${qs}`);
  },
  get: (id: number) => request<Resident>(`/residents/${id}/`),
  create: (data: Partial<Resident>) =>
    request<Resident>("/residents/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Resident>) =>
    request<Resident>(`/residents/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
};

// Medications
export const medications = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params) : "";
    return request<{ results: Medication[]; count: number }>(`/medications/${qs}`);
  },
  lowStock: () => request<Medication[]>("/medications/low_stock/"),
  marList: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params) : "";
    return request<{ results: MAREntry[]; count: number }>(`/medications/mar/${qs}`);
  },
  updateMAR: (id: number, data: Partial<MAREntry>) =>
    request<MAREntry>(`/medications/mar/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
};

// Care Plans
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
};

// Staff
export const staff = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params) : "";
    return request<{ results: Staff[]; count: number }>(`/staff/${qs}`);
  },
  get: (id: number) => request<Staff>(`/staff/${id}/`),
  create: (data: Partial<Staff>) =>
    request<Staff>("/staff/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Staff>) =>
    request<Staff>(`/staff/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
};

// Compliance
export const compliance = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params) : "";
    return request<{ results: ComplianceRecord[]; count: number }>(`/compliance/${qs}`);
  },
  get: (id: number) => request<ComplianceRecord>(`/compliance/${id}/`),
  create: (data: Partial<ComplianceRecord>) =>
    request<ComplianceRecord>("/compliance/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<ComplianceRecord>) =>
    request<ComplianceRecord>(`/compliance/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
};

// AI Assistant
export const ai = {
  chat: (message: string, context?: Record<string, any>) =>
    request<{ response: string }>("/ai/chat/", {
      method: "POST",
      body: JSON.stringify({ message, context }),
    }),
  generateReport: (type: string, data: Record<string, any>) =>
    request<{ report: string }>("/ai/report/", {
      method: "POST",
      body: JSON.stringify({ type, data }),
    }),
};

// Types are imported from @/types