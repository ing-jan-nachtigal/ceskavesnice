"use client";

import {
  requestManagementLinkAction,
  submitContributionAction,
  type ActionState,
} from "@/app/pridat-prispevek/actions";
import { VillageAutocompleteField } from "@/components/VillageAutocompleteField";
import {
  allowedClientPhotoTypes,
  optimizeContributionImageInBrowser,
} from "@/lib/client-images";
import Link from "next/link";
import { startTransition, useActionState, useState, type FormEvent } from "react";

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
  const [isPreparingPhotos, setIsPreparingPhotos] = useState(false);
  const [photoMessage, setPhotoMessage] = useState("");
  const [photoError, setPhotoError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const photos = formData
      .getAll("photos")
      .filter((file): file is File => file instanceof File && file.size > 0);

    setPhotoError("");
    setPhotoMessage("");

    if (photos.length > 5) {
      setPhotoError("Můžete nahrát nejvýše 5 fotografií.");
      return;
    }

    for (const photo of photos) {
      if (!allowedClientPhotoTypes.has(photo.type)) {
        setPhotoError("Podporované jsou fotografie JPG, PNG a WebP.");
        return;
      }
    }

    formData.delete("photos");

    if (photos.length > 0) {
      setIsPreparingPhotos(true);
      setPhotoMessage("Fotografie se připravují...");

      try {
        const optimizedPhotos = await Promise.all(
          photos.map((photo) => optimizeContributionImageInBrowser(photo)),
        );

        optimizedPhotos.forEach((photo) => {
          formData.append("photos", photo);
        });
        setPhotoMessage(
          optimizedPhotos.length === 1
            ? "Připravena 1 fotografie k odeslání."
            : `Připraveno ${optimizedPhotos.length} fotografií k odeslání.`,
        );
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
                E-mail autora
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
              Nadpis
              <input
                name="nadpis"
                type="text"
                required
                placeholder="Krátký název příspěvku"
                className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3 outline-none transition placeholder:text-[#8a9385] focus:border-emerald-800/45 focus:bg-white"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#334235]">
              Text příspěvku
              <textarea
                name="text_prispevku"
                rows={7}
                placeholder="Napište vzpomínku, popis fotografie, historickou zajímavost nebo opravu záznamu."
                className="resize-y border border-emerald-950/14 bg-[#f8faf4] px-4 py-3 outline-none transition placeholder:text-[#8a9385] focus:border-emerald-800/45 focus:bg-white"
              />
            </label>

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

            <div className="border border-dashed border-emerald-900/24 bg-[#eef7f6] p-5">
              <label className="grid gap-2 text-sm font-medium text-[#334235]">
                Nahrání fotografií
                <input
                  name="photos"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="text-sm text-[#667062] file:mr-4 file:border-0 file:bg-[#17331f] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
              </label>
              <p className="mt-3 text-sm leading-7 text-[#667062]">
                Maximálně 5 fotografií, jedna fotografie nejvýše 8 MB. Podporované
                formáty: JPG, PNG, WEBP.
              </p>
              {photoMessage ? (
                <p className="mt-3 border border-emerald-900/14 bg-white/55 px-3 py-2 text-sm text-[#17331f]">
                  {photoMessage}
                </p>
              ) : null}
              {photoError ? (
                <p className="mt-3 border border-red-900/18 bg-red-900/5 px-3 py-2 text-sm text-red-900">
                  {photoError}
                </p>
              ) : null}
            </div>

            <label className="flex gap-3 text-sm leading-7 text-[#515d50]">
              <input
                name="souhlas"
                type="checkbox"
                required
                className="mt-2 size-4 accent-emerald-800"
              />
              Souhlasím se zveřejněním zaslaného příspěvku na webu
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
              className="w-fit bg-[#17331f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#214b2e] disabled:cursor-wait disabled:opacity-70"
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
              className="mt-6 inline-flex bg-[#17331f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#214b2e]"
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
                className="w-fit border border-emerald-900/22 px-5 py-3 text-sm font-semibold text-[#17331f] transition hover:border-emerald-800/45 hover:bg-white/60 disabled:cursor-wait disabled:opacity-70"
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
