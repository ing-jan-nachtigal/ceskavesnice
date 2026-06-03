import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVillageBySlug, villages } from "@/data/villages";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

type VillagePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return villages.map((village) => ({
    slug: village.geo.slug,
  }));
}

export async function generateMetadata({ params }: VillagePageProps) {
  const { slug } = await params;
  const village = getVillageBySlug(slug);

  if (!village) {
    return {};
  }

  return {
    title: `${village.geo.name} - ČeskáVesnice.cz`,
    description: village.content.shortDescription,
  };
}

export default async function VillagePage({ params }: VillagePageProps) {
  const { slug } = await params;
  const village = getVillageBySlug(slug);

  if (!village) {
    notFound();
  }

  const facts = [
    ["Okres", village.geo.district],
    ["Kraj", village.geo.region],
    ["Souřadnice", `${village.geo.latitude.toFixed(6)}, ${village.geo.longitude.toFixed(6)}`],
    ["RÚIAN / registr", village.geo.ruianCode || "čeká na ověření"],
    [
      "Stav záznamu",
      village.content.status === "published" ? "První verze" : "Připraveno k doplnění",
    ],
  ];

  return (
    <main className="min-h-screen bg-[#f1f7f4] text-[#17251b]">
      <SiteHeader />

      <section className="px-5 pb-14 pt-28 sm:px-8 lg:pb-20 lg:pt-36">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/#vesnice"
            className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-800/70 transition hover:text-emerald-950"
          >
            zpět na první vesnice
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-800/70">
                {village.geo.district} / {village.geo.region}
              </p>
              <h1 className="mt-4 font-serif text-6xl leading-none text-[#102417] sm:text-8xl">
                {village.geo.name}
              </h1>
            </div>
            <p className="max-w-3xl text-lg leading-9 text-[#435143]">
              {village.content.shortDescription}
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 lg:pb-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="overflow-hidden border border-emerald-950/10 bg-[#dfece5] shadow-[0_30px_90px_rgba(45,67,43,0.10)]">
            {village.content.youtubeUrl ? (
              <iframe
                src={village.content.youtubeUrl}
                title={`Video obce ${village.geo.name}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="aspect-video w-full"
              />
            ) : (
              <div className="flex aspect-video flex-col justify-between bg-[linear-gradient(135deg,#dce9df,#f5f1df_54%,#d9ecf3)] p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-800/70">
                  hlavní YouTube video
                </p>
                <p className="max-w-md font-serif text-3xl leading-tight text-[#102417]">
                  Letecký a krajinný záznam bude doplněn v další fázi kroniky.
                </p>
              </div>
            )}
          </div>

          <aside className="border border-emerald-950/10 bg-white/62 p-6 shadow-[0_24px_70px_rgba(40,55,35,0.08)]">
            <h2 className="font-serif text-3xl text-[#102417]">Základní údaje</h2>
            <dl className="mt-7 space-y-5">
              {facts.map(([label, value]) => (
                <div key={label} className="border-t border-emerald-950/10 pt-4">
                  <dt className="text-xs uppercase tracking-[0.22em] text-[#7c8576]">
                    {label}
                  </dt>
                  <dd className="mt-2 text-sm leading-7 text-[#334235]">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-col gap-3">
              {village.geo.officialWebsite ? (
                <a
                  href={village.geo.officialWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-emerald-900/20 px-5 py-3 text-center text-sm font-semibold text-[#17331f] transition hover:border-emerald-800/45 hover:bg-emerald-900/5"
                >
                  Oficiální web obce
                </a>
              ) : null}
              <a
                href={`mailto:ili@ili.cz?subject=Doplnit obec ${encodeURIComponent(village.geo.name)}`}
                className="bg-[#17331f] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#214b2e]"
              >
                Doplnit obec
              </a>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-y border-emerald-950/10 bg-[#eef7f6] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-800/70">
              historie
            </p>
            <h2 className="mt-4 font-serif text-4xl text-[#102417] sm:text-5xl">
              Paměť místa
            </h2>
          </div>
          <p className="text-lg leading-9 text-[#435143]">{village.content.history}</p>
        </div>
      </section>

      <section className="bg-[#f7f5ed] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-800/70">
                galerie
              </p>
              <h2 className="mt-4 font-serif text-4xl text-[#102417] sm:text-5xl">
                Obrazový záznam
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-[#667062]">
              První fotografie jsou zatím pracovní. Detail počítá s budoucím
              doplněním vlastních snímků a leteckých záběrů.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {village.content.galleryImages.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className={`relative aspect-[4/3] overflow-hidden border border-emerald-950/10 bg-white/60 ${
                  village.content.galleryImages.length === 1 ? "md:col-span-2" : ""
                }`}
              >
                <Image
                  src={image}
                  alt={`${village.geo.name} - galerie ${index + 1}`}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#eef7f6] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-stretch">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-800/70">
              mapa
            </p>
            <h2 className="mt-4 font-serif text-4xl text-[#102417] sm:text-5xl">
              Poloha v krajině
            </h2>
          </div>

          <div className="relative min-h-[360px] overflow-hidden border border-emerald-950/10 bg-[#dfece5] shadow-[0_30px_90px_rgba(45,67,43,0.10)]">
            <div className="absolute inset-0 map-grid opacity-80" />
            <div className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-700 shadow-[0_0_34px_rgba(21,128,61,0.35)]" />
            <div className="absolute inset-x-8 bottom-8 flex flex-col gap-2 border-t border-emerald-950/10 pt-5 text-xs uppercase tracking-[0.22em] text-[#64705f] sm:flex-row sm:items-center sm:justify-between">
              <span>mapový blok připravený pro budoucí vrstvu</span>
              <span>
                {village.geo.latitude.toFixed(5)} N / {village.geo.longitude.toFixed(5)} E
              </span>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
