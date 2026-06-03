import { villages } from "@/data/villages";
import Image from "next/image";
import Link from "next/link";

export function VillageCards() {
  return (
    <section id="vesnice" className="bg-[#f7f5ed] px-5 py-20 text-[#17251b] sm:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-800/70">
              první záznamy
            </p>
            <h2 className="mt-4 font-serif text-4xl text-[#102417] sm:text-5xl">
              První vesnice v kronice
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-[#667062]">
            První jednoduchá struktura propojuje úvodní stránku s detailem obce.
            Další záznamy se budou doplňovat postupně, s respektem k místům i lidem.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {villages.map((village, index) => (
            <Link
              key={village.geo.slug}
              href={`/obce/${village.geo.slug}`}
              className="group overflow-hidden border border-emerald-950/10 bg-white/58 shadow-[0_24px_70px_rgba(40,55,35,0.08)] transition duration-500 hover:-translate-y-1 hover:border-emerald-700/28 hover:bg-white/82"
            >
              <div className="relative aspect-[4/3] bg-[#dfece5]">
                <Image
                  src={village.content.galleryImages[0] ?? "/hero-sharp-spring-village.png"}
                  alt={`${village.geo.name} - náhled obce`}
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,36,23,0.04),rgba(16,36,23,0.28))]" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white">
                  <span>{village.geo.district}</span>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
              </div>

              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-[#7c8576]">
                  {village.geo.region}
                </p>
                <h3 className="mt-4 font-serif text-3xl text-[#102417]">{village.geo.name}</h3>
                <p className="mt-5 text-sm leading-7 text-[#515d50]">
                  {village.content.shortDescription}
                </p>
                <div className="mt-8 border-t border-emerald-950/10 pt-5 text-xs uppercase tracking-[0.22em] text-emerald-800/70">
                  {village.content.status === "published"
                    ? "otevřít obec"
                    : "připraveno k doplnění"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
