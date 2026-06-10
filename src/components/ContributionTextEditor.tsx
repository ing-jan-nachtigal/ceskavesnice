"use client";

import { FormattedContributionText } from "@/components/FormattedContributionText";
import { useRef, useState } from "react";

type ContributionTextEditorProps = {
  defaultValue?: string;
  label?: string;
  placeholder?: string;
};

type FormatAction = "bold" | "heading" | "list";

export function ContributionTextEditor({
  defaultValue = "",
  label = "Text příspěvku",
  placeholder = "Napište vzpomínku, popis fotografie, historickou zajímavost nebo opravu záznamu.",
}: ContributionTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(defaultValue);

  function applyFormat(action: FormatAction) {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const selected = value.slice(start, end);
    const fallbackText = action === "heading" ? "Nadpis" : action === "list" ? "položka" : "tučný text";
    const selectedOrFallback = selected || fallbackText;
    let replacement = selectedOrFallback;

    if (action === "heading") {
      replacement = selectedOrFallback
        .split("\n")
        .map((line) => (line.trim() ? `## ${line.replace(/^#{1,6}\s*/, "")}` : line))
        .join("\n");
    }

    if (action === "bold") {
      replacement = `**${selectedOrFallback.replace(/^\*\*|\*\*$/g, "")}**`;
    }

    if (action === "list") {
      replacement = selectedOrFallback
        .split("\n")
        .map((line) => (line.trim().startsWith("- ") ? line : `- ${line || "položka"}`))
        .join("\n");
    }

    const nextValue = `${value.slice(0, start)}${replacement}${value.slice(end)}`;
    setValue(nextValue);
    textarea.focus();
    window.requestAnimationFrame(() => {
      textarea.selectionStart = start;
      textarea.selectionEnd = start + replacement.length;
    });
  }

  return (
    <div className="grid gap-2 text-sm font-medium text-[#334235]">
      <label htmlFor="text_prispevku">
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
      <textarea
        ref={textareaRef}
        id="text_prispevku"
        name="text_prispevku"
        rows={8}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="resize-y rounded-b-2xl border border-emerald-950/14 bg-[#f8faf4] px-4 py-3 outline-none transition placeholder:text-[#8a9385] focus:border-emerald-800/45 focus:bg-white"
      />
      <p className="text-xs leading-6 text-[#667062]">
        Použít můžete jen jednoduché značky: <span className="font-semibold">## Nadpis</span>,{" "}
        <span className="font-semibold">**tučně**</span> a odrážky začínající pomlčkou.
      </p>
      <div className="mt-3 rounded-3xl border border-emerald-950/10 bg-white/70 p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-800/70">
          Náhled
        </p>
        {value.trim() ? (
          <FormattedContributionText text={value} />
        ) : (
          <p className="text-sm leading-7 text-[#667062]">
            Jakmile začnete psát, uvidíte zde podobu textu na webu.
          </p>
        )}
      </div>
    </div>
  );
}
