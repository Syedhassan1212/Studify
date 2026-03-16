import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const topicId = String(body?.topicId ?? "");
  const questions = Array.isArray(body?.questions) ? body.questions : [];

  if (!topicId || questions.length === 0) {
    return NextResponse.json({ error: "topicId and questions are required." }, { status: 400 });
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.from("quizzes").insert({
    topic_id: topicId,
    questions,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ inserted: 1 });
}
