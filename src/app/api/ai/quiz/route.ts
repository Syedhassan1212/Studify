import { NextResponse } from "next/server";
import { generateGeminiText } from "@/lib/gemini";

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

  try {
    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ raw });
  }
}
