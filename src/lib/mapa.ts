import { isServerSupabaseConfigured, supabaseRest, type MistoRecord } from "@/lib/supabase/server";
import type { MapPlace } from "@/lib/map-types";

type ContributionPlaceRef = {
  id: number;
  id_mista: number;
};

export async function loadMapPlaces() {
  if (!isServerSupabaseConfigured()) {
    return [] as MapPlace[];
  }

  const contributions = await supabaseRest<ContributionPlaceRef[]>(
    "prispevky?select=id,id_mista&zverejneno=eq.true&smazano_autorem_v=is.null&limit=1000",
  );
  const counts = new Map<number, number>();

  for (const contribution of contributions) {
    counts.set(contribution.id_mista, (counts.get(contribution.id_mista) ?? 0) + 1);
  }

  const placeIds = [...counts.keys()];

  if (placeIds.length === 0) {
    return [];
  }

  const places = await supabaseRest<MistoRecord[]>(
    `mista?select=id,nazev,nazev_obce,okres,kraj,zemepisna_sirka,zemepisna_delka&id=in.(${placeIds.join(
      ",",
    )})&zemepisna_sirka=not.is.null&zemepisna_delka=not.is.null&order=nazev.asc`,
  );

  return places
    .filter(
      (place): place is MistoRecord & { zemepisna_delka: number; zemepisna_sirka: number } =>
        typeof place.zemepisna_sirka === "number" && typeof place.zemepisna_delka === "number",
    )
    .map((place) => ({
      id: place.id,
      kraj: place.kraj,
      nazev: place.nazev,
      nazev_obce: place.nazev_obce,
      okres: place.okres,
      pocet_prispevku: counts.get(place.id) ?? 0,
      zemepisna_delka: place.zemepisna_delka,
      zemepisna_sirka: place.zemepisna_sirka,
    }));
}
