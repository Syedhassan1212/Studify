"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Flashcard = {
  front: string;
  back: string;
};

export default function FlashcardGenerator({
  topicId,
}: {
  topicId: string;
}) {
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();

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
      if (!notesText.trim()) {
        throw new Error("No notes found yet. Save notes first.");
      }

      const response = await fetch("/api/ai/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesText, count }),
      });
      const data = await response.json();
      const cards = data.flashcards ?? [];
      if (!Array.isArray(cards) || cards.length === 0) {
        throw new Error("No flashcards returned. Add notes and try again.");
      }
      setFlashcards(cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate flashcards.");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/flashcards/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, flashcards }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error ?? "Failed to save flashcards.");
      }
      setFlashcards([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save flashcards.");
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
          max={30}
          value={count}
          onChange={(event) => setCount(Number(event.target.value))}
          className="w-20 rounded-2xl border border-[color:var(--surface-2)] bg-white px-3 py-1 text-xs"
        />
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-white"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
        {flashcards.length > 0 ? (
          <button
            type="button"
            onClick={save}
            disabled={loading}
            className="rounded-full border border-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-[color:var(--accent)]"
          >
            Save to topic
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-2xl bg-[color:var(--surface-2)] px-4 py-2 text-xs text-[var(--muted)]">
          {error}
        </div>
      ) : null}

      {flashcards.length > 0 ? (
        <div className="grid gap-2 text-sm">
          {flashcards.map((card, index) => (
            <div key={`${card.front}-${index}`} className="rounded-2xl bg-white p-3">
              <p className="font-semibold">{card.front}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{card.back}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
