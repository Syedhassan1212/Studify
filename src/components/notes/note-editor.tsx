"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const toolbarButtonClass =
  "rounded-full border border-[color:var(--surface-2)] px-3 py-1 text-xs font-semibold text-[var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]";

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
  const [mode, setMode] = useState<"edit" | "preview" | "split">("edit");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const previewText = useMemo(() => value, [value]);
  const wordCount = useMemo(() => {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [value]);

  const charCount = value.length;
  const showEditor = mode !== "preview";
  const showPreview = mode !== "edit";

  const commitValue = (nextValue: string, selection?: { start: number; end: number }) => {
    setValue(nextValue);
    onChange?.(nextValue);
    if (selection && textareaRef.current) {
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(selection.start, selection.end);
      });
    }
  };

  const getSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return null;
    return {
      start: textarea.selectionStart ?? 0,
      end: textarea.selectionEnd ?? 0,
    };
  };

  const insertSnippet = (snippet: string) => {
    const selection = getSelection();
    if (!selection) return;
    const { start, end } = selection;
    const nextValue = value.slice(0, start) + snippet + value.slice(end);
    const cursor = start + snippet.length;
    commitValue(nextValue, { start: cursor, end: cursor });
  };

  const wrapSelection = (before: string, after = before, placeholder = "text") => {
    const selection = getSelection();
    if (!selection) return;
    const { start, end } = selection;
    const selectedText = value.slice(start, end);
    const insertText = selectedText || placeholder;
    const nextValue =
      value.slice(0, start) + before + insertText + after + value.slice(end);
    const selectionStart = start + before.length;
    const selectionEnd = selectionStart + insertText.length;
    commitValue(nextValue, { start: selectionStart, end: selectionEnd });
  };

  const prefixLines = (prefix: string) => {
    const selection = getSelection();
    if (!selection) return;
    let { start, end } = selection;
    if (start === end) {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const lineEndIndex = value.indexOf("\n", start);
      const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
      const line = value.slice(lineStart, lineEnd);
      if (line.length === 0) {
        const nextValue = value.slice(0, start) + prefix + value.slice(end);
        const cursor = start + prefix.length;
        commitValue(nextValue, { start: cursor, end: cursor });
        return;
      }
      start = lineStart;
      end = lineEnd;
    }
    const block = value.slice(start, end);
    const updated = block
      .split("\n")
      .map((line) => (line.length ? `${prefix}${line}` : line))
      .join("\n");
    const nextValue = value.slice(0, start) + updated + value.slice(end);
    const cursor = start + updated.length;
    commitValue(nextValue, { start: cursor, end: cursor });
  };

  const insertLink = () => {
    const selection = getSelection();
    if (!selection) return;
    const { start, end } = selection;
    const selectedText = value.slice(start, end);
    const linkText = selectedText || "link text";
    const urlPlaceholder = "https://";
    const prefix = `[${linkText}](`;
    const nextValue =
      value.slice(0, start) + prefix + urlPlaceholder + ")" + value.slice(end);
    const urlStart = start + prefix.length;
    const urlEnd = urlStart + urlPlaceholder.length;
    commitValue(nextValue, { start: urlStart, end: urlEnd });
  };

  const insertCodeBlock = () => {
    const selection = getSelection();
    if (!selection) return;
    const { start, end } = selection;
    const selectedText = value.slice(start, end);
    const insertText = selectedText || "code here";
    const prefix = "```\n";
    const suffix = "\n```";
    const nextValue =
      value.slice(0, start) + prefix + insertText + suffix + value.slice(end);
    const selectionStart = start + prefix.length;
    const selectionEnd = selectionStart + insertText.length;
    commitValue(nextValue, { start: selectionStart, end: selectionEnd });
  };

  return (
    <div className="rounded-3xl bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--surface-2)] pb-3">
        <div>
          <span className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Notes
          </span>
          <p className="mt-1 text-[11px] text-[var(--muted)]">
            Markdown-friendly editor for fast study capture.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
            onClick={() => setMode("split")}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              mode === "split"
                ? "bg-[color:var(--accent)] text-white"
                : "bg-[color:var(--surface-2)] text-[var(--muted)]"
            }`}
          >
            Split
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

      {showEditor ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => wrapSelection("**")}
          >
            Bold
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => wrapSelection("*")}
          >
            Italic
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => wrapSelection("`")}
          >
            Inline code
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => prefixLines("## ")}
          >
            H2
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => prefixLines("- ")}
          >
            List
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => prefixLines("1. ")}
          >
            Numbered
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => prefixLines("> ")}
          >
            Quote
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => prefixLines("- [ ] ")}
          >
            Checklist
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            onClick={insertCodeBlock}
          >
            Code block
          </button>
          <button type="button" className={toolbarButtonClass} onClick={insertLink}>
            Link
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => insertSnippet("\n---\n")}
          >
            Divider
          </button>
        </div>
      ) : null}

      <div
        className={`mt-3 grid gap-3 ${mode === "split" ? "lg:grid-cols-2" : ""}`}
      >
        {showEditor ? (
          <textarea
            ref={textareaRef}
            name={name}
            value={value}
            onChange={(event) => {
              const nextValue = event.target.value;
              setValue(nextValue);
              onChange?.(nextValue);
            }}
            onKeyDown={(event) => {
              if (event.key === "Tab") {
                event.preventDefault();
                insertSnippet("  ");
              }
            }}
            className="min-h-[260px] w-full resize-y whitespace-pre-wrap rounded-2xl border border-[color:var(--surface-2)] bg-white px-3 py-2 text-sm leading-7 text-[var(--ink)] outline-none"
            placeholder="Write your notes here..."
          />
        ) : null}
        {showPreview ? (
          <div className="min-h-[260px] w-full rounded-2xl border border-[color:var(--surface-2)] bg-white px-3 py-2 text-sm leading-7 text-[var(--ink)]">
            {!showEditor ? <input type="hidden" name={name} value={value} /> : null}
            {previewText.trim().length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No notes yet.</p>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {previewText}
              </ReactMarkdown>
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--muted)]">
        <span>
          {wordCount} words | {charCount} chars
        </span>
        <span>
          Tip: use markdown like **bold**, *italic*, `code`, or lists.
        </span>
      </div>
    </div>
  );
}
