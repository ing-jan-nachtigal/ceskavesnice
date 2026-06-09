"use client";

import { useState } from "react";

type PhotoGalleryProps = {
  photos: string[];
  title: string;
};

export function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (photos.length === 0) {
    return null;
  }

  return (
    <>
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-800/70">
          fotografie
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {photos.map((url, index) => (
            <button
              aria-label={`Zvětšit fotografii ${index + 1} k příspěvku ${title}`}
              className="group aspect-[4/3] overflow-hidden rounded-3xl border border-emerald-950/10 bg-[#dfece5] text-left shadow-[0_18px_50px_rgba(40,55,35,0.08)]"
              key={url}
              onClick={() => setSelectedPhoto(url)}
              type="button"
            >
              <span
                aria-hidden="true"
                className="block size-full cursor-pointer bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                style={{ backgroundImage: `url("${url}")` }}
              />
            </button>
          ))}
        </div>
      </section>

      {selectedPhoto ? (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-[#102417]/58 px-4 py-8 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
          role="presentation"
        >
          <div
            className="relative max-h-[86vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white p-2 shadow-[0_32px_90px_rgba(0,0,0,0.32)] sm:p-3"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              aria-label="Zavřít zvětšenou fotografii"
              className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-white/92 text-2xl leading-none text-[#17331f] shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:bg-white"
              onClick={() => setSelectedPhoto(null)}
              type="button"
            >
              ×
            </button>
            <div
              aria-label={`Zvětšená fotografie k příspěvku ${title}`}
              className="h-[76vh] max-h-[82vh] w-full rounded-2xl bg-contain bg-center bg-no-repeat"
              role="img"
              style={{ backgroundImage: `url("${selectedPhoto}")` }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
