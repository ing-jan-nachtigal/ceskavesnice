import { cleanDistrict, type PlaceLike } from "@/lib/places";

type PlaceLabelProps = {
  place: PlaceLike | undefined;
};

export function PlaceLabel({ place }: PlaceLabelProps) {
  if (!place) {
    return (
      <span className="font-semibold uppercase tracking-[0.16em] text-emerald-950">
        MÍSTO NEUVEDENO
      </span>
    );
  }

  const details = [
    place.nazev_obce || "obec neuvedena",
    `okres ${cleanDistrict(place.okres)}`,
    place.kraj || "kraj neuveden",
  ].join(", ");

  return (
    <>
      <span className="font-bold uppercase tracking-[0.16em] text-emerald-950">
        {place.nazev.toLocaleUpperCase("cs-CZ")}
      </span>
      <span className="font-medium tracking-[0.16em] text-[#7c8576]">, {details}</span>
    </>
  );
}
