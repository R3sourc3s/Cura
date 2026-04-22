import { API_URL } from "@/lib/config";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("emp_access")?.value;
  if (!token) return NextResponse.json({ items: [] });

  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const [leaveRes, medsRes, plansRes] = await Promise.allSettled([
    fetch(`${API_URL}/api/v1/staff/leave/?status=pending`, { headers: h }).then(r => r.json()),
    fetch(`${API_URL}/api/v1/medications/?is_active=true`, { headers: h }).then(r => r.json()),
    fetch(`${API_URL}/api/v1/care-plans/?status=active`, { headers: h }).then(r => r.json()),
  ]);

  const items: { id: string; type: "leave" | "stock" | "review"; message: string; href: string }[] = [];

  if (leaveRes.status === "fulfilled" && leaveRes.value?.results) {
    const pending: { id: number; staff_member_name?: string }[] = leaveRes.value.results;
    pending.slice(0, 3).forEach((l) => {
      items.push({
        id: `leave-${l.id}`,
        type: "leave",
        message: `Leave request from ${l.staff_member_name ?? "a staff member"} awaiting approval`,
        href: "/dashboard/staff",
      });
    });
    if (pending.length > 3) {
      items.push({ id: "leave-more", type: "leave", message: `+${pending.length - 3} more leave requests pending`, href: "/dashboard/staff" });
    }
  }

  if (medsRes.status === "fulfilled" && medsRes.value?.results) {
    const lowStock: { id: number; drug_name: string }[] = medsRes.value.results.filter(
      (m: { is_low_stock: boolean }) => m.is_low_stock
    );
    lowStock.slice(0, 3).forEach((m) => {
      items.push({ id: `stock-${m.id}`, type: "stock", message: `${m.drug_name} is low on stock`, href: "/dashboard/medications" });
    });
  }

  if (plansRes.status === "fulfilled" && plansRes.value?.results) {
    const today = new Date();
    const overdue: { id: number; resident_name?: string }[] = plansRes.value.results.filter(
      (p: { next_review_date: string | null }) => p.next_review_date && new Date(p.next_review_date) < today
    );
    overdue.slice(0, 2).forEach((p) => {
      items.push({ id: `review-${p.id}`, type: "review", message: `Care plan overdue for review`, href: "/dashboard/care-plans" });
    });
  }

  return NextResponse.json({ items });
}
