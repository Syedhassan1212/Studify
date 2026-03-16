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

  return NextResponse.json({ chunks: rows.length });
}
