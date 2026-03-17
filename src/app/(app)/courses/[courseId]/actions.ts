"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { markStudyActivity } from "@/lib/streak";

export async function createTopic(_: unknown, formData: FormData) {
  const courseId = String(formData.get("courseId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!courseId || !title) {
    return { error: "Topic title is required." };
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.from("topics").insert({
    course_id: courseId,
    title,
    description: description || null,
  });

  if (error) {
    return { error: error.message };
  }

  await markStudyActivity();
  revalidatePath(`/courses/${courseId}`);
  return { success: true };
}

export async function deleteTopic(formData: FormData) {
  const courseId = String(formData.get("courseId") ?? "");
  const topicId = String(formData.get("topicId") ?? "");

  if (!courseId || !topicId) {
    return;
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.from("topics").delete().eq("id", topicId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/courses/${courseId}`);
}
