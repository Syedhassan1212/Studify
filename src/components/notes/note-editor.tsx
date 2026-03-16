"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <div className="rounded-3xl bg-white p-4">
      <div className="flex flex-wrap items-center gap-2 border-b border-[color:var(--surface-2)] pb-3">
        {[Bold, List, Code2, Highlighter].map((Icon, index) => (
          <button
            key={`tool-${index}`}
            type="button"
            className="rounded-xl bg-[color:var(--surface-2)] p-2 text-[color:var(--accent)]"
          >
            <Icon size={16} />
          </button>
        ))}
        <span className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Notes
        </span>
      </div>
      <textarea
        name={name}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          onChange?.(event.target.value);
        }}
        className="min-h-[240px] w-full resize-y whitespace-pre-wrap rounded-2xl border border-[color:var(--surface-2)] bg-white px-3 py-2 text-sm leading-7 text-[var(--ink)] outline-none"
        placeholder="Write your structured notes here..."
      />
    </div>
  );
}
