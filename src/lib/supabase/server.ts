import "server-only";
import { optimizeContributionImage } from "@/lib/images";
import { formatPlace } from "@/lib/places";

export type PrispevekRecord = {
  id: number;
  id_mista: number;
  email: string;
  jmeno_autora: string | null;
  nadpis: string;
  text_prispevku: string | null;
  foto_1: string | null;
  foto_2: string | null;
  foto_3: string | null;
  foto_4: string | null;
  foto_5: string | null;
  video_url: string | null;
  popis_videa: string | null;
  web_obce: string | null;
  potvrzovaci_token_hash: string | null;
  potvrzeno_v: string | null;
  smazano_autorem_v: string | null;
  zverejneno: boolean;
  vytvoreno: string;
  upraveno: string | null;
};

export type MistoRecord = {
  id: number;
  nazev: string;
  nazev_obce: string | null;
  okres: string | null;
  kraj: string | null;
};

export type SpravniOdkazRecord = {
  id: number;
  email: string;
  token_hash: string;
  vytvoreno: string;
  platnost_do: string;
  naposledy_pouzito: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isServerSupabaseConfigured() {
  return Boolean(supabaseUrl && serviceKey);
}

function getSupabaseConfig() {
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Chybí serverové proměnné pro Supabase.");
  }

  return { serviceKey, supabaseUrl };
}

export async function supabaseRest<T>(
  path: string,
  init: RequestInit & { prefer?: string } = {},
) {
  const { serviceKey, supabaseUrl } = getSupabaseConfig();
  const headers = new Headers(init.headers);

  headers.set("apikey", serviceKey);
  headers.set("Authorization", `Bearer ${serviceKey}`);
  headers.set("Accept", "application/json");

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (init.prefer) {
    headers.set("Prefer", init.prefer);
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers,
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(responseText || `Supabase request failed with status ${response.status}.`);
  }

  if (response.status === 204 || !responseText.trim()) {
    return null as T;
  }

  return JSON.parse(responseText) as T;
}

export async function countRows(table: string, filter = "") {
  const { serviceKey, supabaseUrl } = getSupabaseConfig();
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=id${filter}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      Prefer: "count=exact",
      apikey: serviceKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase count failed with status ${response.status}.`);
  }

  const range = response.headers.get("content-range");
  return Number(range?.split("/")?.[1] ?? 0);
}

export async function uploadContributionPhoto(
  contributionId: number,
  index: number,
  file: File,
) {
  const { serviceKey, supabaseUrl } = getSupabaseConfig();
  const optimizedImage = await optimizeContributionImage(file);
  const path = `prispevky/${contributionId}/foto-${index}.${optimizedImage.extension}`;
  const uploadBytes = new Uint8Array(optimizedImage.buffer.byteLength);
  uploadBytes.set(optimizedImage.buffer);
  const body = new Blob([uploadBytes], {
    type: optimizedImage.contentType,
  });
  const response = await fetch(`${supabaseUrl}/storage/v1/object/prispevky/${path}`, {
    body,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": optimizedImage.contentType,
      apikey: serviceKey,
      "x-upsert": "true",
    },
    method: "POST",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Fotografii se nepodařilo nahrát.");
  }

  return path;
}

export function formatMisto(misto: MistoRecord | undefined) {
  return formatPlace(misto);
}

export function getContributionPhotoPaths(
  contribution: Pick<PrispevekRecord, "foto_1" | "foto_2" | "foto_3" | "foto_4" | "foto_5">,
) {
  return [
    contribution.foto_1,
    contribution.foto_2,
    contribution.foto_3,
    contribution.foto_4,
    contribution.foto_5,
  ].filter((path): path is string => Boolean(path));
}

export function getStoragePublicUrl(path: string | null | undefined) {
  if (!path || !supabaseUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${supabaseUrl}/storage/v1/object/public/prispevky/${path}`;
}
