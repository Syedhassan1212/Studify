"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { cn } from "@/lib/utils";

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, "").trim();
const countWords = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
};

const buttonBase =
  "rounded-full border border-[color:var(--surface-2)] px-3 py-1 text-xs font-semibold text-[var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]";
const buttonActive = "border-[color:var(--accent)] bg-[color:var(--accent)] text-white";
const buttonDisabled = "cursor-not-allowed opacity-40";

export default function NoteEditor({
  name = "content",
  htmlName = "contentHtml",
  defaultValue = "",
  onChange,
}: {
  name?: string;
  htmlName?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  const [wordCount, setWordCount] = useState(() => countWords(stripHtml(defaultValue)));
  const textInputRef = useRef<HTMLInputElement | null>(null);
  const htmlInputRef = useRef<HTMLInputElement | null>(null);
  const lastInitialRef = useRef(defaultValue);
  const wordCountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncOutputs = useCallback(
    (editorInstance: { getText: () => string; getHTML: () => string }) => {
      const nextText = editorInstance.getText();
      const nextHtml = editorInstance.getHTML();

      if (textInputRef.current) {
        textInputRef.current.value = nextText;
      }
      if (htmlInputRef.current) {
        htmlInputRef.current.value = nextHtml;
      }

      if (wordCountTimerRef.current) {
        clearTimeout(wordCountTimerRef.current);
      }
      wordCountTimerRef.current = setTimeout(() => {
        setWordCount(countWords(nextText));
      }, 120);

      onChange?.(nextText);
    },
    [onChange],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: "Write your notes here...",
        emptyNodeClass: "is-editor-empty",
      }),
    ],
    content: defaultValue || "",
    editorProps: {
      attributes: {
        class:
          "tiptap-editor min-h-[260px] rounded-2xl border border-[color:var(--surface-2)] bg-white px-3 py-3 text-sm leading-7 text-[var(--ink)] outline-none",
      },
    },
    onCreate: ({ editor }) => {
      syncOutputs(editor);
    },
    onUpdate: ({ editor }) => {
      syncOutputs(editor);
    },
  });

  useEffect(() => {
    if (!editor || defaultValue === lastInitialRef.current) return;
    editor.commands.setContent(defaultValue || "", false);
    lastInitialRef.current = defaultValue;
    syncOutputs(editor);
  }, [defaultValue, editor, syncOutputs]);

  useEffect(() => {
    return () => {
      if (wordCountTimerRef.current) {
        clearTimeout(wordCountTimerRef.current);
      }
    };
  }, []);

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter a URL", previousUrl || "https://");
    if (url === null) return;
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const buttonClass = (active?: boolean, disabled?: boolean) =>
    cn(buttonBase, active && buttonActive, disabled && buttonDisabled);

  return (
    <div className="rounded-3xl bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--surface-2)] pb-3">
        <div>
          <span className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Notes
          </span>
          <p className="mt-1 text-[11px] text-[var(--muted)]">
            Rich text editor with markdown-friendly shortcuts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-[var(--muted)]">
            {wordCount} words
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={buttonClass(editor?.isActive("bold"), !editor)}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor}
        >
          Bold
        </button>
        <button
          type="button"
          className={buttonClass(editor?.isActive("italic"), !editor)}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor}
        >
          Italic
        </button>
        <button
          type="button"
          className={buttonClass(editor?.isActive("strike"), !editor)}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          disabled={!editor}
        >
          Strike
        </button>
        <button
          type="button"
          className={buttonClass(editor?.isActive("heading", { level: 2 }), !editor)}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={!editor}
        >
          H2
        </button>
        <button
          type="button"
          className={buttonClass(editor?.isActive("heading", { level: 3 }), !editor)}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={!editor}
        >
          H3
        </button>
        <button
          type="button"
          className={buttonClass(editor?.isActive("bulletList"), !editor)}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          disabled={!editor}
        >
          List
        </button>
        <button
          type="button"
          className={buttonClass(editor?.isActive("orderedList"), !editor)}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          disabled={!editor}
        >
          Numbered
        </button>
        <button
          type="button"
          className={buttonClass(editor?.isActive("taskList"), !editor)}
          onClick={() => editor?.chain().focus().toggleTaskList().run()}
          disabled={!editor}
        >
          Checklist
        </button>
        <button
          type="button"
          className={buttonClass(editor?.isActive("blockquote"), !editor)}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          disabled={!editor}
        >
          Quote
        </button>
        <button
          type="button"
          className={buttonClass(editor?.isActive("code"), !editor)}
          onClick={() => editor?.chain().focus().toggleCode().run()}
          disabled={!editor}
        >
          Inline Code
        </button>
        <button
          type="button"
          className={buttonClass(editor?.isActive("codeBlock"), !editor)}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          disabled={!editor}
        >
          Code Block
        </button>
        <button
          type="button"
          className={buttonClass(editor?.isActive("link"), !editor)}
          onClick={setLink}
          disabled={!editor}
        >
          Link
        </button>
        <button
          type="button"
          className={buttonClass(false, !editor)}
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          disabled={!editor}
        >
          Divider
        </button>
        <button
          type="button"
          className={buttonClass(false, !editor || !editor?.can().undo())}
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor || !editor?.can().undo()}
        >
          Undo
        </button>
        <button
          type="button"
          className={buttonClass(false, !editor || !editor?.can().redo())}
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor || !editor?.can().redo()}
        >
          Redo
        </button>
      </div>

      <div className="mt-3">
        <EditorContent editor={editor} />
      </div>

      <input ref={textInputRef} type="hidden" name={name} defaultValue={stripHtml(defaultValue)} />
      <input ref={htmlInputRef} type="hidden" name={htmlName} defaultValue={defaultValue} />

      <div className="mt-3 text-[11px] text-[var(--muted)]">
        Tip: use markdown-style shortcuts like **bold** or *italic* while typing.
      </div>
    </div>
  );
}
