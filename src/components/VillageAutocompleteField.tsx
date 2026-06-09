"use client";

import { searchMista, type MistoRecord } from "@/lib/supabase/client";
import { useEffect, useId, useState } from "react";

type VillageAutocompleteFieldProps = {
  id?: string;
  name?: string;
};

export function VillageAutocompleteField({
  id = "village-name",
  name = "villageName",
}: VillageAutocompleteFieldProps) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MistoRecord[]>([]);
  const [selectedMisto, setSelectedMisto] = useState<MistoRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const trimmed = query.trim();

    if (trimmed.length < 2 || selectedMisto?.nazev === query) {
      return () => controller.abort();
    }

    const timeout = window.setTimeout(() => {
      searchMista(trimmed, controller.signal)
        .then((data) => {
          setResults(data);
          setHasSearched(true);
        })
        .catch((searchError: unknown) => {
          if (controller.signal.aborted) {
            return;
          }

          setResults([]);
          setHasSearched(true);
          setError(
            searchError instanceof Error
              ? searchError.message
              : "Vyhledávání míst se nepodařilo načíst.",
          );
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        });
    }, 280);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query, selectedMisto]);

  function selectMisto(misto: MistoRecord) {
    setSelectedMisto(misto);
    setQuery(misto.nazev);
    setResults([]);
    setHasSearched(false);
    setError("");
  }

  return (
    <div className="relative grid gap-2 text-sm font-medium text-[#334235]">
      <label htmlFor={id}>
        Název obce <span className="required-star">*</span>
      </label>
      <input
        id={id}
        name={name}
        type="text"
        value={query}
        autoComplete="off"
        aria-controls={listId}
        onChange={(event) => {
          const value = event.target.value;

          setQuery(value);
          setSelectedMisto(null);

          if (value.trim().length < 2) {
            setResults([]);
            setIsLoading(false);
            setHasSearched(false);
            setError("");
          } else {
            setIsLoading(true);
            setHasSearched(false);
            setError("");
          }
        }}
        placeholder="Začněte psát název obce..."
        className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3 outline-none transition placeholder:text-[#8a9385] focus:border-emerald-800/45 focus:bg-white"
      />
      <input type="hidden" name="misto_id" value={selectedMisto?.id ?? ""} />

      {(isLoading || error || results.length > 0 || hasSearched) && (
        <div
          id={listId}
          className="absolute left-0 right-0 top-[76px] z-20 border border-emerald-950/12 bg-white shadow-[0_24px_60px_rgba(40,55,35,0.14)]"
        >
          {isLoading ? (
            <p className="px-4 py-3 text-sm text-[#667062]">Vyhledávám místa...</p>
          ) : null}

          {error ? <p className="px-4 py-3 text-sm text-red-900">{error}</p> : null}

          {!isLoading && !error && hasSearched && results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[#667062]">Žádné místo nebylo nalezeno.</p>
          ) : null}

          {!isLoading && !error
            ? results.map((misto) => (
                <button
                  key={misto.id}
                  type="button"
                  onClick={() => selectMisto(misto)}
                  className="block w-full border-t border-emerald-950/8 px-4 py-3 text-left transition first:border-t-0 hover:bg-[#eef7f6]"
                >
                  <span className="block font-serif text-xl text-[#102417]">{misto.nazev}</span>
                  <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-[#667062]">
                    {misto.nazev_obce || "obec neuvedena"} · okres {misto.okres || "neuveden"} ·{" "}
                    {misto.kraj || "kraj neuveden"}
                  </span>
                </button>
              ))
            : null}
        </div>
      )}

      <p className="text-xs leading-6 text-[#667062]">
        Vyhledávání čte tabulku <span className="font-semibold">mista</span> v
        Supabase. Po výběru se do formuláře uloží skryté{" "}
        <span className="font-semibold">misto_id</span>; zápis příspěvku zatím
        není implementovaný.
      </p>

      {selectedMisto ? (
        <div className="mt-2 border border-emerald-950/10 bg-white/52 p-3 text-xs leading-6 text-[#667062]">
          <p className="font-semibold uppercase tracking-[0.18em] text-emerald-800/70">
            Vybrané místo
          </p>
          <p className="mt-2">
            {selectedMisto.nazev_obce || "obec neuvedena"} ·{" "}
            {selectedMisto.okres || "okres neuveden"} · {selectedMisto.kraj || "kraj neuveden"}
          </p>
          <p>
            GPS: {selectedMisto.zemepisna_sirka ?? "nevyplněno"} /{" "}
            {selectedMisto.zemepisna_delka ?? "nevyplněno"}
          </p>
        </div>
      ) : null}
    </div>
  );
}
