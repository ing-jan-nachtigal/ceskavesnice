"use client";

import { updateContributionAction } from "@/app/pridat-prispevek/actions";
import {
  allowedClientPhotoTypes,
  optimizeContributionImageInBrowser,
} from "@/lib/client-images";
import { useState, useTransition, type ChangeEvent, type FormEvent } from "react";

type EditableContribution = {
  id: number;
  jmeno_autora: string | null;
  nadpis: string;
  text_prispevku: string | null;
  foto_1: string | null;
  foto_2: string | null;
  foto_3: string | null;
  foto_4: string | null;
  foto_5: string | null;
  video_url: string | null;
  popis_videa: string | null;
  web_obce: string | null;
};

type EditContributionFormProps = {
  contribution: EditableContribution;
  photoUrls: Array<string | null>;
  token: string;
};

const photoSlots = [1, 2, 3, 4, 5] as const;

function fileValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function fileValues(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

export function EditContributionForm({
  contribution,
  photoUrls,
  token,
}: EditContributionFormProps) {
  const currentPhotoCount = photoUrls.filter(Boolean).length;
  const [isPreparingPhotos, setIsPreparingPhotos] = useState(false);
  const [isSaving, startSavingTransition] = useTransition();
  const [photoMessage, setPhotoMessage] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);
  const [replacementPreviews, setReplacementPreviews] = useState<Record<number, string>>({});

  function handleNewPhotosChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    setNewPhotoPreviews(files.map((file) => URL.createObjectURL(file)).slice(0, 5));
    setPhotoError("");
    setPhotoMessage(files.length > 0 ? "Soubor připravený." : "");
  }

  function handleReplacementChange(slot: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setReplacementPreviews((current) => {
      const next = { ...current };

      if (file) {
        next[slot] = URL.createObjectURL(file);
      } else {
        delete next[slot];
      }

      return next;
    });
    setPhotoError("");
    setPhotoMessage(file ? "Soubor připravený." : "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const replacementEntries = photoSlots
      .map((slot) => ({
        file: fileValue(formData, `replace_foto_${slot}`),
        key: `replace_foto_${slot}`,
      }))
      .filter((entry): entry is { file: File; key: string } => Boolean(entry.file));
    const newPhotos = fileValues(formData, "new_photos");
    const replacementSlots = new Set(
      replacementEntries.map((entry) => Number(entry.key.replace("replace_foto_", ""))),
    );
    const removedCount = photoSlots.filter(
      (slot) => formData.get(`remove_foto_${slot}`) === "on" && !replacementSlots.has(slot),
    ).length;
    const finalPhotoCount = currentPhotoCount - removedCount + newPhotos.length;

    setPhotoError("");
    setPhotoMessage("");

    if (finalPhotoCount > 5) {
      setPhotoError("Příspěvek může mít nejvýše 5 fotografií.");
      return;
    }

    const filesToPrepare = [...replacementEntries.map((entry) => entry.file), ...newPhotos];

    for (const file of filesToPrepare) {
      if (!allowedClientPhotoTypes.has(file.type)) {
        setPhotoError("Podporované jsou fotografie JPG, PNG a WebP.");
        return;
      }
    }

    replacementEntries.forEach((entry) => formData.delete(entry.key));
    formData.delete("new_photos");

    if (filesToPrepare.length > 0) {
      setIsPreparingPhotos(true);
      setPhotoMessage("Fotografie se připravují...");

      try {
        for (const entry of replacementEntries) {
          const optimizedPhoto = await optimizeContributionImageInBrowser(entry.file);
          formData.append(entry.key, optimizedPhoto);
        }

        for (const photo of newPhotos) {
          const optimizedPhoto = await optimizeContributionImageInBrowser(photo);
          formData.append("new_photos", optimizedPhoto);
        }

        setPhotoMessage("Fotografie jsou připravené k uložení.");
      } catch (error) {
        setPhotoError(
          error instanceof Error
            ? error.message
            : "Fotografii se nepodařilo připravit. Zkuste prosím jiný obrázek.",
        );
        setPhotoMessage("");
        setIsPreparingPhotos(false);
        return;
      }

      setIsPreparingPhotos(false);
    }

    startSavingTransition(() => {
      updateContributionAction(formData);
    });
  }

  const freeSlotIndexes = photoUrls
    .map((url, index) => (!url ? index : null))
    .filter((index): index is number => index !== null);

  return (
    <form encType="multipart/form-data" onSubmit={handleSubmit} className="grid gap-5">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="id" value={contribution.id} />
      <h2 className="font-serif text-4xl text-[#102417]">Upravit příspěvek</h2>
      <p className="text-sm text-[#667062]">
        Pole označená <span className="required-star">*</span> jsou povinná.
      </p>

      <label className="grid gap-2 text-sm font-medium text-[#334235]">
        Jméno autora
        <input
          name="jmeno_autora"
          defaultValue={contribution.jmeno_autora || ""}
          className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-[#334235]">
        Nadpis <span className="required-star">*</span>
        <input
          name="nadpis"
          defaultValue={contribution.nadpis}
          className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-[#334235]">
        Text příspěvku <span className="required-star">*</span>
        <textarea
          name="text_prispevku"
          rows={7}
          defaultValue={contribution.text_prispevku || ""}
          className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-[#334235]">
        YouTube URL
        <input
          name="video_url"
          defaultValue={contribution.video_url || ""}
          className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-[#334235]">
        Popis videa
        <input
          name="popis_videa"
          defaultValue={contribution.popis_videa || ""}
          className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-[#334235]">
        Web obce
        <input
          name="web_obce"
          defaultValue={contribution.web_obce || ""}
          className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3"
        />
      </label>

      <section className="border border-dashed border-emerald-900/24 bg-[#eef7f6] p-5">
        <h3 className="font-serif text-3xl text-[#102417]">Fotografie k příspěvku</h3>
        <p className="mt-3 text-sm leading-7 text-[#667062]">
          Můžete přidat až 5 fotografií. Fotografie se před uložením automaticky zmenší.
        </p>

        <div className="mt-5 grid gap-4">
          {photoSlots.map((slot) => {
            const url = photoUrls[slot - 1];
            const previewUrl = replacementPreviews[slot] || url;
            const freeSlotOrder = freeSlotIndexes.indexOf(slot - 1);
            const pendingNewPhotoUrl =
              freeSlotOrder >= 0 ? newPhotoPreviews[freeSlotOrder] : undefined;

            return (
              <div key={slot} className="border border-emerald-950/10 bg-white/65 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  {previewUrl || pendingNewPhotoUrl ? (
                    <div
                      aria-label={`Fotografie ${slot}`}
                      className="aspect-[4/3] w-full max-w-44 border border-emerald-950/10 bg-cover bg-center"
                      role="img"
                      style={{ backgroundImage: `url("${previewUrl || pendingNewPhotoUrl}")` }}
                    />
                  ) : (
                    <div className="flex aspect-[4/3] w-full max-w-44 items-center justify-center border border-dashed border-emerald-900/22 bg-[#f8faf4] text-xs uppercase tracking-[0.2em] text-[#7c8576]">
                      Volná pozice
                    </div>
                  )}

                  <div className="grid flex-1 gap-3 text-sm text-[#334235]">
                    <p className="font-semibold">Fotografie {slot}</p>
                    {!url && pendingNewPhotoUrl ? (
                      <p className="text-xs uppercase tracking-[0.18em] text-emerald-800/70">
                        Soubor připravený
                      </p>
                    ) : null}
                    {url && replacementPreviews[slot] ? (
                      <p className="text-xs uppercase tracking-[0.18em] text-emerald-800/70">
                        Náhrada připravená
                      </p>
                    ) : null}
                    {url ? (
                      <label className="flex gap-2 text-[#667062]">
                        <input
                          name={`remove_foto_${slot}`}
                          type="checkbox"
                          className="mt-1 size-4 accent-emerald-800"
                        />
                        Odstranit fotografii
                      </label>
                    ) : null}
                    <label className="grid gap-2">
                      {url ? "Nahradit fotografii" : "Přidat novou fotografii"}
                      {url ? (
                        <input
                          name={`replace_foto_${slot}`}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(event) => handleReplacementChange(slot, event)}
                          className="text-sm text-[#667062] file:mr-4 file:border-0 file:bg-[#17331f] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:shadow-[0_4px_0_rgba(12,36,21,0.18)] hover:file:bg-[#214b2e]"
                        />
                      ) : (
                        <span className="text-xs leading-6 text-[#667062]">
                          Nové fotografie vyberte hromadně níže. Zaplní se první volné pozice.
                        </span>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {freeSlotIndexes.length > 0 ? (
          <label className="mt-5 grid gap-2 text-sm font-medium text-[#334235]">
            Přidat nové fotografie
            <input
              name="new_photos"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleNewPhotosChange}
              className="text-sm text-[#667062] file:mr-4 file:border-0 file:bg-[#17331f] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:shadow-[0_4px_0_rgba(12,36,21,0.18)] hover:file:bg-[#214b2e]"
            />
          </label>
        ) : null}

        {photoMessage ? (
          <p className="mt-4 border border-emerald-900/14 bg-white/55 px-3 py-2 text-sm text-[#17331f]">
            {photoMessage}
          </p>
        ) : null}
        {photoError ? (
          <p className="mt-4 border border-red-900/18 bg-red-900/5 px-3 py-2 text-sm text-red-900">
            {photoError}
          </p>
        ) : null}
      </section>

      <button
        type="submit"
        disabled={isPreparingPhotos || isSaving}
        className="btn-3d btn-primary w-fit px-6 py-3 text-sm font-semibold disabled:cursor-wait disabled:opacity-70"
      >
        {isPreparingPhotos ? "Připravuji fotografie..." : isSaving ? "Ukládám..." : "Uložit příspěvek"}
      </button>
    </form>
  );
}
