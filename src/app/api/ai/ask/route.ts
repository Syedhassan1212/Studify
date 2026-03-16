import { NextResponse } from "next/server";
import { generateGeminiText } from "@/lib/gemini";
import { retrieveContext } from "@/lib/rag";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const question = String(body?.question ?? "").trim();
  const topicId = body?.topicId ? String(body.topicId) : null;
  const notesFromClient = String(body?.notes ?? "").trim();

  if (!question) {
    return NextResponse.json({ error: "Question is required." }, { status: 400 });
  }

  const { context, chunks } = await retrieveContext({ query: question, topicId });
  let extraNotes = "";

  if (!context && topicId) {
    const supabase = await supabaseServer();
    const { data: note } = await supabase
      .from("notes")
      .select("content")
      .eq("topic_id", topicId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    extraNotes = typeof note?.content?.text === "string" ? note.content.text : "";
  }

  const system =
    "You are a precise, friendly study tutor. Use the provided context when relevant. If the context is missing or insufficient, say so and offer a helpful, concise explanation based on general knowledge.";

  const combinedContext =
    context ||
    notesFromClient ||
    extraNotes ||
    "No relevant context found.";

  const prompt = `Context:\n${combinedContext}\n\nQuestion: ${question}\n\nAnswer in clear study-friendly language with short paragraphs and bullet points when helpful.`;

  const answer = await generateGeminiText({ system, prompt, temperature: 0.2 });

  return NextResponse.json({ answer, sources: chunks });
}
