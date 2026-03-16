"use client";

import { useActionState } from "react";
import { uploadMaterial } from "./actions";

const initialState = { error: "" };

export default function MaterialUploadForm({
  courseId,
  topicId,
}: {
  courseId: string;
  topicId: string;
}) {
  const [state, action] = useActionState(uploadMaterial, initialState);

  return (
    <form action={action} className="mt-3 grid gap-3">
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="topicId" value={topicId} />
      <input
        name="file"
        type="file"
        accept=".pdf,.txt"
        className="block w-full rounded-2xl border border-[color:var(--surface-2)] bg-white px-3 py-2 text-sm"
        required
      />
      {state?.error ? (
        <div className="rounded-2xl bg-[color:var(--surface-2)] px-4 py-2 text-sm text-[var(--muted)]">
          {state.error}
        </div>
      ) : null}
      <button
        type="submit"
        className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white"
      >
        Upload material
      </button>
    </form>
  );
}
