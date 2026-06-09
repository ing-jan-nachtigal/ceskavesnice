import { formatCzechDate } from "@/lib/date";
import {
  countRows,
  formatMisto,
  getContributionPhotoPaths,
  getStoragePublicUrl,
  isServerSupabaseConfigured,
  supabaseRest,
  type MistoRecord,
  type PrispevekRecord,
} from "@/lib/supabase/server";
import { getYouTubeThumbnailUrl } from "@/lib/video";
import Link from "next/link";

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

async function loadPublicData() {
  if (!isServerSupabaseConfigured()) {
    return {
      placeCount: null,
      publicCount: null,
      recent: [] as PublicContribution[],
      places: new Map<number, MistoRecord>(),
    };
  }

  try {
    const [placeCount, publicCount, recent] = await Promise.all([
      countRows("mista"),
      countRows("prispevky", "&zverejneno=eq.true&smazano_autorem_v=is.null"),
      supabaseRest<PublicContribution[]>(
        "prispevky?select=id,id_mista,nadpis,text_prispevku,video_url,foto_1,foto_2,foto_3,foto_4,foto_5,vytvoreno&zverejneno=eq.true&smazano_autorem_v=is.null&order=vytvoreno.desc&limit=6",
      ),
    ]);
    const placeIds = [...new Set(recent.map((contribution) => contribution.id_mista))];
    const places =
      placeIds.length > 0
        ? await supabaseRest<MistoRecord[]>(
            `mista?select=id,nazev,nazev_obce,okres,kraj&id=in.(${placeIds.join(",")})`,
          )
        : [];

    return {
      placeCount,
      places: new Map(places.map((place) => [place.id, place])),
      publicCount,
      recent,
    };
  } catch {
    return {
      placeCount: null,
      publicCount: null,
      recent: [] as PublicContribution[],
      places: new Map<number, MistoRecord>(),
    };
  }
}

function excerpt(text: string | null) {
  if (!text) {
    return "Příspěvek zatím nemá textový úvod.";
  }

  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
}

export async function PublicContributions() {
  const { placeCount, publicCount, recent, places } = await loadPublicData();

  return (
    <section id="vesnice" className="bg-[#f7f5ed] px-5 py-20 text-[#17251b] sm:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-800/70">
              veřejná kronika
            </p>
            <h2 className="mt-4 font-serif text-4xl text-[#102417] sm:text-5xl">
              Příspěvky z českých vesnic
            </h2>
          </div>
          <div className="grid gap-3 text-sm text-[#667062] sm:grid-cols-2">
            <div className="border border-emerald-950/10 bg-white/58 p-4">
              <p className="text-xs uppercase tracking-[0.2em]">míst v databázi</p>
              <p className="mt-2 font-serif text-3xl text-[#102417]">{placeCount ?? "..."}</p>
            </div>
            <div className="border border-emerald-950/10 bg-white/58 p-4">
              <p className="text-xs uppercase tracking-[0.2em]">zveřejněných příspěvků</p>
              <p className="mt-2 font-serif text-3xl text-[#102417]">{publicCount ?? "..."}</p>
            </div>
          </div>
        </div>

        {recent.length === 0 ? (
          <div className="border border-emerald-950/10 bg-white/58 p-8 text-lg leading-9 text-[#435143]">
            První příspěvky od místních lidí se zde objeví brzy.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {recent.map((contribution) => {
              const place = places.get(contribution.id_mista);
              const firstPhoto = getContributionPhotoPaths(contribution)[0];
              const youtubeThumbnail = getYouTubeThumbnailUrl(contribution.video_url);
              const previewUrl = youtubeThumbnail || (firstPhoto ? getStoragePublicUrl(firstPhoto) : null);

              return (
                <Link
                  key={contribution.id}
                  href={`/prispevky/${contribution.id}`}
                  className="group overflow-hidden border border-emerald-950/10 bg-white/68 shadow-[0_24px_70px_rgba(40,55,35,0.08)] transition duration-500 hover:-translate-y-1 hover:border-emerald-700/28"
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
                      {formatMisto(place)}
                    </p>
                    <h3 className="mt-4 font-serif text-3xl text-[#102417]">
                      {contribution.nadpis}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-[#515d50]">
                      {excerpt(contribution.text_prispevku)}
                    </p>
                    <p className="mt-6 border-t border-emerald-950/10 pt-4 text-xs uppercase tracking-[0.18em] text-emerald-800/70">
                      {formatCzechDate(contribution.vytvoreno)}
                    </p>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
