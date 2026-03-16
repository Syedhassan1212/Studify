"use client";

import { useEffect, useRef, useState } from "react";
import { Bold, Code2, Highlighter, List } from "lucide-react";

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
    const selected = value.slice(start, end);
    const lines = (selected || value.slice(start)).split("\n");
    const prefixed = lines.map((line) => (line ? `${prefix}${line}` : line)).join("\n");
    const next =
      value.slice(0, start) + prefixed + value.slice(end);
    const nextStart = start;
    const nextEnd = start + prefixed.length;
    updateValue(next, nextStart, nextEnd);
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

  return (
    <div className="rounded-3xl bg-white p-4">
      <div className="flex flex-wrap items-center gap-2 border-b border-[color:var(--surface-2)] pb-3">
        <button
          type="button"
          onClick={() => wrapSelection("**")}
          className="rounded-xl bg-[color:var(--surface-2)] p-2 text-[color:var(--accent)]"
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => prefixLines("- ")}
          className="rounded-xl bg-[color:var(--surface-2)] p-2 text-[color:var(--accent)]"
          title="Bullet list"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => insertCodeBlock()}
          className="rounded-xl bg-[color:var(--surface-2)] p-2 text-[color:var(--accent)]"
          title="Code block"
        >
          <Code2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => wrapSelection("==")}
          className="rounded-xl bg-[color:var(--surface-2)] p-2 text-[color:var(--accent)]"
          title="Highlight"
        >
          <Highlighter size={16} />
        </button>
        <span className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Notes
        </span>
      </div>
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
    </div>
  );
}
