import { cleanDistrict, type PlaceLike } from "@/lib/places";

type PlaceLabelProps = {
  place: PlaceLike | undefined;
  variant?: "card" | "inline";
};

export function PlaceLabel({ place, variant = "inline" }: PlaceLabelProps) {
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
  const placeName = place.nazev.toLocaleUpperCase("cs-CZ");

  if (variant === "card") {
    return (
      <span className="block">
        <span className="block font-serif text-3xl leading-tight text-[#102417] sm:text-4xl">
          {placeName}
        </span>
        <span className="mt-2 block text-xs font-medium tracking-[0.16em] text-[#7c8576]">
          {details}
        </span>
      </span>
    );
  }

  return (
    <>
      <span className="font-bold uppercase tracking-[0.16em] text-emerald-950">
        {placeName}
      </span>
      <span className="font-medium tracking-[0.16em] text-[#7c8576]">, {details}</span>
    </>
  );
}
