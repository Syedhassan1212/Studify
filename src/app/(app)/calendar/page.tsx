import CalendarView from "@/components/calendar/calendar-view";
import CalendarEventForm from "./calendar-event-form";
import { getCalendarEvents } from "@/lib/study-data";
import { supabaseServer } from "@/lib/supabase/server";

export default async function CalendarPage() {
  const events = await getCalendarEvents();
  const supabase = await supabaseServer();
  const { data: courses } = await supabase.from("courses").select("id,name");
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Calendar</p>
        <h2 className="text-3xl font-semibold">Plan, schedule, repeat.</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Keep every assignment, review session, and exam synchronized with your study rhythm.
        </p>
      </header>
      <div className="app-surface rounded-[32px] p-6">
        <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">
          New Event
        </p>
        <div className="mt-4">
          <CalendarEventForm courses={courses ?? []} />
        </div>
      </div>
      <CalendarView events={events} />
    </div>
  );
}
