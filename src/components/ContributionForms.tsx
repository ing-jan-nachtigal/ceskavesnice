"use client";

import {
  requestManagementLinkAction,
  submitContributionAction,
  type ActionState,
} from "@/app/pridat-prispevek/actions";
import { PhotoUploadSlots, type PhotoUploadSlotsHandle } from "@/components/PhotoUploadSlots";
import { RichTextEditor } from "@/components/RichTextEditor";
import { VillageAutocompleteField } from "@/components/VillageAutocompleteField";
import Link from "next/link";
import { startTransition, useActionState, useRef, useState, type FormEvent } from "react";

const initialState: ActionState = {
  message: "",
  ok: false,
};

export function ContributionForms() {
  const [submitState, submitAction, isSubmitting] = useActionState(
    submitContributionAction,
    initialState,
  );
  const [manageState, manageAction, isRequestingLink] = useActionState(
    requestManagementLinkAction,
    initialState,
  );
  const photoSlotsRef = useRef<PhotoUploadSlotsHandle>(null);
  const [isPreparingPhotos, setIsPreparingPhotos] = useState(false);
  const [photoError, setPhotoError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setPhotoError("");

    if (photoSlotsRef.current?.isPreparing()) {
      setPhotoError("Počkejte prosím, fotografie se ještě připravují.");
      return;
    }

    photoSlotsRef.current?.appendToFormData(formData);

    startTransition(() => {
      submitAction(formData);
    });
  }

  return (
    <section className="px-5 pb-20 sm:px-8 lg:pb-28">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="border border-emerald-950/10 bg-white/68 p-6 shadow-[0_24px_70px_rgba(40,55,35,0.08)] sm:p-8">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-800/70">
              A) Přidat nový příspěvek
            </p>
            <h2 className="mt-4 font-serif text-4xl text-[#102417]">
              Pošlete fotku, video nebo příběh
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#667062]">
              Po odeslání příspěvku vám pošleme potvrzovací e-mail. Po kliknutí
              na potvrzovací odkaz se příspěvek zveřejní na webu. Svoje
              příspěvky budete moci později upravit přes odkaz zaslaný na váš
              e-mail.
            </p>
          </div>

          <form encType="multipart/form-data" onSubmit={handleSubmit} className="grid gap-5">
            <p className="text-sm text-[#667062]">
              Pole označená <span className="required-star">*</span> jsou povinná.
            </p>
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-[#334235]">
                E-mail autora <span className="required-star">*</span>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="vas@email.cz"
                  className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3 outline-none transition placeholder:text-[#8a9385] focus:border-emerald-800/45 focus:bg-white"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-[#334235]">
                Jméno autora
                <input
                  name="jmeno_autora"
                  type="text"
                  placeholder="Jan Novák"
                  className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3 outline-none transition placeholder:text-[#8a9385] focus:border-emerald-800/45 focus:bg-white"
                />
              </label>
            </div>

            <VillageAutocompleteField />

            <label className="grid gap-2 text-sm font-medium text-[#334235]">
              Nadpis <span className="required-star">*</span>
              <input
                name="nadpis"
                type="text"
                required
                placeholder="Krátký název příspěvku"
                className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3 outline-none transition placeholder:text-[#8a9385] focus:border-emerald-800/45 focus:bg-white"
              />
            </label>

            <RichTextEditor />

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-[#334235]">
                Odkaz na YouTube video
                <input
                  name="video_url"
                  type="url"
                  placeholder="https://www.youtube.com/..."
                  className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3 outline-none transition placeholder:text-[#8a9385] focus:border-emerald-800/45 focus:bg-white"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-[#334235]">
                Web obce
                <input
                  name="web_obce"
                  type="url"
                  placeholder="https://..."
                  className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3 outline-none transition placeholder:text-[#8a9385] focus:border-emerald-800/45 focus:bg-white"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium text-[#334235]">
              Popis videa
              <input
                name="popis_videa"
                type="text"
                placeholder="Co je ve videu zachyceno?"
                className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3 outline-none transition placeholder:text-[#8a9385] focus:border-emerald-800/45 focus:bg-white"
              />
            </label>

            <PhotoUploadSlots
              ref={photoSlotsRef}
              mode="create"
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

            <label className="flex gap-3 text-sm leading-7 text-[#515d50]">
              <input
                name="souhlas"
                type="checkbox"
                required
                className="mt-2 size-4 accent-emerald-800"
              />
              <span>
                Souhlasím se zveřejněním zaslaného příspěvku na webu
                <span className="required-star"> *</span>
              </span>
              ČeskáVesnice.cz.
            </label>

            {submitState.message ? (
              <p
                className={`border px-4 py-3 text-sm leading-7 ${
                  submitState.ok
                    ? "border-emerald-900/18 bg-emerald-900/5 text-[#17331f]"
                    : "border-red-900/18 bg-red-900/5 text-red-900"
                }`}
              >
                {submitState.message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || isPreparingPhotos}
              className="btn-3d btn-primary w-fit px-6 py-3 text-sm font-semibold disabled:cursor-wait disabled:opacity-70"
            >
              {isPreparingPhotos
                ? "Připravuji fotografie..."
                : isSubmitting
                  ? "Odesílám..."
                  : "Odeslat příspěvek"}
            </button>
          </form>
        </section>

        <aside className="space-y-8">
          <section className="border border-emerald-950/10 bg-white/72 p-6 shadow-[0_24px_70px_rgba(40,55,35,0.06)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-800/70">
              správa příspěvků
            </p>
            <h2 className="mt-4 font-serif text-3xl text-[#102417]">
              Už jste přispěli?
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#667062]">
              Nechte si poslat soukromý odkaz, přes který uvidíte svoje příspěvky
              a můžete je upravit nebo smazat z webu.
            </p>
            <Link
              href="/upravit-prispevky"
              className="btn-3d btn-primary mt-6 inline-flex px-5 py-3 text-sm font-semibold"
            >
              Otevřít úpravu příspěvků
            </Link>
          </section>

          <section className="border border-emerald-950/10 bg-[#eef7f6] p-6 shadow-[0_24px_70px_rgba(40,55,35,0.06)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-800/70">
              B) Úprava mých příspěvků
            </p>
            <h2 className="mt-4 font-serif text-4xl text-[#102417]">
              Úprava mých příspěvků
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#667062]">
              Zadejte e-mail, kterým jste příspěvek vložili. Pošleme vám odkaz,
              přes který uvidíte svoje příspěvky a budete je moci upravit nebo
              smazat z webu.
            </p>

            <form action={manageAction} className="mt-7 grid gap-5">
              <label className="grid gap-2 text-sm font-medium text-[#334235]">
                E-mail autora
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="vas@email.cz"
                  className="border border-emerald-950/14 bg-white/72 px-4 py-3 outline-none transition placeholder:text-[#8a9385] focus:border-emerald-800/45 focus:bg-white"
                />
              </label>

              {manageState.message ? (
                <p
                  className={`border px-4 py-3 text-sm leading-7 ${
                    manageState.ok
                      ? "border-emerald-900/18 bg-emerald-900/5 text-[#17331f]"
                      : "border-red-900/18 bg-red-900/5 text-red-900"
                  }`}
                >
                  {manageState.message}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isRequestingLink}
                className="btn-3d btn-secondary w-fit px-5 py-3 text-sm font-semibold disabled:cursor-wait disabled:opacity-70"
              >
                {isRequestingLink ? "Odesílám..." : "Poslat odkaz pro úpravu"}
              </button>
            </form>
          </section>

          <section className="border border-emerald-950/10 bg-[#f7f5ed] p-6 sm:p-8">
            <h2 className="font-serif text-3xl text-[#102417]">Bez účtů a hesel</h2>
            <p className="mt-4 text-sm leading-7 text-[#667062]">
              E-mail slouží jako jednoduchý identifikátor autora. Každá úprava
              proběhne přes soukromý časově omezený odkaz, ne přes veřejný profil.
            </p>
          </section>
        </aside>
      </div>
    </section>
  );
}
