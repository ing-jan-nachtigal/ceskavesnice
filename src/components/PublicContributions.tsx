import { formatCzechDate } from "@/lib/date";
import {
  countRows,
  getContributionPhotoPaths,
  getStoragePublicUrl,
  isServerSupabaseConfigured,
  supabaseRest,
  type MistoRecord,
  type PrispevekRecord,
} from "@/lib/supabase/server";
import { contributionTextToPlainExcerpt } from "@/lib/sanitize";
import { getVideoInfo } from "@/lib/video";
import Link from "next/link";
import { PlaceLabel } from "./PlaceLabel";

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

type PublicContributionPlaceRef = Pick<PrispevekRecord, "id_mista">;

type PlaceCard = {
  contribution: PublicContribution;
  contributionCount: number;
  place: MistoRecord | undefined;
};

function formatContributionCount(count: number) {
  if (count === 1) {
    return "1 příspěvek";
  }

  if (count > 1 && count < 5) {
    return `${count} příspěvky`;
  }

  return `${count} příspěvků`;
}

async function loadPublicData() {
  if (!isServerSupabaseConfigured()) {
    return {
      cards: [] as PlaceCard[],
      chroniclePlaceCount: null,
      placeCount: null,
      publicCount: null,
    };
  }

  try {
    const [placeCount, publicCount, publicPlaceRefs, latestContributions] = await Promise.all([
      countRows("mista"),
      countRows("prispevky", "&zverejneno=eq.true&smazano_autorem_v=is.null"),
      supabaseRest<PublicContributionPlaceRef[]>(
        "prispevky?select=id_mista&zverejneno=eq.true&smazano_autorem_v=is.null&limit=10000",
      ),
      supabaseRest<PublicContribution[]>(
        "prispevky?select=id,id_mista,nadpis,text_prispevku,video_url,foto_1,foto_2,foto_3,foto_4,foto_5,vytvoreno&zverejneno=eq.true&smazano_autorem_v=is.null&order=vytvoreno.desc&limit=200",
      ),
    ]);
    const contributionCounts = new Map<number, number>();

    for (const contribution of publicPlaceRefs) {
      contributionCounts.set(
        contribution.id_mista,
        (contributionCounts.get(contribution.id_mista) || 0) + 1,
      );
    }

    const latestByPlace: PublicContribution[] = [];
    const seenPlaceIds = new Set<number>();

    for (const contribution of latestContributions) {
      if (seenPlaceIds.has(contribution.id_mista)) {
        continue;
      }

      seenPlaceIds.add(contribution.id_mista);
      latestByPlace.push(contribution);

      if (latestByPlace.length === 6) {
        break;
      }
    }

    const placeIds = latestByPlace.map((contribution) => contribution.id_mista);
    const places =
      placeIds.length > 0
        ? await supabaseRest<MistoRecord[]>(
            `mista?select=id,nazev,nazev_obce,okres,kraj&id=in.(${placeIds.join(",")})`,
          )
        : [];
    const placeMap = new Map(places.map((place) => [place.id, place]));

    return {
      cards: latestByPlace.map((contribution) => ({
        contribution,
        contributionCount: contributionCounts.get(contribution.id_mista) || 0,
        place: placeMap.get(contribution.id_mista),
      })),
      chroniclePlaceCount: contributionCounts.size,
      placeCount,
      publicCount,
    };
  } catch {
    return {
      cards: [] as PlaceCard[],
      chroniclePlaceCount: null,
      placeCount: null,
      publicCount: null,
    };
  }
}

export async function PublicContributions() {
  const { cards, chroniclePlaceCount, placeCount, publicCount } = await loadPublicData();

  return (
    <section id="vesnice" className="bg-[#f7f5ed] px-5 py-20 text-[#17251b] sm:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-800/70">
              veřejná kronika
            </p>
            <h2 className="mt-4 font-serif text-4xl text-[#102417] sm:text-5xl">
              Místa v kronice
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#667062]">
              Každá karta představuje jedno místo. Po otevření uvidíte všechny příspěvky k dané
              obci nebo osadě.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-[#667062] sm:grid-cols-3">
            <div className="border border-emerald-950/10 bg-white/58 p-4">
              <p className="text-xs uppercase tracking-[0.2em]">míst v databázi</p>
              <p className="mt-2 font-serif text-3xl text-[#102417]">{placeCount ?? "..."}</p>
            </div>
            <div className="border border-emerald-950/10 bg-white/58 p-4">
              <p className="text-xs uppercase tracking-[0.2em]">míst v kronice</p>
              <p className="mt-2 font-serif text-3xl text-[#102417]">
                {chroniclePlaceCount ?? "..."}
              </p>
            </div>
            <div className="border border-emerald-950/10 bg-white/58 p-4">
              <p className="text-xs uppercase tracking-[0.2em]">zveřejněných příspěvků</p>
              <p className="mt-2 font-serif text-3xl text-[#102417]">{publicCount ?? "..."}</p>
            </div>
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="border border-emerald-950/10 bg-white/58 p-8 text-lg leading-9 text-[#435143]">
            První příspěvky od místních lidí se zde objeví brzy.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {cards.map(({ contribution, contributionCount, place }) => {
              const firstPhoto = getContributionPhotoPaths(contribution)[0];
              const videoThumbnail = getVideoInfo(contribution.video_url)?.thumbnailUrl;
              const previewUrl =
                videoThumbnail || (firstPhoto ? getStoragePublicUrl(firstPhoto) : null);

              return (
                <Link
                  key={contribution.id_mista}
                  href={`/mista/${contribution.id_mista}`}
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
                    <PlaceLabel place={place} variant="card" />
                    <h3 className="mt-5 font-serif text-2xl leading-tight text-[#102417]">
                      {contribution.nadpis}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-[#515d50]">
                      {contributionTextToPlainExcerpt(contribution.text_prispevku)}
                    </p>
                    <div className="mt-6 space-y-2 border-t border-emerald-950/10 pt-4 text-xs uppercase tracking-[0.16em] text-emerald-800/70">
                      <p>{formatContributionCount(contributionCount)} v kronice</p>
                      <p>Nejnovější příspěvek: {formatCzechDate(contribution.vytvoreno)}</p>
                    </div>
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
