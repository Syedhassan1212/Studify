import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const topicId = String(body?.topicId ?? "");
  const flashcards = Array.isArray(body?.flashcards) ? body.flashcards : [];

  if (!topicId || flashcards.length === 0) {
    return NextResponse.json({ error: "topicId and flashcards are required." }, { status: 400 });
  }

  const supabase = supabaseServer();
  const rows = flashcards.map((card: { front: string; back: string }) => ({
    topic_id: topicId,
    front: card.front,
    back: card.back,
  }));

  const { error } = await supabase.from("flashcards").insert(rows);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ inserted: rows.length });
}
