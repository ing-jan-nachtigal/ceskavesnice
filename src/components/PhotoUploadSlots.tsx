"use client";

import {
  allowedClientPhotoTypes,
  optimizeContributionImageInBrowser,
} from "@/lib/client-images";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";

export type PhotoUploadSlotsHandle = {
  appendToFormData: (formData: FormData) => void;
  hasPreparedPhotos: () => boolean;
  isPreparing: () => boolean;
};

type PhotoUploadSlotsProps = {
  existingPhotoUrls?: Array<string | null>;
  mode: "create" | "edit";
  onStatusChange?: (state: {
    error: string;
    isPreparing: boolean;
    message: string;
  }) => void;
};

const photoSlots = [1, 2, 3, 4, 5] as const;

function emptyPhotoState() {
  return photoSlots.reduce<Record<number, File | null>>((state, slot) => {
    state[slot] = null;
    return state;
  }, {});
}

function emptyPreviewState() {
  return photoSlots.reduce<Record<number, string>>((state, slot) => {
    state[slot] = "";
    return state;
  }, {});
}

export const PhotoUploadSlots = forwardRef<PhotoUploadSlotsHandle, PhotoUploadSlotsProps>(
  function PhotoUploadSlots({ existingPhotoUrls = [], mode, onStatusChange }, ref) {
    const normalizedExistingUrls = useMemo(
      () => photoSlots.map((slot) => existingPhotoUrls[slot - 1] || null),
      [existingPhotoUrls],
    );
    const [preparedFiles, setPreparedFiles] = useState<Record<number, File | null>>(
      emptyPhotoState,
    );
    const [previewUrls, setPreviewUrls] = useState<Record<number, string>>(emptyPreviewState);
    const [removedSlots, setRemovedSlots] = useState<Record<number, boolean>>({});
    const [isPreparing, setIsPreparing] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
      onStatusChange?.({
        error,
        isPreparing,
        message,
      });
    }, [error, isPreparing, message, onStatusChange]);

    useImperativeHandle(
      ref,
      () => ({
        appendToFormData(formData) {
          photoSlots.forEach((slot) => {
            const file = preparedFiles[slot];

            formData.delete(`foto_${slot}`);
            formData.delete(`remove_foto_${slot}`);

            if (file) {
              formData.append(
                `foto_${slot}`,
                new File([file], `foto-${slot}.webp`, {
                  lastModified: file.lastModified,
                  type: "image/webp",
                }),
              );
            }

            if (mode === "edit" && removedSlots[slot] && !file) {
              formData.append(`remove_foto_${slot}`, "on");
            }
          });
        },
        hasPreparedPhotos() {
          return photoSlots.some((slot) => Boolean(preparedFiles[slot]));
        },
        isPreparing() {
          return isPreparing;
        },
      }),
      [isPreparing, mode, preparedFiles, removedSlots],
    );

    function clearStatus() {
      setError("");
      setMessage("");
    }

    function getFreeSlots() {
      return photoSlots.filter((slot) => {
        const hasExistingPhoto = Boolean(normalizedExistingUrls[slot - 1]);
        const hasPreparedPhoto = Boolean(preparedFiles[slot]);
        return !hasPreparedPhoto && (!hasExistingPhoto || Boolean(removedSlots[slot]));
      });
    }

    async function optimizeFilesIntoSlots(files: File[], slots: number[]) {
      if (files.length === 0) {
        return;
      }

      if (files.length > slots.length) {
        setError("Příspěvek může mít nejvýše 5 fotografií.");
        return;
      }

      for (const file of files) {
        if (!allowedClientPhotoTypes.has(file.type)) {
          setError("Podporované jsou fotografie JPG, PNG a WebP.");
          return;
        }
      }

      setIsPreparing(true);
      setError("");
      setMessage("Fotografie se připravují...");

      try {
        const nextFiles: Record<number, File | null> = {};
        const nextPreviews: Record<number, string> = {};

        for (let index = 0; index < files.length; index += 1) {
          const slot = slots[index];
          const optimizedFile = await optimizeContributionImageInBrowser(files[index]);
          nextFiles[slot] = optimizedFile;
          nextPreviews[slot] = URL.createObjectURL(optimizedFile);
        }

        setPreparedFiles((current) => ({
          ...current,
          ...nextFiles,
        }));
        setPreviewUrls((current) => ({
          ...current,
          ...nextPreviews,
        }));
        setMessage("Fotografie jsou připravené k odeslání.");
      } catch (optimizationError) {
        setError(
          optimizationError instanceof Error
            ? optimizationError.message
            : "Fotografii se nepodařilo připravit. Zkuste prosím jiný obrázek.",
        );
        setMessage("");
      } finally {
        setIsPreparing(false);
      }
    }

    async function handleBulkPhotosChange(event: ChangeEvent<HTMLInputElement>) {
      const files = Array.from(event.target.files || []);
      const freeSlots = getFreeSlots();

      await optimizeFilesIntoSlots(files, freeSlots);
    }

    async function handleReplacePhotoChange(slot: number, event: ChangeEvent<HTMLInputElement>) {
      const file = event.target.files?.[0];

      if (!file) {
        clearStatus();
        return;
      }

      await optimizeFilesIntoSlots([file], [slot]);
      setRemovedSlots((current) => ({
        ...current,
        [slot]: false,
      }));
    }

    function removePhoto(slot: number) {
      setPreparedFiles((current) => ({
        ...current,
        [slot]: null,
      }));
      setPreviewUrls((current) => ({
        ...current,
        [slot]: "",
      }));
      setRemovedSlots((current) => ({
        ...current,
        [slot]: true,
      }));
      setError("");
      setMessage("Fotografie bude po uložení odstraněná.");
    }

    function clearPreparedPhoto(slot: number) {
      setPreparedFiles((current) => ({
        ...current,
        [slot]: null,
      }));
      setPreviewUrls((current) => ({
        ...current,
        [slot]: "",
      }));
      clearStatus();
    }

    function undoRemovePhoto(slot: number) {
      setRemovedSlots((current) => ({
        ...current,
        [slot]: false,
      }));
      clearStatus();
    }

    const freeSlotCount = getFreeSlots().length;

    return (
      <section className="border border-dashed border-emerald-900/24 bg-[#eef7f6] p-5">
        <h3 className="font-serif text-3xl text-[#102417]">Fotografie k příspěvku</h3>
        <p className="mt-3 text-sm leading-7 text-[#667062]">
          Můžete přidat až 5 fotografií. Fotografie se před odesláním automaticky zmenší.
        </p>

        <div className="mt-5 grid gap-4">
          {photoSlots.map((slot) => {
            const existingUrl = normalizedExistingUrls[slot - 1];
            const previewUrl = previewUrls[slot];
            const isRemoved = Boolean(removedSlots[slot]);
            const visibleUrl = previewUrl || (!isRemoved ? existingUrl : null);

            return (
              <div key={slot} className="border border-emerald-950/10 bg-white/65 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  {visibleUrl ? (
                    <div
                      aria-label={`Fotografie ${slot}`}
                      className="aspect-[4/3] w-full max-w-44 border border-emerald-950/10 bg-cover bg-center"
                      role="img"
                      style={{ backgroundImage: `url("${visibleUrl}")` }}
                    />
                  ) : (
                    <div className="flex aspect-[4/3] w-full max-w-44 items-center justify-center border border-dashed border-emerald-900/22 bg-[#f8faf4] text-xs uppercase tracking-[0.2em] text-[#7c8576]">
                      {previewUrl ? "Soubor připravený" : "Volná pozice"}
                    </div>
                  )}

                  <div className="grid flex-1 gap-3 text-sm text-[#334235]">
                    <p className="font-semibold">Fotografie {slot}</p>
                    {previewUrl ? (
                      <p className="text-xs uppercase tracking-[0.18em] text-emerald-800/70">
                        Soubor připravený
                      </p>
                    ) : null}
                    {previewUrl ? (
                      <button
                        type="button"
                        onClick={() => clearPreparedPhoto(slot)}
                        className="btn-3d btn-secondary w-fit px-3 py-2 text-xs font-semibold"
                      >
                        Odebrat připravený soubor
                      </button>
                    ) : null}
                    {isRemoved ? (
                      <p className="text-xs uppercase tracking-[0.18em] text-red-900">
                        Fotografie bude odstraněná
                      </p>
                    ) : null}
                    {existingUrl && !isRemoved ? (
                      <>
                        <button
                          type="button"
                          onClick={() => removePhoto(slot)}
                          className="btn-3d btn-danger w-fit px-3 py-2 text-xs font-semibold"
                        >
                          Odstranit fotografii
                        </button>
                        <label className="grid gap-2">
                          Nahradit fotografii
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(event) => handleReplacePhotoChange(slot, event)}
                            className="text-sm text-[#667062] file:mr-4 file:border-0 file:bg-[#17331f] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:shadow-[0_4px_0_rgba(12,36,21,0.18)] hover:file:bg-[#214b2e]"
                          />
                        </label>
                      </>
                    ) : null}
                    {existingUrl && isRemoved ? (
                      <button
                        type="button"
                        onClick={() => undoRemovePhoto(slot)}
                        className="btn-3d btn-secondary w-fit px-3 py-2 text-xs font-semibold"
                      >
                        Ponechat fotografii
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {freeSlotCount > 0 ? (
          <label className="mt-5 grid gap-2 text-sm font-medium text-[#334235]">
            Přidat fotografie
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleBulkPhotosChange}
              className="text-sm text-[#667062] file:mr-4 file:border-0 file:bg-[#17331f] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:shadow-[0_4px_0_rgba(12,36,21,0.18)] hover:file:bg-[#214b2e]"
            />
            <span className="text-xs leading-6 text-[#667062]">
              Vybrané fotografie se postupně přiřadí do prvních volných pozic.
            </span>
          </label>
        ) : null}

        {message ? (
          <p className="mt-4 border border-emerald-900/14 bg-white/55 px-3 py-2 text-sm text-[#17331f]">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 border border-red-900/18 bg-red-900/5 px-3 py-2 text-sm text-red-900">
            {error}
          </p>
        ) : null}
      </section>
    );
  },
);
