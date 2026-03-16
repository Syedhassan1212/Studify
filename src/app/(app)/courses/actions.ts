"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

export async function deleteCourse(_: unknown, formData: FormData) {
  const courseId = String(formData.get("courseId") ?? "");

  if (!courseId) {
    return { error: "Course is required." };
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.from("courses").delete().eq("id", courseId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/courses");
  revalidatePath("/dashboard");
  return { success: true };
}
