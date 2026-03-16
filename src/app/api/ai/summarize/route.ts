import { NextResponse } from "next/server";
import { generateGeminiText } from "@/lib/gemini";

export async function POST(request: Request) {
  const body = await request.json();
  const notes = String(body?.notes ?? "");

  if (!notes.trim()) {
    return NextResponse.json({ error: "Notes are required." }, { status: 400 });
  }

  const maxChars = 12000;
  const trimmed = notes.length > maxChars ? notes.slice(0, maxChars) : notes;
  const truncationNote =
    notes.length > maxChars
      ? `\n\nNOTE: Notes were truncated to the first ${maxChars} characters.`
      : "";

  const prompt = `Summarize the notes below. Return JSON with keys: bulletSummary (array), keyConcepts (array), definitions (array of {term, definition}), examHighlights (array).\n\nNotes:\n${trimmed}${truncationNote}`;

  let raw = "";
  try {
    raw = await generateGeminiText({ prompt, temperature: 0.2 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gemini request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  try {
    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ raw });
  }
}
