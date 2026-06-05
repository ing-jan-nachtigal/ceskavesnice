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
  const params = new URLSearchParams({
    select:
      "id,kod_ruian,druh_prvku,nazev,kod_obce,nazev_obce,okres,kraj,zemepisna_sirka,zemepisna_delka",
    or: `(nazev.ilike.*${safeSearch}*,nazev_obce.ilike.*${safeSearch}*)`,
    order: "nazev.asc",
    limit: "10",
  });

  const response = await fetch(`${supabaseUrl}/rest/v1/mista?${params.toString()}`, {
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
