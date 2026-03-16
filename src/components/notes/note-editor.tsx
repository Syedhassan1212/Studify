"use client";

import { useState } from "react";
import { Bold, Code2, Highlighter, List } from "lucide-react";

export default function NoteEditor({
  name = "content",
  defaultValue = "",
}: {
  name?: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);

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
      <div
        className="min-h-[240px] px-1 pt-3 text-sm leading-7 text-[var(--ink)]"
        contentEditable
        data-placeholder="Write your structured notes here..."
        suppressContentEditableWarning
        onInput={(event) => {
          const target = event.currentTarget;
          setValue(target.textContent ?? "");
        }}
      >
        {defaultValue}
      </div>
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
