import { auth } from "./api";

const SESSION_COOKIE = "emp_session";

export async function login(username: string, password: string) {
  const { access, refresh } = await auth.login(username, password);
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
  // Set a non-httponly cookie so middleware.ts can read it for route guards
  document.cookie = `${SESSION_COOKIE}=1; path=/; SameSite=Lax; max-age=86400`;
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
  window.location.href = "/login";
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("access_token");
}