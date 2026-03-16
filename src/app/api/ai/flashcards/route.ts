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
  const notes = String(body?.notes ?? "");
  const count = Number(body?.count ?? 10);

  const prompt = `Convert the notes below into ${count} flashcards.\nReturn JSON with a \"flashcards\" array. Each flashcard should include: front, back.\n\nNotes:\n${notes}`;

  const raw = await generateGeminiText({ prompt, temperature: 0.3 });

  const parsed = extractJson(raw);
  if (parsed) {
    return NextResponse.json(parsed);
  }
  return NextResponse.json({ raw: raw.trim() });
}
