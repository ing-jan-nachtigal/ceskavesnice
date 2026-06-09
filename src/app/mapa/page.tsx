import { PlacesMap } from "@/components/PlacesMap";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { MapPlace } from "@/lib/map-types";
import { loadMapPlaces } from "@/lib/mapa";
import Link from "next/link";

export const metadata = {
  description:
    "Interaktivní mapa míst, ke kterým už existují zveřejněné příspěvky v digitální kronice ČeskáVesnice.cz.",
  title: "Mapa - ČeskáVesnice.cz",
};

export const dynamic = "force-dynamic";

export default async function MapPage() {
  let places: MapPlace[] = [];

  try {
    places = await loadMapPlaces();
  } catch (error) {
    console.error("Map places failed to load", error);
  }

  return (
    <main className="min-h-screen bg-[#f1f7f4] text-[#17251b]">
      <SiteHeader />

      <section className="px-5 pb-12 pt-28 sm:px-8 lg:pb-16 lg:pt-36">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.74fr_1.26fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-800/70">
              mapa kroniky
            </p>
            <h1 className="mt-4 font-serif text-5xl leading-tight text-[#102417] sm:text-7xl">
              Živá místa ČeskéVesnice.cz
            </h1>
          </div>
          <div className="text-base leading-8 text-[#435143]">
            <p>
              Na mapě se zobrazují jen místa, kde už existuje alespoň jeden veřejný
              příspěvek a kde jsou dostupné GPS souřadnice.
            </p>
            <p className="mt-4 text-sm text-[#667062]">
              Zelený bod otevře detail místa s přehledem všech zveřejněných příspěvků.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 lg:pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <p className="text-sm leading-7 text-[#667062]">
              Počet míst na mapě:{" "}
              <span className="font-semibold text-[#17331f]">{places.length}</span>
            </p>
            <Link
              href="/pridat-prispevek"
              className="btn-3d btn-primary w-fit px-5 py-3 text-sm font-semibold"
            >
              Přidat příspěvek
            </Link>
          </div>

          <PlacesMap places={places} />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
