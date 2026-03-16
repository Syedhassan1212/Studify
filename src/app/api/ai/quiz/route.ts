import { NextResponse } from "next/server";
import { generateGeminiText } from "@/lib/gemini";

function extractJson(raw: string) {
  if (!raw) return null;
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenceMatch?.[1] ?? raw).trim();
  const first = candidate.indexOf("{");
  const last = candidate.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    const slice = candidate.slice(first, last + 1);
    try {
      return JSON.parse(slice);
    } catch {
      // fall through
    }
  }
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const topic = String(body?.topic ?? "");
  const notes = String(body?.notes ?? "");
  const difficulty = String(body?.difficulty ?? "medium");
  const count = Number(body?.count ?? 5);
  const type = String(body?.type ?? "mixed");

  const prompt = `Create ${count} ${type} questions about ${topic || "the provided study topic"}.
Difficulty: ${difficulty}.
Use the notes below when available for accurate details.
Notes:
${notes || "No notes provided."}

Return valid JSON with a \"questions\" array. Each question should include: id, type, question, options (if MCQ), answer, explanation.`;

  const raw = await generateGeminiText({ prompt, temperature: 0.4 });

  const parsed = extractJson(raw);
  if (parsed) {
    return NextResponse.json(parsed);
  }
  return NextResponse.json({ raw: raw.trim() });
}
