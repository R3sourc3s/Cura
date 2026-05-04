import { cookies } from "next/headers";
import { API_URL } from "@/lib/config";
import IncidentsClient from "./IncidentsClient";

async function fetchIncidents(token: string) {
  const res = await fetch(`${API_URL}/api/v1/incidents/?ordering=-incident_date`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return { results: [], count: 0 };
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

export default async function IncidentsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("emp_access")?.value ?? "";
  const [incidentsData, residentsData] = await Promise.all([
    fetchIncidents(token),
    fetchResidents(token),
  ]);
  return (
    <IncidentsClient
      initialIncidents={incidentsData.results}
      initialTotal={incidentsData.count}
      residents={residentsData.results}
    />
  );
}
