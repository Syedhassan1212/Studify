"use client";

import { useActionState } from "react";
import { saveNote } from "./actions";

const initialState = { error: "" };

export default function NoteForm({
  courseId,
  topicId,
  initialContent,
}: {
  courseId: string;
  topicId: string;
  initialContent: string;
}) {
  const [state, action] = useActionState(saveNote, initialState);

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="topicId" value={topicId} />
      <div className="rounded-3xl bg-white p-4">
        <span className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Notes
        </span>
        <p className="mt-1 text-[11px] text-[var(--muted)]">
          Write your notes here. Markdown is supported.
        </p>
        <textarea
          name="content"
          defaultValue={initialContent}
          className="mt-3 min-h-[260px] w-full resize-y whitespace-pre-wrap rounded-2xl border border-[color:var(--surface-2)] bg-white px-3 py-2 text-sm leading-7 text-[var(--ink)] outline-none"
          placeholder="Write your notes here..."
        />
      </div>
      {state?.error ? (
        <div className="rounded-2xl bg-[color:var(--surface-2)] px-4 py-2 text-sm text-[var(--muted)]">
          {state.error}
        </div>
      ) : null}
      <button
        type="submit"
        className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white"
      >
        Save notes
      </button>
    </form>
  );
}
