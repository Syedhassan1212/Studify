"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { markStudyActivity } from "@/lib/streak";
import { scheduleNextReview } from "@/lib/spaced-repetition";
import { chunkText } from "@/lib/chunking";
import { embedGeminiText } from "@/lib/gemini";

async function upsertNoteChunks({
  supabase,
  topicId,
  noteId,
  text,
}: {
  supabase: Awaited<ReturnType<typeof supabaseServer>>;
  topicId: string;
  noteId: string;
  text: string;
}) {
  await supabase
    .from("study_chunks")
    .delete()
    .eq("source_type", "note")
    .eq("source_id", noteId);

  const chunks = chunkText(text);
  const rows: Array<Record<string, unknown>> = [];
  for (const chunk of chunks) {
    const embedding = await embedGeminiText(chunk);
    rows.push({
      topic_id: topicId,
      source_type: "note",
      source_id: noteId,
      content: chunk,
      embedding,
    });
  }

  if (rows.length > 0) {
    await supabase.from("study_chunks").insert(rows);
  }
}

export async function saveNote(_: unknown, formData: FormData) {
  const topicId = String(formData.get("topicId") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  const contentHtml = String(formData.get("contentHtml") ?? "").trim();
  const html = contentHtml || content;

  if (!topicId) {
    return { error: "Topic is required." };
  }

  const supabase = await supabaseServer();
  const { data: existing } = await supabase
    .from("notes")
    .select("id")
    .eq("topic_id", topicId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("notes")
      .update({ content: { text: content, html }, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) {
      return { error: error.message };
    }
    if (content) {
      await upsertNoteChunks({ supabase, topicId, noteId: existing.id, text: content });
    }
  } else {
    const { data: created, error } = await supabase
      .from("notes")
      .insert({ topic_id: topicId, content: { text: content, html } })
      .select("id")
      .single();
    if (error) {
      return { error: error.message };
    }
    if (created?.id && content) {
      await upsertNoteChunks({ supabase, topicId, noteId: created.id, text: content });
    }
  }

  await markStudyActivity();
  revalidatePath(`/courses/${formData.get("courseId")}/topics/${topicId}`);
  return { success: true };
}

export async function uploadMaterial(_: unknown, formData: FormData) {
  const topicId = String(formData.get("topicId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const file = formData.get("file");

  if (!topicId || !courseId) {
    return { error: "Topic and course are required." };
  }

  if (!(file instanceof File)) {
    return { error: "Please select a file to upload." };
  }

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const filePath = `${user.id}/${topicId}/${uuidv4()}-${safeName || "material"}`;
  const admin = supabaseAdmin();

  const { error: uploadError } = await admin.storage
    .from("materials")
    .upload(filePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data: publicUrl } = admin.storage.from("materials").getPublicUrl(filePath);

  const { data: material, error: insertError } = await admin
    .from("materials")
    .insert({
      topic_id: topicId,
      file_url: publicUrl.publicUrl,
      file_name: file.name,
    })
    .select("id")
    .single();

  if (insertError || !material) {
    return { error: insertError?.message ?? "Failed to save material." };
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

  await fetch(`${origin}/api/materials/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      materialId: material.id,
      topicId,
      fileUrl: publicUrl.publicUrl,
      fileName: file.name,
    }),
  });

  await markStudyActivity();
  revalidatePath(`/courses/${courseId}/topics/${topicId}`);
  return { success: true };
}

export async function reviewFlashcard(_: unknown, formData: FormData) {
  const flashcardId = String(formData.get("flashcardId") ?? "");
  const topicId = String(formData.get("topicId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const quality = Number(formData.get("quality") ?? 3);

  if (!flashcardId) {
    return { error: "Flashcard is required." };
  }

  const supabase = await supabaseServer();
  const { data: flashcard } = await supabase
    .from("flashcards")
    .select("id,review_interval,ease_factor")
    .eq("id", flashcardId)
    .single();

  if (!flashcard) {
    return { error: "Flashcard not found." };
  }

  const next = scheduleNextReview({
    interval: flashcard.review_interval ?? 0,
    easeFactor: Number(flashcard.ease_factor ?? 2.5),
    quality,
  });

  const { error } = await supabase
    .from("flashcards")
    .update({
      review_interval: next.interval,
      ease_factor: next.easeFactor,
      next_review: next.nextReview.toISOString().slice(0, 10),
    })
    .eq("id", flashcardId);

  if (error) {
    return { error: error.message };
  }

  await markStudyActivity();
  revalidatePath(`/courses/${courseId}/topics/${topicId}`);
  return { success: true };
}

export async function logQuizResult(_: unknown, formData: FormData) {
  const quizId = String(formData.get("quizId") ?? "");
  const score = Number(formData.get("score") ?? 0);
  const timeTaken = Number(formData.get("timeTaken") ?? 0);
  const topicId = String(formData.get("topicId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");

  if (!quizId) {
    return { error: "Quiz is required." };
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.from("quiz_results").insert({
    quiz_id: quizId,
    score,
    time_taken: timeTaken || null,
  });

  if (error) {
    return { error: error.message };
  }

  await markStudyActivity();
  revalidatePath(`/courses/${courseId}/topics/${topicId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function importLatestMaterialToNotes(formData: FormData) {
  const topicId = String(formData.get("topicId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");

  if (!topicId) {
    return { error: "Topic is required." };
  }

  const supabase = await supabaseServer();
  const { data: material } = await supabase
    .from("materials")
    .select("extracted_text")
    .eq("topic_id", topicId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!material?.extracted_text) {
    return { error: "No processed material text found yet." };
  }

  const { data: existing } = await supabase
    .from("notes")
    .select("id")
    .eq("topic_id", topicId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let noteId = existing?.id ?? "";
  if (existing?.id) {
    const { error } = await supabase
      .from("notes")
      .update(
        {
          content: { text: material.extracted_text, html: material.extracted_text },
          updated_at: new Date().toISOString(),
        },
      )
      .eq("id", existing.id);
    if (error) {
      return { error: error.message };
    }
  } else {
    const { data: created, error } = await supabase
      .from("notes")
      .insert({
        topic_id: topicId,
        content: { text: material.extracted_text, html: material.extracted_text },
      })
      .select("id")
      .single();
    if (error) {
      return { error: error.message };
    }
    noteId = created?.id ?? "";
  }

  if (noteId && material.extracted_text) {
    await upsertNoteChunks({
      supabase,
      topicId,
      noteId,
      text: material.extracted_text,
    });
  }

  await markStudyActivity();
  revalidatePath(`/courses/${courseId}/topics/${topicId}`);
  return { success: true };
}
