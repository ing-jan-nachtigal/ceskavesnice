export type MistoRecord = {
  id: number | string;
  kod_ruian: string | null;
  druh_prvku: string | null;
  nazev: string;
  kod_obce: string | null;
  nazev_obce: string | null;
  okres: string | null;
  kraj: string | null;
  zemepisna_sirka: number | null;
  zemepisna_delka: number | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const mistaSelect =
  "id,kod_ruian,druh_prvku,nazev,kod_obce,nazev_obce,okres,kraj,zemepisna_sirka,zemepisna_delka";

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export async function searchMista(query: string, signal?: AbortSignal) {
  const trimmed = query.trim();

  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const safeSearch = trimmed.replaceAll("*", "").replaceAll(",", "");
  if (!safeSearch) {
    return [];
  }

  const resultGroups = await Promise.all([
    fetchMistaByColumnFilter("nazev", `ilike.${safeSearch}`, signal),
    fetchMistaByColumnFilter("nazev", `ilike.${safeSearch}*`, signal),
    fetchMistaByColumnFilter("nazev_obce", `ilike.${safeSearch}`, signal),
    fetchMistaByColumnFilter("nazev_obce", `ilike.${safeSearch}*`, signal),
    fetchMistaByOrFilter(
      `(nazev.ilike.*${safeSearch}*,nazev_obce.ilike.*${safeSearch}*,okres.ilike.*${safeSearch}*,kraj.ilike.*${safeSearch}*)`,
      signal,
    ),
  ]);
  const seen = new Set<string>();

  return resultGroups
    .flat()
    .sort((left, right) => {
      const relevanceDifference = getMistoRelevance(left, safeSearch) - getMistoRelevance(right, safeSearch);

      if (relevanceDifference !== 0) {
        return relevanceDifference;
      }

      return left.nazev.localeCompare(right.nazev, "cs", {
        sensitivity: "base",
      });
    })
    .filter((misto) => {
      const key = String(misto.id);

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, 30);
}

async function fetchMistaByColumnFilter(
  column: "nazev" | "nazev_obce",
  filter: string,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({
    limit: "30",
    order: "nazev.asc",
    select: mistaSelect,
  });
  params.set(column, filter);

  return fetchMista(params.toString(), signal);
}

async function fetchMistaByOrFilter(orFilter: string, signal?: AbortSignal) {
  const params = new URLSearchParams({
    limit: "30",
    order: "nazev.asc",
    or: orFilter,
    select: mistaSelect,
  });

  return fetchMista(params.toString(), signal);
}

async function fetchMista(queryString: string, signal?: AbortSignal) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/mista?${queryString}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Supabase search failed with status ${response.status}.`);
  }

  return (await response.json()) as MistoRecord[];
}

function normalizeValue(value: string | null | undefined) {
  return (value || "").trim().toLocaleLowerCase("cs");
}

function getMistoRelevance(misto: MistoRecord, query: string) {
  const normalizedQuery = normalizeValue(query);
  const nazev = normalizeValue(misto.nazev);
  const nazevObce = normalizeValue(misto.nazev_obce);
  const okres = normalizeValue(misto.okres);
  const kraj = normalizeValue(misto.kraj);

  if (nazev === normalizedQuery) {
    return 0;
  }

  if (nazev.startsWith(normalizedQuery)) {
    return 1;
  }

  if (nazevObce === normalizedQuery) {
    return 2;
  }

  if (nazevObce.startsWith(normalizedQuery)) {
    return 3;
  }

  if (nazev.includes(normalizedQuery)) {
    return 4;
  }

  if (nazevObce.includes(normalizedQuery)) {
    return 5;
  }

  if (okres.includes(normalizedQuery)) {
    return 6;
  }

  if (kraj.includes(normalizedQuery)) {
    return 7;
  }

  return 8;
}
