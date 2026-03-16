"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type QuizQuestion = {
  id?: string;
  type?: string;
  question: string;
  options?: string[];
  answer?: string;
  explanation?: string;
};

function normalizeText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value == null) return "";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function normalizeOptions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          if ("text" in item && typeof (item as { text: unknown }).text === "string") {
            return (item as { text: string }).text;
          }
          if ("label" in item && typeof (item as { label: unknown }).label === "string") {
            return (item as { label: string }).label;
          }
          return normalizeText(item);
        }
        return normalizeText(item);
      })
      .filter((item) => item.trim().length > 0);
  }
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map((item) => normalizeText(item))
      .filter((item) => item.trim().length > 0);
  }
  return [];
}

function normalizeQuestions(raw: unknown): QuizQuestion[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const question = normalizeText((item as QuizQuestion).question ?? (item as any)?.prompt);
    const options = normalizeOptions((item as QuizQuestion).options ?? (item as any)?.choices);
    const answer = normalizeText((item as QuizQuestion).answer ?? (item as any)?.correct);
    const explanation = normalizeText((item as QuizQuestion).explanation);
    return {
      id: (item as QuizQuestion).id,
      type: (item as QuizQuestion).type,
      question,
      options: options.length > 0 ? options : undefined,
      answer: answer || undefined,
      explanation: explanation || undefined,
    };
  });
}

export default function QuizGenerator({
  topicId,
  topicTitle,
  savedQuizzes = [],
}: {
  topicId: string;
  topicTitle: string;
  savedQuizzes?: { id: string; questions: unknown[]; createdAt?: string | null }[];
}) {
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [type, setType] = useState("mixed");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [revealedSaved, setRevealedSaved] = useState<Record<string, boolean>>({});
  const [openSaved, setOpenSaved] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const normalizedSaved = useMemo(() => {
    return savedQuizzes.map((quiz) => ({
      id: quiz.id,
      createdAt: quiz.createdAt ?? null,
      questions: normalizeQuestions(quiz.questions ?? []),
    }));
  }, [savedQuizzes]);

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const notesResponse = await fetch("/api/notes/latest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId }),
      });
      const notesData = await notesResponse.json();
      const notesText = String(notesData?.text ?? "");

      const response = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicTitle,
          notes: notesText,
          count,
          difficulty,
          type,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to generate quiz.");
      }
      let items = data.questions ?? [];
      if ((!Array.isArray(items) || items.length === 0) && data.raw) {
        try {
          const parsed = JSON.parse(data.raw);
          items = parsed.questions ?? [];
        } catch {
          items = [];
        }
      }
      const normalized = normalizeQuestions(items);
      if (normalized.length === 0) {
        throw new Error("No quiz questions returned. Try again.");
      }
      setQuestions(normalized);

      const saveResponse = await fetch("/api/quizzes/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, questions: normalized }),
      });
      if (!saveResponse.ok) {
        const saveData = await saveResponse.json();
        throw new Error(saveData?.error ?? "Failed to save quiz.");
      }
      router.refresh();
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
            Save again
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
          {questions.map((question, index) => {
            const revealKey = `generated-${index}`;
            const isRevealed = revealed[revealKey];
            return (
              <div key={`${question.question}-${index}`} className="rounded-2xl bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">
                    {index + 1}. {question.question}
                  </p>
                  {question.type ? (
                    <span className="rounded-full bg-[color:var(--surface-2)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                      {question.type}
                    </span>
                  ) : null}
                </div>
                {question.options?.length ? (
                  <div className="mt-2 grid gap-1 text-xs text-[var(--muted)]">
                    {question.options.map((option, optionIndex) => (
                      <span key={`${option}-${optionIndex}`}>{option}</span>
                    ))}
                  </div>
                ) : null}
                {question.answer ? (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setRevealed((prev) => ({
                          ...prev,
                          [revealKey]: !prev[revealKey],
                        }))
                      }
                      className="rounded-full bg-[color:var(--surface-2)] px-3 py-1 text-xs font-semibold text-[var(--accent)]"
                    >
                      {isRevealed ? "Hide answer" : "Show answer"}
                    </button>
                    {isRevealed ? (
                      <p className="mt-2 text-xs text-[var(--muted)]">
                        Answer: {question.answer}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="mt-4 grid gap-2 text-sm">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Past Quizzes
        </p>
        {normalizedSaved.length === 0 ? (
          <div className="rounded-2xl bg-white p-3 text-xs text-[var(--muted)]">
            No quizzes yet.
          </div>
        ) : (
          normalizedSaved.map((quiz, index) => {
            const isOpen = openSaved === quiz.id;
            return (
              <div key={quiz.id} className="rounded-2xl bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">Quiz {index + 1}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {quiz.questions.length} questions
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenSaved(isOpen ? null : quiz.id)}
                    className="rounded-full border border-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-[color:var(--accent)]"
                  >
                    {isOpen ? "Hide" : "View"}
                  </button>
                </div>
                {isOpen ? (
                  <div className="mt-3 grid gap-2">
                    {quiz.questions.map((question, questionIndex) => {
                      const savedKey = `${quiz.id}-${questionIndex}`;
                      const isAnswerVisible = revealedSaved[savedKey];
                      return (
                        <div
                          key={savedKey}
                          className="rounded-2xl bg-[color:var(--surface-2)] px-3 py-2"
                        >
                          <p className="text-xs font-semibold">
                            {questionIndex + 1}. {question.question}
                          </p>
                          {question.options?.length ? (
                            <div className="mt-2 grid gap-1 text-[11px] text-[var(--muted)]">
                              {question.options.map((option, optionIndex) => (
                                <span key={`${savedKey}-${optionIndex}`}>{option}</span>
                              ))}
                            </div>
                          ) : null}
                          {question.answer ? (
                            <div className="mt-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setRevealedSaved((prev) => ({
                                    ...prev,
                                    [savedKey]: !prev[savedKey],
                                  }))
                                }
                                className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[color:var(--accent)]"
                              >
                                {isAnswerVisible ? "Hide answer" : "Show answer"}
                              </button>
                              {isAnswerVisible ? (
                                <p className="mt-2 text-[11px] text-[var(--muted)]">
                                  Answer: {question.answer}
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
