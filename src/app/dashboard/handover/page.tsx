import { cookies } from "next/headers";
import { API_URL } from "@/lib/config";
import HandoverClient from "./HandoverClient";

async function fetchHandover(token: string) {
  const today = new Date().toISOString().slice(0, 10);
  const res = await fetch(`${API_URL}/api/v1/handover/?date=${today}&ordering=-created_at`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return { results: [] };
  return res.json();
}

async function fetchResidents(token: string) {
  const res = await fetch(`${API_URL}/api/v1/residents/?is_active=true&page_size=200`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return { results: [] };
  return res.json();
}

export default async function HandoverPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("emp_access")?.value ?? "";
  const [handoverData, residentsData] = await Promise.all([
    fetchHandover(token),
    fetchResidents(token),
  ]);
  return (
    <HandoverClient
      initialNotes={handoverData.results}
      residents={residentsData.results}
    />
  );
}
