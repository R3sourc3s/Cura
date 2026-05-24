import { API_URL } from "@/lib/config";
import OpenAI from "openai";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 503 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl = checkRateLimit(`ai:${ip}`);
  if (!rl.ok) {
    return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
  }

  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("emp_access")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const [residentRes, medsRes, marRes] = await Promise.allSettled([
    fetch(`${API_URL}/api/v1/residents/${id}/`, { headers: h }).then(r => r.json()),
    fetch(`${API_URL}/api/v1/medications/?resident=${id}&is_active=true`, { headers: h }).then(r => r.json()),
    fetch(`${API_URL}/api/v1/medications/mar/?medication__resident=${id}`, { headers: h }).then(r => r.json()),
  ]);

  if (residentRes.status === "rejected" || residentRes.value?.detail) {
    return NextResponse.json({ error: "Resident not found" }, { status: 404 });
  }

  const r = residentRes.value;
  const meds = medsRes.status === "fulfilled" ? (medsRes.value.results ?? []) : [];
  const mar = marRes.status === "fulfilled" ? (marRes.value.results ?? []) : [];

  const recentMAR = mar.slice(0, 20);
  const refusals = recentMAR.filter((e: { status: string }) => e.status === "refused").length;
  const omissions = recentMAR.filter((e: { status: string }) => e.status === "omitted").length;
  const controlledDrugs = meds.filter((m: { is_controlled: boolean }) => m.is_controlled);

  const prompt = `You are a clinical risk assessment AI for UK care homes. Analyse this resident and provide an overall risk score from 0 to 100, where:
- 0-25 = Low risk
- 26-50 = Medium risk
- 51-75 = High risk
- 76-100 = Critical risk

Higher scores indicate greater overall clinical risk requiring more intensive care.

## Resident Data
Name: ${r.full_name}
Age: ${r.age}
Fall risk: ${r.fall_risk}
Pressure ulcer risk: ${r.pressure_ulcer_risk}
Conditions: ${(r.conditions ?? []).map((c: { name: string }) => c.name).join(", ") || "None recorded"}
Active medications: ${meds.length} (${controlledDrugs.length} controlled drugs)
Recent medication refusals: ${refusals} / ${recentMAR.length} administrations
Recent medication omissions: ${omissions} / ${recentMAR.length} administrations
Days since admission: ${Math.floor((Date.now() - new Date(r.admission_date).getTime()) / 86400000)}

Respond with ONLY a JSON object in this exact format:
{"score": <number 0-100>, "reasoning": "<one sentence explanation>"}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 128,
    messages: [{ role: "user", content: prompt }],
  });

  const text = (completion.choices[0].message.content ?? "{}").trim();

  let score = 50;
  let reasoning = "";
  try {
    const parsed = JSON.parse(text);
    score = Math.max(0, Math.min(100, Math.round(parsed.score)));
    reasoning = parsed.reasoning ?? "";
  } catch {}

  // Persist score to Django
  try {
    await fetch(`${API_URL}/api/v1/residents/${id}/`, {
      method: "PATCH",
      headers: h,
      body: JSON.stringify({ ai_risk_score: score }),
    });
  } catch {}

  return NextResponse.json({ risk_score: score, reasoning });
}
