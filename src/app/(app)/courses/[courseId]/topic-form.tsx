"use client";

import { useActionState } from "react";
import { createTopic } from "./actions";

const initialState = { error: "" };

export default function TopicForm({ courseId }: { courseId: string }) {
  const [state, action] = useActionState(createTopic, initialState);

  return (
    <form action={action} className="mt-4 grid gap-3">
      <input type="hidden" name="courseId" value={courseId} />
      <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
        Topic title
        <input
          name="title"
          required
          className="rounded-2xl border border-[color:var(--surface-2)] bg-white px-4 py-2 text-sm"
          placeholder="Graph Theory"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
        Description
        <textarea
          name="description"
          rows={2}
          className="rounded-2xl border border-[color:var(--surface-2)] bg-white px-4 py-2 text-sm"
          placeholder="Optional description"
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
        Add topic
      </button>
    </form>
  );
}
