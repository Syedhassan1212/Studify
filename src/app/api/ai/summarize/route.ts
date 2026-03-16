import { NextResponse } from "next/server";
import { generateGeminiText } from "@/lib/gemini";

export async function POST(request: Request) {
  const body = await request.json();
  const notes = String(body?.notes ?? "");

  const prompt = `Summarize the notes below. Return JSON with keys: bulletSummary (array), keyConcepts (array), definitions (array of {term, definition}), examHighlights (array).\n\nNotes:\n${notes}`;

  const raw = await generateGeminiText({ prompt, temperature: 0.2 });

  try {
    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ raw });
  }
}
