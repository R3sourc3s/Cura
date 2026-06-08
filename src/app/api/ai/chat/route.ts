import { API_URL } from "@/lib/config";
import OpenAI from "openai";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

async function fetchCareHomeContext(token: string) {
  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const [residents, mar, plans, audits] = await Promise.allSettled([
    fetch(`${API_URL}/api/v1/residents/?is_active=true`, { headers: h }).then(r => r.json()),
    fetch(`${API_URL}/api/v1/medications/mar/`, { headers: h }).then(r => r.json()),
    fetch(`${API_URL}/api/v1/care-plans/?status=active`, { headers: h }).then(r => r.json()),
    fetch(`${API_URL}/api/v1/compliance/audits/`, { headers: h }).then(r => r.json()),
  ]);

  const lines: string[] = [];

  if (residents.status === "fulfilled" && residents.value?.results) {
    const all = residents.value.results;
    const critical = all.filter((r: { fall_risk: string }) => r.fall_risk === "critical");
    const high = all.filter((r: { fall_risk: string }) => r.fall_risk === "high");
    lines.push(`Residents: ${all.length} active total. Critical fall risk: ${critical.length} (${critical.map((r: { full_name: string }) => r.full_name).join(", ") || "none"}). High fall risk: ${high.length}.`);
  }

  if (mar.status === "fulfilled" && mar.value?.results) {
    const today = new Date().toDateString();
    const todayEntries = mar.value.results.filter((e: { scheduled_at: string }) => new Date(e.scheduled_at).toDateString() === today);
    const pending = todayEntries.filter((e: { status: string }) => e.status === "pending");
    const given = todayEntries.filter((e: { status: string }) => e.status === "given");
    lines.push(`Today's medications: ${todayEntries.length} scheduled, ${given.length} given, ${pending.length} pending.`);
  }

  if (plans.status === "fulfilled" && plans.value?.results) {
    const overdue = plans.value.results.filter((p: { next_review_date: string | null }) =>
      p.next_review_date && new Date(p.next_review_date) < new Date()
    );
    lines.push(`Active care plans: ${plans.value.count}. Overdue for review: ${overdue.length}.`);
  }

  if (audits.status === "fulfilled" && audits.value?.results) {
    const scores = audits.value.results.map((a: { score: number }) => a.score);
    const avg = scores.length ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
    lines.push(`CQC compliance average score: ${avg}/100 across ${scores.length} domains.`);
  }

  return lines.join("\n");
}

const SYSTEM_PROMPT = `You are Cura AI, an intelligent assistant for care home staff in the UK. You help nurses, carers, managers and HR with:
- Resident care, health monitoring and risk assessment
- Medication administration and MAR (Medication Administration Record) queries
- Care plan reviews and updates
- CQC compliance and regulatory requirements
- Staff scheduling, leave and training
- Handover notes and clinical documentation

You have access to live care home data provided below. Be concise, accurate and clinically appropriate. Always recommend involving qualified healthcare professionals for clinical decisions. Use UK English. Never fabricate resident names or clinical data not present in the context.`;

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 503 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl = checkRateLimit(`chat:${ip}`);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }

  const { message, history = [] } = await req.json();
  if (!message?.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("emp_access")?.value;

  if (!token) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let contextStr = "";
  try {
    contextStr = await fetchCareHomeContext(token);
  } catch (err) {
    console.error("Failed to fetch care home context:", err);
  }

  const systemWithContext = contextStr
    ? `${SYSTEM_PROMPT}\n\n## Current Care Home Data\n${contextStr}`
    : SYSTEM_PROMPT;

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemWithContext },
    ...history.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 1024,
    messages,
  });

  const response = completion.choices[0].message.content ?? "";
  return NextResponse.json({ response });
}
