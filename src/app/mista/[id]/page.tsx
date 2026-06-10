import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { formatCzechDate } from "@/lib/date";
import { cleanDistrict } from "@/lib/places";
import {
  formatMisto,
  getContributionPhotoPaths,
  getStoragePublicUrl,
  supabaseRest,
  type MistoRecord,
  type PrispevekRecord,
} from "@/lib/supabase/server";
import { contributionTextToPlainExcerpt } from "@/lib/sanitize";
import { getYouTubeThumbnailUrl } from "@/lib/video";
import Link from "next/link";
import { notFound } from "next/navigation";

type PlacePageProps = {
  params: Promise<{
    id: string;
  }>;
};

type PublicContribution = Pick<
  PrispevekRecord,
  | "foto_1"
  | "foto_2"
  | "foto_3"
  | "foto_4"
  | "foto_5"
  | "id"
  | "id_mista"
  | "nadpis"
  | "text_prispevku"
  | "video_url"
  | "vytvoreno"
>;

async function loadPlace(id: string) {
  const [placeRows, contributions] = await Promise.all([
    supabaseRest<MistoRecord[]>(
      `mista?select=id,nazev,nazev_obce,okres,kraj&id=eq.${encodeURIComponent(id)}&limit=1`,
    ),
    supabaseRest<PublicContribution[]>(
      `prispevky?select=id,id_mista,nadpis,text_prispevku,video_url,foto_1,foto_2,foto_3,foto_4,foto_5,vytvoreno&id_mista=eq.${encodeURIComponent(
        id,
      )}&zverejneno=eq.true&smazano_autorem_v=is.null&order=vytvoreno.desc&limit=12`,
    ),
  ]);

  return {
    contributions,
    place: placeRows[0],
  };
}

export async function generateMetadata({ params }: PlacePageProps) {
  const { id } = await params;
  const { place } = await loadPlace(id);

  if (!place) {
    return {};
  }

  return {
    description: `Veřejné příspěvky k místu ${formatMisto(place)}.`,
    title: `${place.nazev} - ČeskáVesnice.cz`,
  };
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { id } = await params;
  const { contributions, place } = await loadPlace(id);

  if (!place) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f1f7f4] text-[#17251b]">
      <SiteHeader />

      <section className="px-5 pb-14 pt-28 sm:px-8 lg:pb-20 lg:pt-36">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/#vesnice"
            className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-800/70 transition hover:text-emerald-950"
          >
            zpět na vesnice
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-800/70">
                místo v kronice
              </p>
              <h1 className="mt-5 font-serif text-5xl leading-tight text-[#102417] sm:text-7xl">
                {place.nazev}
              </h1>
              <p className="mt-5 text-lg leading-9 text-[#435143]">
                {formatMisto(place)}
              </p>
            </div>

            <dl className="grid gap-4 rounded-3xl border border-emerald-950/10 bg-white/68 p-6 text-sm leading-7 text-[#667062] shadow-[0_24px_70px_rgba(40,55,35,0.06)]">
              {place.nazev_obce ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#7c8576]">obec</dt>
                  <dd>{place.nazev_obce}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-[#7c8576]">okres</dt>
                <dd>{cleanDistrict(place.okres)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-[#7c8576]">kraj</dt>
                <dd>{place.kraj || "kraj neuveden"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f5ed] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-800/70">
                veřejné příspěvky
              </p>
              <h2 className="mt-4 font-serif text-4xl text-[#102417]">
                Příspěvky k tomuto místu
              </h2>
            </div>
            <Link
              href="/pridat-prispevek"
              className="btn-3d btn-primary w-fit px-5 py-3 text-sm font-semibold"
            >
              Přidat příspěvek
            </Link>
          </div>

          {contributions.length === 0 ? (
            <div className="rounded-3xl border border-emerald-950/10 bg-white/68 p-8 text-lg leading-9 text-[#435143]">
              K tomuto místu zatím nejsou zveřejněné příspěvky.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {contributions.map((contribution) => {
                const firstPhoto = getContributionPhotoPaths(contribution)[0];
                const youtubeThumbnail = getYouTubeThumbnailUrl(contribution.video_url);
                const previewUrl =
                  youtubeThumbnail || (firstPhoto ? getStoragePublicUrl(firstPhoto) : null);

                return (
                  <Link
                    key={contribution.id}
                    href={`/prispevky/${contribution.id}`}
                    className="group overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/68 shadow-[0_24px_70px_rgba(40,55,35,0.08)] transition duration-500 hover:-translate-y-1 hover:border-emerald-700/28"
                  >
                    {previewUrl ? (
                      <div
                        aria-label={`Náhled příspěvku ${contribution.nadpis}`}
                        className="aspect-[4/3] bg-cover bg-center"
                        role="img"
                        style={{ backgroundImage: `url("${previewUrl}")` }}
                      />
                    ) : null}
                    <article className="p-6">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#7c8576]">
                        {formatCzechDate(contribution.vytvoreno)}
                      </p>
                      <h3 className="mt-4 font-serif text-3xl text-[#102417]">
                        {contribution.nadpis}
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-[#515d50]">
                        {contributionTextToPlainExcerpt(contribution.text_prispevku, 140)}
                      </p>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
