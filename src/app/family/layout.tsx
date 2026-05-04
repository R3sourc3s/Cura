import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/config";
import FamilyShell from "./FamilyShell";

export default async function FamilyLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("emp_access")?.value;
  if (!token) redirect("/login");

  const res = await fetch(`${API_URL}/api/v1/auth/me/`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) redirect("/login");

  const user = await res.json();
  if (user.role !== "family") redirect("/dashboard");

  return <FamilyShell user={user}>{children}</FamilyShell>;
}
