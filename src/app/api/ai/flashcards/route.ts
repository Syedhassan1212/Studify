import { NextResponse } from "next/server";
import { generateGeminiText } from "@/lib/gemini";

export async function POST(request: Request) {
  const body = await request.json();
  const notes = String(body?.notes ?? "");
  const count = Number(body?.count ?? 10);

  const prompt = `Convert the notes below into ${count} flashcards.\nReturn JSON with a \"flashcards\" array. Each flashcard should include: front, back.\n\nNotes:\n${notes}`;

  const raw = await generateGeminiText({ prompt, temperature: 0.3 });

  try {
    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ raw });
  }
}
