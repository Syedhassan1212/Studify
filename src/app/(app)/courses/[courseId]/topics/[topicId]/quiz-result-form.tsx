"use client";

import { useFormState } from "react-dom";
import { logQuizResult } from "./actions";

const initialState = { error: "" };

export default function QuizResultForm({
  courseId,
  topicId,
  quizzes,
}: {
  courseId: string;
  topicId: string;
  quizzes: { id: string }[];
}) {
  const [state, action] = useFormState(logQuizResult, initialState);

  if (quizzes.length === 0) {
    return null;
  }

  return (
    <form action={action} className="mt-3 grid gap-2">
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="topicId" value={topicId} />
      <label className="grid gap-1 text-xs text-[var(--muted)]">
        Quiz
        <select
          name="quizId"
          className="rounded-2xl border border-[color:var(--surface-2)] bg-white px-3 py-2 text-xs"
        >
          {quizzes.map((quiz, index) => (
            <option key={quiz.id} value={quiz.id}>
              Quiz {index + 1}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-xs text-[var(--muted)]">
        Score (0-100)
        <input
          name="score"
          type="number"
          min={0}
          max={100}
          className="rounded-2xl border border-[color:var(--surface-2)] bg-white px-3 py-2 text-xs"
        />
      </label>
      <label className="grid gap-1 text-xs text-[var(--muted)]">
        Time taken (seconds)
        <input
          name="timeTaken"
          type="number"
          min={0}
          className="rounded-2xl border border-[color:var(--surface-2)] bg-white px-3 py-2 text-xs"
        />
      </label>
      {state?.error ? (
        <div className="rounded-2xl bg-[color:var(--surface-2)] px-3 py-2 text-[11px] text-[var(--muted)]">
          {state.error}
        </div>
      ) : null}
      <button
        type="submit"
        className="rounded-full border border-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-[color:var(--accent)]"
      >
        Log quiz result
      </button>
    </form>
  );
}
