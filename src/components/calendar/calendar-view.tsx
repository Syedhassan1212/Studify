"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

type CourseOption = { id: string; name: string };

type DraftEvent = {
  title: string;
  courseId: string;
  eventType: CalendarEventItem["type"];
  date: string;
  time: string;
  description: string;
};

export default function CalendarView({
  events,
  courses,
}: {
  events: CalendarEventItem[];
  courses: CourseOption[];
}) {
  const [view, setView] = useState<"month" | "week">("month");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftEvent | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const today = new Date();
  const router = useRouter();

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

  function startEdit(event: CalendarEventItem) {
    setEditingId(event.id);
    setDraft({
      title: event.title,
      courseId: event.courseId ?? "",
      eventType: event.type,
      date: event.date,
      time: event.timeValue,
      description: event.description ?? "",
    });
    setError("");
  }

  async function saveEdit() {
    if (!editingId || !draft) return;
    if (!draft.title.trim() || !draft.date || !draft.time) {
      setError("Title, date, and time are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/calendar/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          title: draft.title,
          courseId: draft.courseId || null,
          eventType: draft.eventType,
          date: draft.date,
          time: draft.time,
          description: draft.description,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to update event.");
      }
      setEditingId(null);
      setDraft(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEvent(eventId: string) {
    if (!confirm("Delete this event?")) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/calendar/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: eventId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to delete event.");
      }
      if (editingId === eventId) {
        setEditingId(null);
        setDraft(null);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event.");
    } finally {
      setSaving(false);
    }
  }

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
        {error ? (
          <div className="rounded-2xl bg-[color:var(--surface-2)] px-4 py-2 text-xs text-[var(--muted)]">
            {error}
          </div>
        ) : null}
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
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(event)}
                  className="rounded-full border border-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-[color:var(--accent)]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteEvent(event.id)}
                  disabled={saving}
                  className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600"
                >
                  Delete
                </button>
              </div>
              {editingId === event.id && draft ? (
                <div className="mt-4 grid gap-2 text-xs">
                  <label className="grid gap-1">
                    Title
                    <input
                      value={draft.title}
                      onChange={(event) =>
                        setDraft({ ...draft, title: event.target.value })
                      }
                      className="rounded-2xl border border-[color:var(--surface-2)] bg-white px-3 py-2 text-xs"
                    />
                  </label>
                  <label className="grid gap-1">
                    Course
                    <select
                      value={draft.courseId}
                      onChange={(event) =>
                        setDraft({ ...draft, courseId: event.target.value })
                      }
                      className="rounded-2xl border border-[color:var(--surface-2)] bg-white px-3 py-2 text-xs"
                    >
                      <option value="">No course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1">
                    Type
                    <select
                      value={draft.eventType}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          eventType: event.target.value as CalendarEventItem["type"],
                        })
                      }
                      className="rounded-2xl border border-[color:var(--surface-2)] bg-white px-3 py-2 text-xs"
                    >
                      <option value="assignment">Assignment</option>
                      <option value="quiz">Quiz</option>
                      <option value="exam">Exam</option>
                      <option value="study">Study session</option>
                      <option value="review">Review session</option>
                    </select>
                  </label>
                  <div className="grid gap-2 md:grid-cols-2">
                    <label className="grid gap-1">
                      Date
                      <input
                        type="date"
                        value={draft.date}
                        onChange={(event) =>
                          setDraft({ ...draft, date: event.target.value })
                        }
                        className="rounded-2xl border border-[color:var(--surface-2)] bg-white px-3 py-2 text-xs"
                      />
                    </label>
                    <label className="grid gap-1">
                      Time
                      <input
                        type="time"
                        value={draft.time}
                        onChange={(event) =>
                          setDraft({ ...draft, time: event.target.value })
                        }
                        className="rounded-2xl border border-[color:var(--surface-2)] bg-white px-3 py-2 text-xs"
                      />
                    </label>
                  </div>
                  <label className="grid gap-1">
                    Description
                    <textarea
                      rows={2}
                      value={draft.description}
                      onChange={(event) =>
                        setDraft({ ...draft, description: event.target.value })
                      }
                      className="rounded-2xl border border-[color:var(--surface-2)] bg-white px-3 py-2 text-xs"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={saveEdit}
                      disabled={saving}
                      className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-white"
                    >
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setDraft(null);
                        setError("");
                      }}
                      className="rounded-full bg-[color:var(--surface-2)] px-3 py-1 text-xs font-semibold text-[var(--muted)]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
