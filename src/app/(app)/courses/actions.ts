"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

export async function deleteCourse(formData: FormData) {
  const courseId = String(formData.get("courseId") ?? "");

  if (!courseId) {
    return;
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.from("courses").delete().eq("id", courseId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/courses");
  revalidatePath("/dashboard");
}
