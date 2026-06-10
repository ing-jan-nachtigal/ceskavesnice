"use client";

import {
  contributionTextToEditorHtml,
  plainTextToContributionHtml,
  sanitizeContributionText,
} from "@/lib/sanitize";
import { useMemo, useRef, useState, type ClipboardEvent } from "react";

type RichTextEditorProps = {
  defaultValue?: string;
  label?: string;
  name?: string;
  placeholder?: string;
};

type FormatAction = "bold" | "heading" | "list";

export function RichTextEditor({
  defaultValue = "",
  label = "Text příspěvku",
  name = "text_prispevku",
  placeholder = "Napište vzpomínku, popis fotografie, historickou zajímavost nebo opravu záznamu.",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const initialHtml = useMemo(() => contributionTextToEditorHtml(defaultValue), [defaultValue]);
  const [html, setHtml] = useState(initialHtml);

  function syncFromEditor() {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    const sanitized = sanitizeContributionText(editor.innerHTML);
    setHtml(sanitized);
  }

  function replaceEditorHtml(nextHtml: string) {
    const editor = editorRef.current;
    const sanitized = sanitizeContributionText(nextHtml);

    if (editor) {
      editor.innerHTML = sanitized;
      editor.focus();
    }

    setHtml(sanitized);
  }

  function applyFormat(action: FormatAction) {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();

    if (action === "bold") {
      document.execCommand("bold");
    }

    if (action === "heading") {
      document.execCommand("formatBlock", false, "h2");
    }

    if (action === "list") {
      document.execCommand("insertUnorderedList");
    }

    syncFromEditor();
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    const safeHtml = plainTextToContributionHtml(text);

    document.execCommand("insertHTML", false, safeHtml);
    syncFromEditor();
  }

  return (
    <div className="grid gap-2 text-sm font-medium text-[#334235]">
      <label htmlFor={`${name}-editor`}>
        {label} <span className="required-star">*</span>
      </label>
      <div className="flex flex-wrap gap-2 rounded-t-2xl border border-emerald-950/14 border-b-0 bg-white/72 px-3 py-2">
        <button
          className="rounded-full border border-emerald-950/14 bg-[#f8faf4] px-3 py-1.5 text-xs font-semibold text-[#17331f] transition hover:bg-white"
          onClick={() => applyFormat("heading")}
          type="button"
        >
          Nadpis
        </button>
        <button
          className="rounded-full border border-emerald-950/14 bg-[#f8faf4] px-3 py-1.5 text-xs font-semibold text-[#17331f] transition hover:bg-white"
          onClick={() => applyFormat("bold")}
          type="button"
        >
          Tučně
        </button>
        <button
          className="rounded-full border border-emerald-950/14 bg-[#f8faf4] px-3 py-1.5 text-xs font-semibold text-[#17331f] transition hover:bg-white"
          onClick={() => applyFormat("list")}
          type="button"
        >
          Odrážky
        </button>
      </div>
      <div
        ref={editorRef}
        id={`${name}-editor`}
        role="textbox"
        aria-multiline="true"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onBlur={syncFromEditor}
        onInput={syncFromEditor}
        onPaste={handlePaste}
        className="rich-text-editor min-h-56 rounded-b-2xl border border-emerald-950/14 bg-[#f8faf4] px-4 py-3 text-base leading-8 text-[#435143] outline-none transition focus:border-emerald-800/45 focus:bg-white"
        dangerouslySetInnerHTML={{ __html: initialHtml }}
      />
      <input type="hidden" name={name} value={html} />
      <p className="text-xs leading-6 text-[#667062]">
        Editor povoluje jen nadpis, tučný text a odrážky. Vložený text ze schránky
        se očistí od cizích stylů a nebezpečného obsahu.
      </p>
      <button
        type="button"
        onClick={() => replaceEditorHtml("")}
        className="w-fit text-xs font-semibold uppercase tracking-[0.16em] text-[#667062] transition hover:text-[#17331f]"
      >
        Vyčistit text
      </button>
    </div>
  );
}
