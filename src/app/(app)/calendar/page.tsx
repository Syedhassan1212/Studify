import CalendarView from "@/components/calendar/calendar-view";

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Calendar</p>
        <h2 className="text-3xl font-semibold">Plan, schedule, repeat.</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Keep every assignment, review session, and exam synchronized with your study rhythm.
        </p>
      </header>
      <CalendarView />
    </div>
  );
}
