import {
  formatMisto,
  getContributionPhotoPaths,
  getStoragePublicUrl,
  type MistoRecord,
  type PrispevekRecord,
} from "@/lib/supabase/server";
import { getYouTubeEmbedUrl } from "@/lib/video";
import Link from "next/link";

type ContributionPreviewProps = {
  contribution: PrispevekRecord;
  place: MistoRecord | undefined;
};

export function ContributionPreview({ contribution, place }: ContributionPreviewProps) {
  const embedUrl = getYouTubeEmbedUrl(contribution.video_url);
  const photoUrls = getContributionPhotoPaths(contribution)
    .map((path) => getStoragePublicUrl(path))
    .filter((url): url is string => Boolean(url));

  return (
    <article className="mt-10 overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/74 shadow-[0_24px_70px_rgba(40,55,35,0.08)]">
      <div className="p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-800/70">
          {formatMisto(place)}
        </p>
        <h2 className="mt-4 font-serif text-4xl leading-tight text-[#102417]">
          {contribution.nadpis}
        </h2>

        {contribution.text_prispevku ? (
          <p className="mt-6 whitespace-pre-line text-base leading-8 text-[#435143]">
            {contribution.text_prispevku}
          </p>
        ) : null}
      </div>

      {embedUrl ? (
        <div className="border-y border-emerald-950/10 bg-black">
          <iframe
            src={embedUrl}
            title={`Video k příspěvku ${contribution.nadpis}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="aspect-video w-full"
          />
        </div>
      ) : null}

      {photoUrls.length > 0 ? (
        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
          {photoUrls.map((url, index) => (
            <div
              aria-label={`Fotografie ${index + 1} k příspěvku ${contribution.nadpis}`}
              className="aspect-[4/3] rounded-2xl bg-cover bg-center"
              key={url}
              role="img"
              style={{ backgroundImage: `url("${url}")` }}
            />
          ))}
        </div>
      ) : null}

      <div className="border-t border-emerald-950/10 p-6 sm:p-8">
        <Link
          href={`/prispevky/${contribution.id}`}
          className="btn-3d btn-primary inline-flex px-5 py-3 text-sm font-semibold"
        >
          Otevřít detail příspěvku
        </Link>
      </div>
    </article>
  );
}
