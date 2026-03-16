"use client";

import { useActionState } from "react";
import { reviewFlashcard } from "./actions";

const initialState = { error: "" };

export default function FlashcardReview({
  courseId,
  topicId,
  flashcardId,
}: {
  courseId: string;
  topicId: string;
  flashcardId: string;
}) {
  const [state, action] = useActionState(reviewFlashcard, initialState);

  return (
    <form action={action} className="mt-2 flex flex-wrap items-center gap-2">
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="topicId" value={topicId} />
      <input type="hidden" name="flashcardId" value={flashcardId} />
      <label className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
        Recall
      </label>
      {[0, 1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="submit"
          name="quality"
          value={value}
          className="rounded-full border border-[color:var(--surface-2)] bg-white px-2 py-1 text-[10px] font-semibold text-[var(--muted)]"
        >
          {value}
        </button>
      ))}
      {state?.error ? (
        <span className="text-[10px] text-[var(--muted)]">{state.error}</span>
      ) : null}
    </form>
  );
}
