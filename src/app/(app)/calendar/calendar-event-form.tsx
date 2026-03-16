"use client";

import { useFormState } from "react-dom";
import { createEvent } from "./actions";

const initialState = { error: "" };

export default function CalendarEventForm({
  courses,
}: {
  courses: { id: string; name: string }[];
}) {
  const [state, action] = useFormState(createEvent, initialState);

  return (
    <form action={action} className="grid gap-3 md:grid-cols-2">
      <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
        Title
        <input
          name="title"
          required
          className="rounded-2xl border border-[color:var(--surface-2)] bg-white px-4 py-2 text-sm"
          placeholder="Quiz: SQL Joins"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
        Course
        <select
          name="courseId"
          className="rounded-2xl border border-[color:var(--surface-2)] bg-white px-4 py-2 text-sm"
        >
          <option value="">No course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
        Type
        <select
          name="eventType"
          className="rounded-2xl border border-[color:var(--surface-2)] bg-white px-4 py-2 text-sm"
          defaultValue="study"
        >
          <option value="assignment">Assignment</option>
          <option value="quiz">Quiz</option>
          <option value="exam">Exam</option>
          <option value="study">Study session</option>
          <option value="review">Review session</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
        Date
        <input
          name="date"
          type="date"
          required
          className="rounded-2xl border border-[color:var(--surface-2)] bg-white px-4 py-2 text-sm"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
        Time
        <input
          name="time"
          type="time"
          required
          className="rounded-2xl border border-[color:var(--surface-2)] bg-white px-4 py-2 text-sm"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-[var(--ink)] md:col-span-2">
        Description
        <textarea
          name="description"
          rows={2}
          className="rounded-2xl border border-[color:var(--surface-2)] bg-white px-4 py-2 text-sm"
          placeholder="Optional notes"
        />
      </label>
      {state?.error ? (
        <div className="rounded-2xl bg-[color:var(--surface-2)] px-4 py-2 text-sm text-[var(--muted)] md:col-span-2">
          {state.error}
        </div>
      ) : null}
      <button
        type="submit"
        className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white md:col-span-2 md:justify-self-start"
      >
        Add event
      </button>
    </form>
  );
}
