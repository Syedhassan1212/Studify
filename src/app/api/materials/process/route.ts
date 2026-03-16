import { NextResponse } from "next/server";
import { chunkText } from "@/lib/chunking";
import { embedGeminiText } from "@/lib/gemini";
import { extractTextFromBuffer } from "@/lib/materials";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const materialId = String(body?.materialId ?? "");
  const topicId = String(body?.topicId ?? "");
  const fileUrl = String(body?.fileUrl ?? "");
  const fileName = String(body?.fileName ?? "");

  if (!materialId || !topicId || !fileUrl || !fileName) {
    return NextResponse.json(
      { error: "materialId, topicId, fileUrl, and fileName are required." },
      { status: 400 },
    );
  }

  const fileResponse = await fetch(fileUrl);
  if (!fileResponse.ok) {
    return NextResponse.json({ error: "Failed to fetch material." }, { status: 400 });
  }

  const buffer = Buffer.from(await fileResponse.arrayBuffer());
  const extractedText = await extractTextFromBuffer({ filename: fileName, buffer });
  const chunks = chunkText(extractedText);

  const supabase = supabaseAdmin();

  const rows = [] as Array<Record<string, unknown>>;
  for (const chunk of chunks) {
    const embedding = await embedGeminiText(chunk);
    rows.push({
      topic_id: topicId,
      source_type: "material",
      source_id: materialId,
      content: chunk,
      embedding,
    });
  }

  if (rows.length > 0) {
    const { error } = await supabase.from("study_chunks").insert(rows);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  await supabase.from("materials").update({ extracted_text: extractedText }).eq("id", materialId);

  // Keep notes in sync with the latest uploaded material so it is editable.
  const { data: existingNote } = await supabase
    .from("notes")
    .select("id")
    .eq("topic_id", topicId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let noteId = existingNote?.id ?? "";
  if (existingNote?.id) {
    await supabase
      .from("notes")
      .update({ content: { text: extractedText }, updated_at: new Date().toISOString() })
      .eq("id", existingNote.id);
  } else {
    const { data: createdNote } = await supabase
      .from("notes")
      .insert({ topic_id: topicId, content: { text: extractedText } })
      .select("id")
      .single();
    noteId = createdNote?.id ?? "";
  }

  if (noteId && extractedText) {
    await supabase
      .from("study_chunks")
      .delete()
      .eq("source_type", "note")
      .eq("source_id", noteId);

    const noteChunks = chunkText(extractedText);
    const noteRows: Array<Record<string, unknown>> = [];
    for (const chunk of noteChunks) {
      const embedding = await embedGeminiText(chunk);
      noteRows.push({
        topic_id: topicId,
        source_type: "note",
        source_id: noteId,
        content: chunk,
        embedding,
      });
    }
    if (noteRows.length > 0) {
      await supabase.from("study_chunks").insert(noteRows);
    }
  }

  return NextResponse.json({ chunks: rows.length });
}
