export type PlaceLike = {
  kraj: string | null;
  nazev: string;
  nazev_obce: string | null;
  okres: string | null;
};

export function cleanDistrict(value: string | null | undefined) {
  return (value || "neuveden").replace(/^okr\.\s*/i, "").trim();
}

export function formatPlace(place: PlaceLike | undefined) {
  if (!place) {
    return "místo neuvedeno";
  }

  return `${place.nazev}, ${place.nazev_obce || "obec neuvedena"}, okres ${cleanDistrict(
    place.okres,
  )}, ${place.kraj || "kraj neuveden"}`;
}
