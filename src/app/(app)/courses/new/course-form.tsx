"use client";

import { useActionState } from "react";
import { createCourse } from "./actions";
 
const initialState = { error: "" };

export default function CourseForm() {
  const [state, action] = useActionState(createCourse, initialState);

  return (
    <form action={action} className="grid gap-4">
      <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
        Course name
        <input
          name="name"
          required
          className="rounded-2xl border border-[color:var(--surface-2)] bg-white px-4 py-2 text-sm"
          placeholder="Algorithms"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
        Description
        <textarea
          name="description"
          rows={3}
          className="rounded-2xl border border-[color:var(--surface-2)] bg-white px-4 py-2 text-sm"
          placeholder="What will you focus on in this course?"
        />
      </label>
      {state?.error ? (
        <div className="rounded-2xl bg-[color:var(--surface-2)] px-4 py-2 text-sm text-[var(--muted)]">
          {state.error}
        </div>
      ) : null}
      <button
        type="submit"
        className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white"
      >
        Create course
      </button>
    </form>
  );
}
