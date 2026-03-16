"use client";

import { useState } from "react";

type Summary = {
  bulletSummary?: string[];
  keyConcepts?: string[];
  definitions?: { term: string; definition: string }[];
  examHighlights?: string[];
  raw?: string;
};

export default function NoteSummarizer({ topicId }: { topicId: string }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function summarize() {
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

      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesText }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to summarize notes.");
      }
      if (data?.raw) {
        try {
          const parsed = JSON.parse(data.raw);
          setSummary(parsed);
        } catch {
          setSummary({ raw: data.raw });
        }
      } else {
        setSummary(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to summarize notes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-3">
      <button
        type="button"
        className="rounded-full border border-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-[color:var(--accent)]"
        onClick={summarize}
        disabled={loading}
      >
        {loading ? "Summarizing..." : "Summarize"}
      </button>

      {error ? (
        <div className="rounded-2xl bg-[color:var(--surface-2)] px-4 py-2 text-xs text-[var(--muted)]">
          {error}
        </div>
      ) : null}

      {summary ? (
        <div className="rounded-2xl bg-white p-4 text-xs text-[var(--muted)]">
          {summary.raw ? (
            <p className="whitespace-pre-wrap">{summary.raw}</p>
          ) : (
            <div className="grid gap-3">
              {summary.bulletSummary?.length ? (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                    Summary
                  </p>
                  <ul className="mt-2 list-disc pl-4">
                    {summary.bulletSummary.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {summary.keyConcepts?.length ? (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                    Key Concepts
                  </p>
                  <ul className="mt-2 list-disc pl-4">
                    {summary.keyConcepts.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {summary.definitions?.length ? (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                    Definitions
                  </p>
                  <div className="mt-2 grid gap-2">
                    {summary.definitions.map((item) => (
                      <div key={item.term}>
                        <p className="font-semibold">{item.term}</p>
                        <p>{item.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {summary.examHighlights?.length ? (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                    Exam Highlights
                  </p>
                  <ul className="mt-2 list-disc pl-4">
                    {summary.examHighlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
