"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { markStudyActivity } from "@/lib/streak";

export async function createEvent(_: unknown, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const courseId = String(formData.get("courseId") ?? "");
  const eventType = String(formData.get("eventType") ?? "study");
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const description = String(formData.get("description") ?? "").trim();

  if (!title || !date || !time) {
    return { error: "Title, date, and time are required." };
  }

  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const startTime = new Date(`${date}T${time}:00`);

  const { error } = await supabase.from("calendar_events").insert({
    user_id: user.id,
    course_id: courseId || null,
    title,
    description: description || null,
    event_type: eventType,
    start_time: startTime.toISOString(),
  });

  if (error) {
    return { error: error.message };
  }

  await markStudyActivity();
  revalidatePath("/calendar");
  return { success: true };
}
