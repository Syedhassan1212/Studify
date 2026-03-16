import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const topicId = String(body?.topicId ?? "");

  if (!topicId) {
    return NextResponse.json({ error: "topicId is required." }, { status: 400 });
  }

  const supabase = await supabaseServer();
  const { data: note } = await supabase
    .from("notes")
    .select("content")
    .eq("topic_id", topicId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const text = typeof note?.content?.text === "string" ? note.content.text : "";
  return NextResponse.json({ text });
}
