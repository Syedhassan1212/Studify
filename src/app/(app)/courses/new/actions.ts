"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { markStudyActivity } from "@/lib/streak";

export async function createCourse(_: unknown, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    return { error: "Course name is required." };
  }

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { error } = await supabase.from("courses").insert({
    name,
    description: description || null,
    user_id: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  await markStudyActivity();
  redirect("/courses");
}
