"use client";

import { searchSite, type SiteSearchResult } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

export function SiteSearch() {
  const listId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SiteSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      return () => controller.abort();
    }

    const timeout = window.setTimeout(() => {
      searchSite(trimmed, controller.signal)
        .then((data) => {
          setResults(data);
          setHasSearched(true);
          setIsOpen(true);
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setResults([]);
            setHasSearched(true);
            setIsOpen(true);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        });
    }, 260);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const showResults = isOpen && query.trim().length >= 2 && (isLoading || hasSearched);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <label className="sr-only" htmlFor={listId}>
        Hledat na webu
      </label>
      <div className="flex items-center rounded-full border border-emerald-950/14 bg-white/58 px-3 shadow-[0_8px_24px_rgba(40,55,35,0.08)] transition focus-within:border-emerald-800/42 focus-within:bg-white">
        <span aria-hidden="true" className="mr-2 text-sm text-emerald-900/58">
          ⌕
        </span>
        <input
          id={listId}
          type="search"
          value={query}
          autoComplete="off"
          aria-controls={`${listId}-results`}
          onChange={(event) => {
            const value = event.target.value;

            setQuery(value);
            setIsOpen(true);

            if (value.trim().length < 2) {
              setResults([]);
              setIsLoading(false);
              setHasSearched(false);
            } else {
              setIsLoading(true);
              setHasSearched(false);
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Hledat vesnici nebo příspěvek"
          className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#17251b] outline-none placeholder:text-[#7c8576]"
        />
      </div>

      {showResults ? (
        <div
          id={`${listId}-results`}
          className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-emerald-950/12 bg-white shadow-[0_24px_60px_rgba(40,55,35,0.18)]"
        >
          {isLoading ? (
            <p className="px-4 py-3 text-sm text-[#667062]">Vyhledávám...</p>
          ) : null}

          {!isLoading && hasSearched && results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[#667062]">Nic jsme nenašli.</p>
          ) : null}

          {!isLoading
            ? results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={result.href}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="block border-t border-emerald-950/8 px-4 py-3 text-left transition first:border-t-0 hover:bg-[#eef7f6]"
                >
                  <span className="block text-sm font-semibold text-[#102417]">
                    {result.title}
                  </span>
                  <span className="mt-1 block text-xs uppercase tracking-[0.14em] text-[#667062]">
                    {result.type === "place" ? "místo" : "příspěvek"} · {result.subtitle}
                  </span>
                </Link>
              ))
            : null}
        </div>
      ) : null}
    </div>
  );
}
