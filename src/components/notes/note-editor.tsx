"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function NoteEditor({
  name = "content",
  defaultValue = "",
  onChange,
}: {
  name?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const previewText = useMemo(() => value, [value]);

  return (
    <div className="rounded-3xl bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--surface-2)] pb-3">
        <span className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Notes
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              mode === "edit"
                ? "bg-[color:var(--accent)] text-white"
                : "bg-[color:var(--surface-2)] text-[var(--muted)]"
            }`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              mode === "preview"
                ? "bg-[color:var(--accent)] text-white"
                : "bg-[color:var(--surface-2)] text-[var(--muted)]"
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {mode === "edit" ? (
        <textarea
          name={name}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            onChange?.(event.target.value);
          }}
          className="min-h-[260px] w-full resize-y whitespace-pre-wrap rounded-2xl border border-[color:var(--surface-2)] bg-white px-3 py-2 text-sm leading-7 text-[var(--ink)] outline-none"
          placeholder="Write your notes here..."
        />
      ) : (
        <div className="min-h-[260px] w-full rounded-2xl border border-[color:var(--surface-2)] bg-white px-3 py-2 text-sm leading-7 text-[var(--ink)]">
          <input type="hidden" name={name} value={value} />
          {previewText.trim().length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No notes yet.</p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {previewText}
            </ReactMarkdown>
          )}
        </div>
      )}
    </div>
  );
}
