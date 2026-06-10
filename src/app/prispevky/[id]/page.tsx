import { PhotoGallery } from "@/components/PhotoGallery";
import { FormattedContributionText } from "@/components/FormattedContributionText";
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
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/video";
import Link from "next/link";
import { notFound } from "next/navigation";

type ContributionDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function loadContribution(id: string) {
  const params = new URLSearchParams({
    id: `eq.${id}`,
    limit: "1",
    select:
      "id,id_mista,email,jmeno_autora,nadpis,text_prispevku,foto_1,foto_2,foto_3,foto_4,foto_5,video_url,popis_videa,web_obce,zverejneno,vytvoreno,upraveno,potvrzovaci_token_hash,potvrzeno_v,smazano_autorem_v",
    smazano_autorem_v: "is.null",
    zverejneno: "eq.true",
  });
  const rows = await supabaseRest<PrispevekRecord[]>(`prispevky?${params.toString()}`);
  const contribution = rows[0];

  if (!contribution) {
    return null;
  }

  const placeRows = await supabaseRest<MistoRecord[]>(
    `mista?select=id,nazev,nazev_obce,okres,kraj&id=eq.${contribution.id_mista}&limit=1`,
  );

  return {
    contribution,
    place: placeRows[0],
  };
}

export async function generateMetadata({ params }: ContributionDetailPageProps) {
  const { id } = await params;
  const data = await loadContribution(id);

  if (!data) {
    return {};
  }

  const { contribution, place } = data;
  const description = contributionTextToPlainExcerpt(contribution.text_prispevku);
  const firstPhoto = getContributionPhotoPaths(contribution)[0];
  const imageUrl =
    getYouTubeThumbnailUrl(contribution.video_url) ||
    (firstPhoto ? getStoragePublicUrl(firstPhoto) : null);
  const title = `${contribution.nadpis}${place?.nazev ? ` – ${place.nazev}` : ""} - ČeskáVesnice.cz`;

  return {
    description,
    openGraph: {
      description,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
      title,
      type: "article",
    },
    title,
  };
}

export default async function ContributionDetailPage({ params }: ContributionDetailPageProps) {
  const { id } = await params;
  const data = await loadContribution(id);

  if (!data) {
    notFound();
  }

  const { contribution, place } = data;
  const embedUrl = getYouTubeEmbedUrl(contribution.video_url);
  const photoUrls = getContributionPhotoPaths(contribution)
    .map((path) => getStoragePublicUrl(path))
    .filter((url): url is string => Boolean(url));

  return (
    <main className="min-h-screen bg-[#f1f7f4] text-[#17251b]">
      <SiteHeader />

      <section className="px-5 pb-14 pt-28 sm:px-8 lg:pb-20 lg:pt-36">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/#vesnice"
            className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-800/70 transition hover:text-emerald-950"
          >
            zpět na příspěvky
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-800/70">
                {formatMisto(place)}
              </p>
              <h1 className="mt-5 font-serif text-5xl leading-tight text-[#102417] sm:text-7xl">
                {contribution.nadpis}
              </h1>
            </div>

            <div className="text-sm leading-8 text-[#667062]">
              {contribution.jmeno_autora ? <p>Autor: {contribution.jmeno_autora}</p> : null}
              <p>Vytvořeno: {formatCzechDate(contribution.vytvoreno)}</p>
              {contribution.upraveno ? <p>Upraveno: {formatCzechDate(contribution.upraveno)}</p> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 lg:pb-28">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <article className="space-y-10">
            {embedUrl ? (
              <div className="overflow-hidden border border-emerald-950/10 bg-black shadow-[0_24px_70px_rgba(40,55,35,0.08)]">
                <iframe
                  src={embedUrl}
                  title={`Video k příspěvku ${contribution.nadpis}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="aspect-video w-full"
                />
              </div>
            ) : null}

            {contribution.popis_videa ? (
              <p className="border-l-2 border-emerald-800/28 pl-5 text-sm leading-7 text-[#667062]">
                {contribution.popis_videa}
              </p>
            ) : null}

            {contribution.text_prispevku ? (
              <div className="border border-emerald-950/10 bg-white/70 p-6 shadow-[0_24px_70px_rgba(40,55,35,0.06)] sm:p-8">
                <FormattedContributionText text={contribution.text_prispevku} />
              </div>
            ) : null}

            <PhotoGallery photos={photoUrls} title={contribution.nadpis} />
          </article>

          <aside className="h-fit border border-emerald-950/10 bg-white/70 p-6 shadow-[0_24px_70px_rgba(40,55,35,0.06)]">
            <h2 className="font-serif text-3xl text-[#102417]">Místo</h2>
            <dl className="mt-6 space-y-4 text-sm leading-7 text-[#667062]">
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-[#7c8576]">místo</dt>
                <dd>{place?.nazev || "neuvedeno"}</dd>
              </div>
              {place?.nazev_obce ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#7c8576]">obec</dt>
                  <dd>{place.nazev_obce}</dd>
                </div>
              ) : null}
              {place?.okres ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#7c8576]">okres</dt>
                  <dd>{cleanDistrict(place.okres)}</dd>
                </div>
              ) : null}
              {place?.kraj ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#7c8576]">kraj</dt>
                  <dd>{place.kraj}</dd>
                </div>
              ) : null}
            </dl>

            {contribution.web_obce ? (
              <a
                href={contribution.web_obce}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-3d btn-secondary mt-8 inline-flex px-5 py-3 text-sm font-semibold"
              >
                Web obce
              </a>
            ) : null}

            <div className="mt-8 border-t border-emerald-950/10 pt-6 text-sm leading-7 text-[#667062]">
              Chcete upravit svůj příspěvek?{" "}
              <Link
                href="/upravit-prispevky"
                className="font-semibold text-[#17331f] transition hover:text-emerald-800"
              >
                Nechte si poslat odkaz na e-mail.
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
