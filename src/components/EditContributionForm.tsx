"use client";

import { updateContributionAction } from "@/app/pridat-prispevek/actions";
import { ContributionTextEditor } from "@/components/ContributionTextEditor";
import { PhotoUploadSlots, type PhotoUploadSlotsHandle } from "@/components/PhotoUploadSlots";
import { useRef, useState, useTransition, type FormEvent } from "react";

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

export function EditContributionForm({
  contribution,
  photoUrls,
  token,
}: EditContributionFormProps) {
  const photoSlotsRef = useRef<PhotoUploadSlotsHandle>(null);
  const [isSaving, startSavingTransition] = useTransition();
  const [isPreparingPhotos, setIsPreparingPhotos] = useState(false);
  const [photoError, setPhotoError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (photoSlotsRef.current?.isPreparing()) {
      setPhotoError("Počkejte prosím, fotografie se ještě připravují.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    photoSlotsRef.current?.appendToFormData(formData);
    setPhotoError("");

    startSavingTransition(() => {
      updateContributionAction(formData);
    });
  }

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

      <ContributionTextEditor defaultValue={contribution.text_prispevku || ""} />

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

      <PhotoUploadSlots
        ref={photoSlotsRef}
        existingPhotoUrls={photoUrls}
        mode="edit"
        onStatusChange={({ error, isPreparing }) => {
          setIsPreparingPhotos(isPreparing);
          setPhotoError(error);
        }}
      />

      {photoError ? (
        <p className="border border-red-900/18 bg-red-900/5 px-4 py-3 text-sm text-red-900">
          {photoError}
        </p>
      ) : null}

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
