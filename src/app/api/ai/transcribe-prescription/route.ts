import OpenAI from "openai";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const EXTRACTION_PROMPT = `You are a clinical transcription assistant for a UK care home eMAR system. You are given a photo of a prescription, medication label, or pharmacy dispensing bag.

Read the image carefully and extract the medication details. Respond with ONLY a JSON object, no markdown, no commentary, in exactly this shape:
{
  "drug_name": "<generic or brand name as printed>",
  "dose": "<strength, e.g. '500mg'>",
  "route": "<one of: oral, topical, injection, inhaled, other>",
  "frequency": "<one of: od, bd, tds, qds, prn, weekly — map instructions like 'once daily' to od, 'twice daily' to bd, 'three times a day' to tds, 'four times a day' to qds, 'as required'/'as needed' to prn>",
  "indication": "<what it's for, if stated, else empty string>",
  "prescribed_by": "<prescriber/doctor name if visible, else empty string>",
  "is_controlled": <true if it appears to be a controlled drug e.g. schedule 2/3 opioid, benzodiazepine, etc — else false>,
  "confidence": "<low | medium | high — your confidence this was read correctly>",
  "raw_text": "<all text you could read from the label, verbatim>"
}

If the image is not a legible medication label/prescription, set every field to empty string / false / "low" confidence and put an explanation in raw_text. Never invent details that are not visible or reasonably inferable from the image.`;

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 503 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("emp_access")?.value;
  if (!token) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl = checkRateLimit(`transcribe-rx:${ip}`);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }

  const formData = await req.formData();
  const file = formData.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "An image file is required (field name 'image')" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Image too large (max 8MB)" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const dataUrl = `data:${file.type};base64,${bytes.toString("base64")}`;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: EXTRACTION_PROMPT },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    });

    const text = (completion.choices[0].message.content ?? "{}").trim()
      .replace(/^```json\s*/i, "").replace(/```$/, "");

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Could not parse the prescription — try a clearer photo." }, { status: 422 });
    }

    return NextResponse.json({ extracted: parsed });
  } catch (err) {
    console.error("Prescription transcription failed:", err);
    return NextResponse.json({ error: "AI transcription unavailable — please enter details manually." }, { status: 502 });
  }
}
