import Link from "next/link";
import type { MapPlace } from "@/lib/map-types";
import { loadMapPlaces } from "@/lib/mapa";
import { PlacesMap } from "./PlacesMap";

export async function MapSection() {
  let places: MapPlace[] = [];

  try {
    places = await loadMapPlaces();
  } catch (error) {
    console.error("Homepage map places failed to load", error);
  }

  return (
    <section id="mapa" className="bg-[#eef7f6] px-5 py-20 text-[#17251b] sm:px-8 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-stretch">
        <div className="flex flex-col justify-between gap-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-800/70">
              mapa
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-[#102417] sm:text-5xl">
              Místa, kde kronika už žije.
            </h2>
          </div>
          <p className="text-sm leading-7 text-[#667062]">
            Interaktivní mapa zobrazuje jen ta místa, ke kterým už existuje
            zveřejněný příspěvek. Každý zelený bod vede na přehled příběhů,
            fotografií a videí daného místa.
          </p>
          <Link
            href="/mapa"
            className="btn-3d btn-primary mt-2 inline-flex w-fit px-5 py-3 text-sm font-semibold"
          >
            Otevřít mapu
          </Link>
        </div>

        <PlacesMap places={places} variant="compact" />
      </div>
    </section>
  );
}
