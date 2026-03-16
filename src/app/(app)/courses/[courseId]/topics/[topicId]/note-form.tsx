"use client";

import { useActionState } from "react";
import NoteEditor from "@/components/notes/note-editor";
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
      <NoteEditor name="content" defaultValue={initialContent} />
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
