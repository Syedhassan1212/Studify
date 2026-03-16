"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { CalendarEventItem } from "@/lib/types";
import Pill from "@/components/ui/pill";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarView({ events }: { events: CalendarEventItem[] }) {
  const [view, setView] = useState<"month" | "week">("month");
  const today = new Date();

  const { days, rangeLabel } = useMemo(() => {
    if (view === "week") {
      const start = startOfWeek(today, { weekStartsOn: 1 });
      const end = endOfWeek(today, { weekStartsOn: 1 });
      return {
        days: eachDayOfInterval({ start, end }),
        rangeLabel: `${format(start, "MMM d")} - ${format(end, "MMM d")}`,
      };
    }

    const start = startOfWeek(startOfMonth(today), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(today), { weekStartsOn: 1 });

    return {
      days: eachDayOfInterval({ start, end }),
      rangeLabel: format(today, "MMMM yyyy"),
    };
  }, [view, today]);

  const eventsByDate = useMemo(() => {
    return events.reduce<Record<string, CalendarEventItem[]>>((acc, event) => {
      acc[event.date] = acc[event.date] ? [...acc[event.date], event] : [event];
      return acc;
    }, {});
  }, [events]);

  return (
    <div className="app-surface rounded-[32px] p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Calendar</p>
          <h3 className="text-2xl font-semibold">{rangeLabel}</h3>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView("month")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              view === "month"
                ? "bg-[color:var(--accent)] text-white"
                : "bg-[color:var(--surface-2)] text-[var(--muted)]"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setView("week")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              view === "week"
                ? "bg-[color:var(--accent)] text-white"
                : "bg-[color:var(--surface-2)] text-[var(--muted)]"
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2 text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
        {weekDays.map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate[dateKey] ?? [];
          const isToday = isSameDay(day, today);
          const inMonth = isSameMonth(day, today);

          return (
            <div
              key={dateKey}
              className={`min-h-[96px] rounded-2xl p-2 text-sm ${
                isToday
                  ? "border border-[color:var(--accent)] bg-white"
                  : inMonth
                    ? "bg-[color:var(--surface-2)]"
                    : "bg-[color:var(--surface-3)]/40 text-[var(--muted)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={isToday ? "font-semibold" : "text-xs"}>
                  {format(day, "d")}
                </span>
                {dayEvents.length > 0 ? (
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                    {dayEvents.length} events
                  </span>
                ) : null}
              </div>
              <div className="mt-2 flex flex-col gap-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <span
                    key={event.id}
                    className="rounded-full bg-white px-2 py-1 text-[11px] text-[var(--ink)]"
                  >
                    {event.title}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-3">
        <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">
          Upcoming Sessions
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {events.map((event) => (
            <div key={event.id} className="rounded-2xl bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{event.title}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {event.course ?? "No course"}  {event.date}  {event.time}
                  </p>
                </div>
                <Pill label={event.type} type={event.type} />
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">{event.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
