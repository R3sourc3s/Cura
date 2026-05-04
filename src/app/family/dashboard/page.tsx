import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/config";
import FamilyDashboard from "./FamilyDashboard";

export default async function FamilyDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("emp_access")?.value ?? "";

  const residentRes = await fetch(`${API_URL}/api/v1/auth/family/resident/`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (residentRes.status === 404) {
    return (
      <div className="text-center py-20">
        <p className="text-white text-lg font-semibold">No resident linked to your account.</p>
        <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
          Please contact the care home to link your account.
        </p>
      </div>
    );
  }

  if (!residentRes.ok) redirect("/login");

  const resident = await residentRes.json();

  const [medsRes, plansRes] = await Promise.all([
    fetch(`${API_URL}/api/v1/medications/?resident=${resident.id}&is_active=true`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }),
    fetch(`${API_URL}/api/v1/care-plans/?resident=${resident.id}&status=active`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }),
  ]);

  const medications = medsRes.ok ? (await medsRes.json()).results : [];
  const carePlans = plansRes.ok ? (await plansRes.json()).results : [];

  return <FamilyDashboard resident={resident} medications={medications} carePlans={carePlans} />;
}
