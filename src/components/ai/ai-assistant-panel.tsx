"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type SourceChunk = {
  id: string;
  content: string;
  similarity: number;
};

export default function AiAssistantPanel({ topicId }: { topicId: string }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<SourceChunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function ask(prompt: string) {
    if (!prompt.trim()) {
      setError("Type a question first.");
      return;
    }
    setLoading(true);
    setError("");
    setAnswer("");
    setSources([]);

    try {
      const response = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt, topicId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to get a response.");
      }

      setAnswer(data.answer ?? "");
      setSources(data.sources ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const decodedAnswer = useMemo(() => {
    if (!answer) return "";
    if (typeof document === "undefined") return answer;
    const textarea = document.createElement("textarea");
    textarea.innerHTML = answer;
    return textarea.value;
  }, [answer]);

  return (
    <div className="grid gap-3">
      <div className="rounded-2xl bg-white p-4 text-sm text-[var(--muted)]">
        Ask questions, get contextual answers from your notes and materials. The AI will cite
        relevant chunks.
      </div>
      <input
        className="w-full rounded-full border border-[color:var(--surface-2)] bg-white px-4 py-2 text-sm"
        placeholder="Ask about Dijkstra, BFS, or MST..."
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white"
          type="button"
          onClick={() => ask(question)}
          disabled={loading}
        >
          {loading ? "Asking..." : "Ask AI"}
        </button>
        <button
          className="rounded-full bg-[color:var(--accent-2)] px-4 py-2 text-sm font-semibold text-[var(--ink)]"
          type="button"
          onClick={() => ask(`Explain like I'm dumb: ${question}`)}
          disabled={loading}
        >
          Explain Like I'm Dumb
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl bg-[color:var(--surface-2)] px-4 py-2 text-sm text-[var(--muted)]">
          {error}
        </div>
      ) : null}

      {answer ? (
        <div className="rounded-2xl bg-white p-4 text-sm text-[var(--ink)]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{decodedAnswer}</ReactMarkdown>
        </div>
      ) : null}

      {sources.length > 0 ? (
        <div className="rounded-2xl bg-white p-4 text-xs text-[var(--muted)]">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Sources
          </p>
          <div className="mt-2 grid gap-2">
            {sources.map((source) => (
              <div key={source.id} className="rounded-2xl bg-[color:var(--surface-2)] p-3">
                <p className="text-[11px] text-[var(--muted)]">
                  Similarity: {source.similarity.toFixed(2)}
                </p>
                <p className="mt-1 text-xs">{source.content.slice(0, 180)}...</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
