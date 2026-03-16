"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type QuizQuestion = {
  id?: string;
  type?: string;
  question: string;
  options?: string[];
  answer?: string;
  explanation?: string;
};

export default function QuizGenerator({
  topicId,
  topicTitle,
}: {
  topicId: string;
  topicTitle: string;
}) {
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [type, setType] = useState("mixed");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicTitle, count, difficulty, type }),
      });
      const data = await response.json();
      const items = data.questions ?? [];
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error("No quiz questions returned. Try again.");
      }
      setQuestions(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quiz.");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/quizzes/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, questions }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error ?? "Failed to save quiz.");
      }
      setQuestions([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save quiz.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Count
        </label>
        <input
          type="number"
          min={3}
          max={20}
          value={count}
          onChange={(event) => setCount(Number(event.target.value))}
          className="w-20 rounded-2xl border border-[color:var(--surface-2)] bg-white px-3 py-1 text-xs"
        />
        <select
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value)}
          className="rounded-2xl border border-[color:var(--surface-2)] bg-white px-3 py-1 text-xs"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="rounded-2xl border border-[color:var(--surface-2)] bg-white px-3 py-1 text-xs"
        >
          <option value="mcq">MCQ</option>
          <option value="short">Short answer</option>
          <option value="mixed">Mixed</option>
        </select>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-white"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
        {questions.length > 0 ? (
          <button
            type="button"
            onClick={save}
            disabled={loading}
            className="rounded-full border border-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-[color:var(--accent)]"
          >
            Save quiz
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-2xl bg-[color:var(--surface-2)] px-4 py-2 text-xs text-[var(--muted)]">
          {error}
        </div>
      ) : null}

      {questions.length > 0 ? (
        <div className="grid gap-2 text-sm">
          {questions.map((question, index) => (
            <div key={`${question.question}-${index}`} className="rounded-2xl bg-white p-3">
              <p className="font-semibold">
                {index + 1}. {question.question}
              </p>
              {question.options?.length ? (
                <div className="mt-2 grid gap-1 text-xs text-[var(--muted)]">
                  {question.options.map((option) => (
                    <span key={option}>{option}</span>
                  ))}
                </div>
              ) : null}
              {question.answer ? (
                <p className="mt-2 text-xs text-[var(--muted)]">Answer: {question.answer}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
