import { API_URL } from "@/lib/config";
import OpenAI from "openai";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 503 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("emp_access")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const [planRes] = await Promise.allSettled([
    fetch(`${API_URL}/api/v1/care-plans/${id}/`, { headers: h }).then(r => r.json()),
  ]);

  if (planRes.status === "rejected" || planRes.value?.detail) {
    return NextResponse.json({ error: "Care plan not found" }, { status: 404 });
  }

  const plan = planRes.value;

  // Fetch resident details for richer context
  let residentData = "";
  if (plan.resident) {
    try {
      const r = await fetch(`${API_URL}/api/v1/residents/${plan.resident}/`, { headers: h }).then(res => res.json());
      const meds = await fetch(`${API_URL}/api/v1/medications/?resident=${plan.resident}&is_active=true`, { headers: h }).then(res => res.json()).catch(() => ({ results: [] }));
      residentData = `Resident: ${r.full_name}, Age: ${r.age}, Room: ${r.room_number}
Fall risk: ${r.fall_risk}, Pressure ulcer risk: ${r.pressure_ulcer_risk}
Conditions: ${(r.conditions ?? []).map((c: { name: string }) => c.name).join(", ") || "None recorded"}
Active medications: ${(meds.results ?? []).map((m: { drug_name: string; dose: string }) => `${m.drug_name} ${m.dose}`).join(", ") || "None"}`;
    } catch {}
  }

  const sectionsText = (plan.sections ?? []).map((s: { title: string; content: string }) =>
    `### ${s.title}\n${s.content}`
  ).join("\n\n");

  const notesText = (plan.notes ?? []).slice(0, 5).map((n: { body: string; created_at: string }) =>
    `- ${new Date(n.created_at).toLocaleDateString("en-GB")}: ${n.body}`
  ).join("\n");

  const prompt = `Generate a concise clinical care plan summary for the following:

${residentData}

Care Plan Status: ${plan.status}
Version: ${plan.version}
Next Review: ${plan.next_review_date ? new Date(plan.next_review_date).toLocaleDateString("en-GB") : "Not set"}

${sectionsText ? `## Care Plan Sections\n${sectionsText}` : "No sections recorded yet."}

${notesText ? `## Recent Notes\n${notesText}` : ""}

Write a 2-4 sentence clinical summary suitable for handover or CQC inspection. Focus on the resident's current care needs, key risks, and care priorities. Use professional UK clinical language. Be factual and based only on the information provided.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const summary = completion.choices[0].message.content ?? "";

  // Persist summary back to Django
  try {
    await fetch(`${API_URL}/api/v1/care-plans/${id}/`, {
      method: "PATCH",
      headers: h,
      body: JSON.stringify({ ai_summary: summary, ai_generated: true }),
    });
  } catch {}

  return NextResponse.json({ summary });
}
