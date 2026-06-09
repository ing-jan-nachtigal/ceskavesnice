import Link from "next/link";

export function MapSection() {
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

        <div className="relative min-h-[420px] overflow-hidden border border-emerald-950/10 bg-[#dfece5] shadow-[0_30px_90px_rgba(45,67,43,0.10)]">
          <div className="absolute inset-0 map-grid opacity-80" />
          <div className="absolute left-[18%] top-[30%] size-3 rounded-full bg-emerald-700 shadow-[0_0_32px_rgba(21,128,61,0.28)]" />
          <div className="absolute left-[44%] top-[58%] size-2 rounded-full bg-sky-600 shadow-[0_0_24px_rgba(2,132,199,0.24)]" />
          <div className="absolute left-[72%] top-[36%] size-2.5 rounded-full bg-lime-700 shadow-[0_0_28px_rgba(77,124,15,0.24)]" />
          <div className="absolute inset-x-8 bottom-8 flex items-center justify-between border-t border-emerald-950/10 pt-5 text-xs uppercase tracking-[0.22em] text-[#64705f]">
            <span>interaktivní mapa příspěvků</span>
            <span>49.8 N / 15.5 E</span>
          </div>
        </div>
      </div>
    </section>
  );
}
