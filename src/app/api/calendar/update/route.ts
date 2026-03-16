import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const id = String(body?.id ?? "");
  const title = String(body?.title ?? "").trim();
  const courseId = body?.courseId ? String(body.courseId) : null;
  const eventType = String(body?.eventType ?? "study");
  const date = String(body?.date ?? "");
  const time = String(body?.time ?? "");
  const description = String(body?.description ?? "").trim();

  if (!id || !title || !date || !time) {
    return NextResponse.json(
      { error: "id, title, date, and time are required." },
      { status: 400 },
    );
  }

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const startTime = new Date(`${date}T${time}:00`);
  const { error } = await supabase
    .from("calendar_events")
    .update({
      title,
      course_id: courseId || null,
      event_type: eventType,
      description: description || null,
      start_time: startTime.toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
