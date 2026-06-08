import {
  deleteContributionAction,
  updateContributionAction,
  validateManagementToken,
} from "@/app/pridat-prispevek/actions";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { formatCzechDate } from "@/lib/date";
import {
  formatMisto,
  supabaseRest,
  type MistoRecord,
  type PrispevekRecord,
} from "@/lib/supabase/server";
import Link from "next/link";

type MyContributionsPageProps = {
  searchParams: Promise<{
    edit?: string;
    smazano?: string;
    token?: string;
    ulozeno?: string;
  }>;
};

async function loadContributions(email: string) {
  const params = new URLSearchParams({
    email: `eq.${email}`,
    order: "vytvoreno.desc",
    select:
      "id,id_mista,email,jmeno_autora,nadpis,text_prispevku,video_url,popis_videa,web_obce,zverejneno,vytvoreno,upraveno,smazano_autorem_v",
  });
  const contributions = await supabaseRest<PrispevekRecord[]>(`prispevky?${params.toString()}`);
  const placeIds = [...new Set(contributions.map((contribution) => contribution.id_mista))];

  if (placeIds.length === 0) {
    return { contributions, places: new Map<number, MistoRecord>() };
  }

  const placeParams = new URLSearchParams({
    id: `in.(${placeIds.join(",")})`,
    select: "id,nazev,nazev_obce,okres,kraj",
  });
  const places = await supabaseRest<MistoRecord[]>(`mista?${placeParams.toString()}`);

  return {
    contributions,
    places: new Map(places.map((place) => [place.id, place])),
  };
}

export const metadata = {
  title: "Moje příspěvky - ČeskáVesnice.cz",
};

export default async function MyContributionsPage({ searchParams }: MyContributionsPageProps) {
  const { edit, smazano, token, ulozeno } = await searchParams;
  const session = await validateManagementToken(token || "");

  if (!session) {
    return (
      <main className="min-h-screen bg-[#f1f7f4] text-[#17251b]">
        <SiteHeader />
        <section className="px-5 py-28 sm:px-8 lg:py-36">
          <div className="mx-auto max-w-3xl border border-emerald-950/10 bg-white/70 p-8">
            <h1 className="font-serif text-5xl text-[#102417]">Odkaz nelze použít.</h1>
            <p className="mt-6 text-lg leading-9 text-[#435143]">
              Odkaz pro správu příspěvků je neplatný nebo vypršel. Požádejte si prosím o nový.
            </p>
            <Link
              href="/pridat-prispevek"
              className="mt-8 inline-flex bg-[#17331f] px-5 py-3 text-sm font-semibold text-white"
            >
              Získat nový odkaz
            </Link>
          </div>
        </section>
        <SiteFooter />
      </main>
    );
  }

  const { contributions, places } = await loadContributions(session.email);
  const editContribution = contributions.find((contribution) => String(contribution.id) === edit);

  return (
    <main className="min-h-screen bg-[#f1f7f4] text-[#17251b]">
      <SiteHeader />
      <section className="px-5 pb-14 pt-28 sm:px-8 lg:pb-20 lg:pt-36">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-800/70">
            správa příspěvků
          </p>
          <h1 className="mt-5 font-serif text-5xl leading-tight text-[#102417] sm:text-7xl">
            Moje příspěvky
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-9 text-[#435143]">
            Zobrazujeme příspěvky vložené pod e-mailem {session.email}. Odkaz je časově omezený.
          </p>
          {ulozeno ? (
            <p className="mt-6 border border-emerald-900/18 bg-emerald-900/5 px-4 py-3 text-sm text-[#17331f]">
              Příspěvek byl uložen.
            </p>
          ) : null}
          {smazano ? (
            <p className="mt-6 border border-emerald-900/18 bg-emerald-900/5 px-4 py-3 text-sm text-[#17331f]">
              Příspěvek byl smazán z webu.
            </p>
          ) : null}
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 lg:pb-28">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            {contributions.length === 0 ? (
              <div className="border border-emerald-950/10 bg-white/70 p-6">
                Zatím zde nejsou žádné příspěvky.
              </div>
            ) : null}

            {contributions.map((contribution) => {
              const place = places.get(contribution.id_mista);
              const hidden = Boolean(contribution.smazano_autorem_v);

              return (
                <article
                  key={contribution.id}
                  className="border border-emerald-950/10 bg-white/68 p-6 shadow-[0_24px_70px_rgba(40,55,35,0.06)]"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-[#7c8576]">
                    {formatMisto(place)}
                  </p>
                  <h2 className="mt-3 font-serif text-3xl text-[#102417]">{contribution.nadpis}</h2>
                  <dl className="mt-5 grid gap-3 text-sm text-[#667062]">
                    <div>Vytvořeno: {formatCzechDate(contribution.vytvoreno)}</div>
                    <div>Upraveno: {formatCzechDate(contribution.upraveno)}</div>
                    <div>
                      Stav:{" "}
                      {hidden
                        ? "smazáno z webu"
                        : contribution.zverejneno
                          ? "zveřejněno"
                          : "čeká na potvrzení"}
                    </div>
                  </dl>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/moje-prispevky?token=${token}&edit=${contribution.id}`}
                      className="border border-emerald-900/22 px-4 py-2 text-sm font-semibold text-[#17331f]"
                    >
                      Upravit
                    </Link>
                    {!hidden ? (
                      <form action={deleteContributionAction} className="flex flex-col gap-3">
                        <input type="hidden" name="token" value={token} />
                        <input type="hidden" name="id" value={contribution.id} />
                        <label className="text-xs text-[#667062]">
                          <input type="checkbox" required className="mr-2 accent-emerald-800" />
                          Opravdu chcete tento příspěvek smazat z webu?
                        </label>
                        <button
                          type="submit"
                          className="w-fit border border-red-900/22 px-4 py-2 text-sm font-semibold text-red-900"
                        >
                          Smazat z webu
                        </button>
                      </form>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="border border-emerald-950/10 bg-white/70 p-6 shadow-[0_24px_70px_rgba(40,55,35,0.06)] sm:p-8">
            {editContribution ? (
              <form action={updateContributionAction} className="grid gap-5">
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="id" value={editContribution.id} />
                <h2 className="font-serif text-4xl text-[#102417]">Upravit příspěvek</h2>
                <label className="grid gap-2 text-sm font-medium text-[#334235]">
                  Jméno autora
                  <input
                    name="jmeno_autora"
                    defaultValue={editContribution.jmeno_autora || ""}
                    className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-[#334235]">
                  Nadpis
                  <input
                    name="nadpis"
                    defaultValue={editContribution.nadpis}
                    className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-[#334235]">
                  Text příspěvku
                  <textarea
                    name="text_prispevku"
                    rows={7}
                    defaultValue={editContribution.text_prispevku || ""}
                    className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-[#334235]">
                  YouTube URL
                  <input
                    name="video_url"
                    defaultValue={editContribution.video_url || ""}
                    className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-[#334235]">
                  Popis videa
                  <input
                    name="popis_videa"
                    defaultValue={editContribution.popis_videa || ""}
                    className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-[#334235]">
                  Web obce
                  <input
                    name="web_obce"
                    defaultValue={editContribution.web_obce || ""}
                    className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3"
                  />
                </label>
                <button
                  type="submit"
                  className="w-fit bg-[#17331f] px-6 py-3 text-sm font-semibold text-white"
                >
                  Uložit příspěvek
                </button>
              </form>
            ) : (
              <div>
                <h2 className="font-serif text-4xl text-[#102417]">Vyberte příspěvek</h2>
                <p className="mt-4 text-sm leading-7 text-[#667062]">
                  Tlačítkem Upravit u konkrétního příspěvku otevřete formulář s jeho aktuálními
                  hodnotami.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
