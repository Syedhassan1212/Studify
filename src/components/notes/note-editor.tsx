"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bold, Code2, Highlighter, List } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  function updateValue(nextValue: string, selectionStart?: number, selectionEnd?: number) {
    setValue(nextValue);
    onChange?.(nextValue);
    if (selectionStart != null && selectionEnd != null) {
      requestAnimationFrame(() => {
        if (!textareaRef.current) return;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(selectionStart, selectionEnd);
      });
    }
  }

  function wrapSelection(before: string, after = before) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = value.slice(start, end);
    const next =
      value.slice(0, start) + before + selected + after + value.slice(end);
    const nextStart = start + before.length;
    const nextEnd = end + before.length;
    updateValue(next, nextStart, nextEnd);
  }

  function prefixLines(prefix: string) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    if (start === end) {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const nextBreak = value.indexOf("\n", start);
      const lineEnd = nextBreak === -1 ? value.length : nextBreak;
      const line = value.slice(lineStart, lineEnd);
      const prefixedLine = line ? `${prefix}${line}` : prefix.trimEnd();
      const next =
        value.slice(0, lineStart) + prefixedLine + value.slice(lineEnd);
      const nextStart = lineStart + prefix.length;
      const nextEnd = lineStart + prefixedLine.length;
      updateValue(next, nextStart, nextEnd);
      return;
    }

    const selected = value.slice(start, end);
    const lines = selected.split("\n");
    const prefixed = lines
      .map((line) => (line ? `${prefix}${line}` : line))
      .join("\n");
    const next = value.slice(0, start) + prefixed + value.slice(end);
    updateValue(next, start, start + prefixed.length);
  }

  function insertCodeBlock() {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = value.slice(start, end);
    const block = `\n\`\`\`\n${selected || "code"}\n\`\`\`\n`;
    const next = value.slice(0, start) + block + value.slice(end);
    const nextStart = start + 4;
    const nextEnd = start + block.length - 5;
    updateValue(next, nextStart, nextEnd);
  }

  function cleanFormatting() {
    const next = value
      .replace(/```+/g, "")
      .replace(/==+/g, "")
      .replace(/<\/?mark>/g, "");
    updateValue(next.trim());
  }

  const previewText = useMemo(() => value, [value]);

  function handleToolMouseDown(action: () => void) {
    return (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      action();
    };
  }

  return (
    <div className="rounded-3xl bg-white p-4">
      <div className="flex flex-wrap items-center gap-2 border-b border-[color:var(--surface-2)] pb-3">
        <button
          type="button"
          onMouseDown={handleToolMouseDown(() => wrapSelection("**"))}
          className="rounded-xl bg-[color:var(--surface-2)] p-2 text-[color:var(--accent)]"
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onMouseDown={handleToolMouseDown(() => prefixLines("- "))}
          className="rounded-xl bg-[color:var(--surface-2)] p-2 text-[color:var(--accent)]"
          title="Bullet list"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onMouseDown={handleToolMouseDown(() => insertCodeBlock())}
          className="rounded-xl bg-[color:var(--surface-2)] p-2 text-[color:var(--accent)]"
          title="Code block"
        >
          <Code2 size={16} />
        </button>
        <button
          type="button"
          onMouseDown={handleToolMouseDown(() => wrapSelection("<mark>", "</mark>"))}
          className="rounded-xl bg-[color:var(--surface-2)] p-2 text-[color:var(--accent)]"
          title="Highlight"
        >
          <Highlighter size={16} />
        </button>
        <button
          type="button"
          onClick={cleanFormatting}
          className="rounded-xl bg-[color:var(--surface-2)] px-3 py-2 text-xs font-semibold text-[color:var(--accent)]"
        >
          Clean
        </button>
        <span className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Notes
        </span>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              mode === "edit"
                ? "bg-[color:var(--accent)] text-white"
                : "bg-[color:var(--surface-2)] text-[var(--muted)]"
            }`}
          >
            Edit
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
          ref={textareaRef}
          name={name}
          value={value}
          onChange={(event) => {
            updateValue(event.target.value);
          }}
          className="min-h-[240px] w-full resize-y whitespace-pre-wrap rounded-2xl border border-[color:var(--surface-2)] bg-white px-3 py-2 text-sm leading-7 text-[var(--ink)] outline-none"
          placeholder="Write your structured notes here..."
        />
      ) : (
        <div className="min-h-[240px] w-full rounded-2xl border border-[color:var(--surface-2)] bg-white px-3 py-2 text-sm leading-7 text-[var(--ink)]">
          <input type="hidden" name={name} value={value} />
          <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
            Preview mode. Click Edit to change notes.
          </p>
          {previewText.trim().length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No notes yet.</p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {previewText}
            </ReactMarkdown>
          )}
        </div>
      )}
    </div>
  );
}
