import { format, isSameDay, subDays } from "date-fns";
import { supabaseServer } from "@/lib/supabase/server";

export async function markStudyActivity() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const today = new Date();
  const todayString = format(today, "yyyy-MM-dd");

  const { data: streak } = await supabase
    .from("study_streak")
    .select("current_streak,longest_streak,last_study_date")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!streak) {
    await supabase.from("study_streak").insert({
      user_id: user.id,
      current_streak: 1,
      longest_streak: 1,
      last_study_date: todayString,
    });
    return;
  }

  if (streak.last_study_date) {
    const lastDate = new Date(streak.last_study_date);
    if (isSameDay(lastDate, today)) {
      return;
    }
    const yesterday = subDays(today, 1);
    const nextCurrent = isSameDay(lastDate, yesterday) ? streak.current_streak + 1 : 1;
    const nextLongest = Math.max(streak.longest_streak, nextCurrent);

    await supabase
      .from("study_streak")
      .update({
        current_streak: nextCurrent,
        longest_streak: nextLongest,
        last_study_date: todayString,
      })
      .eq("user_id", user.id);
  } else {
    await supabase
      .from("study_streak")
      .update({
        current_streak: 1,
        longest_streak: Math.max(streak.longest_streak, 1),
        last_study_date: todayString,
      })
      .eq("user_id", user.id);
  }
}
