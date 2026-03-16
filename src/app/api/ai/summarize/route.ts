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

  const parsed = extractJson(raw);
  if (parsed) {
    return NextResponse.json(parsed);
  }
  return NextResponse.json({ raw: raw.trim() });
}
