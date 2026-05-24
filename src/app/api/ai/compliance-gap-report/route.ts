import { API_URL } from "@/lib/config";
import OpenAI from "openai";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


const DOMAIN_LABELS: Record<string, string> = {
  safe: "Safe", effective: "Effective", caring: "Caring",
  responsive: "Responsive", well_led: "Well-Led",
};

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 503 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl = checkRateLimit(`ai:${ip}`);
  if (!rl.ok) {
    return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("emp_access")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const [auditsRes, actionsRes] = await Promise.allSettled([
    fetch(`${API_URL}/api/v1/compliance/audits/`, { headers: h }).then(r => r.json()),
    fetch(`${API_URL}/api/v1/compliance/actions/?status=open`, { headers: h }).then(r => r.json()),
  ]);

  const audits = auditsRes.status === "fulfilled" ? (auditsRes.value.results ?? []) : [];
  const openActions = actionsRes.status === "fulfilled" ? (actionsRes.value.results ?? []) : [];

  const auditSummary = audits.length
    ? audits.map((a: { domain: string; score: number; rating: string; notes: string; audit_date: string }) =>
        `- ${DOMAIN_LABELS[a.domain] ?? a.domain}: ${a.score}/100 (${a.rating.replace("_", " ")}) — audited ${new Date(a.audit_date).toLocaleDateString("en-GB")}${a.notes ? `, notes: ${a.notes}` : ""}`
      ).join("\n")
    : "No audits recorded.";

  const actionsSummary = openActions.length
    ? openActions.slice(0, 10).map((a: { description: string; priority: string; due_date: string }) =>
        `- [${a.priority.toUpperCase()}] ${a.description} (due: ${new Date(a.due_date).toLocaleDateString("en-GB")})`
      ).join("\n")
    : "No open remediation actions.";

  const avg = audits.length
    ? Math.round(audits.reduce((s: number, a: { score: number }) => s + a.score, 0) / audits.length)
    : 0;

  const prompt = `You are a CQC (Care Quality Commission) compliance expert for UK adult social care. Analyse this care home's audit data and produce a concise gap analysis report.

## Current Audit Scores
${auditSummary}

Overall average: ${avg}/100

## Open Remediation Actions (${openActions.length} total)
${actionsSummary}

## CQC Rating Thresholds
- Outstanding: 90-100
- Good: 70-89
- Requires Improvement: 50-69
- Inadequate: 0-49

Write a professional gap analysis report with these sections:
1. **Executive Summary** (2-3 sentences on overall compliance posture)
2. **Key Gaps** (bullet points for domains below 70, with specific risks)
3. **Priority Actions** (top 3 concrete steps to improve weakest domains)
4. **Strengths** (what's working well, if anything scores 70+)

Use professional UK care sector language. Be specific and actionable. Maximum 400 words.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const report = completion.choices[0].message.content ?? "";
  return NextResponse.json({ report });
}
