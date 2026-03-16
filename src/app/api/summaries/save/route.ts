import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const topicId = String(body?.topicId ?? "");
  const summary = body?.summary;

  if (!topicId || !summary) {
    return NextResponse.json({ error: "topicId and summary are required." }, { status: 400 });
  }

  const supabase = await supabaseServer();
  const { data: existing } = await supabase
    .from("notes")
    .select("id,content")
    .eq("topic_id", topicId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const nextContent = {
      ...(existing.content ?? {}),
      summary,
    };
    const { error } = await supabase
      .from("notes")
      .update({ content: nextContent, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ saved: true });
  }

  const { error } = await supabase.from("notes").insert({
    topic_id: topicId,
    content: { summary, text: "" },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ saved: true });
}
