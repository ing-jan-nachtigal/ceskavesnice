import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { VillageAutocompleteField } from "@/components/VillageAutocompleteField";

const contributionTypes = [
  "Fotografie",
  "Video",
  "Text / vzpomínka",
  "Historická zajímavost",
  "Oprava existujícího záznamu",
  "Nová obec / místo",
];

export const metadata = {
  title: "Přidat příspěvek - ČeskáVesnice.cz",
  description:
    "Pošlete fotografii, video, vzpomínku nebo opravu k české obci do digitální kroniky.",
};

export default function AddContributionPage() {
  return (
    <main className="min-h-screen bg-[#f1f7f4] text-[#17251b]">
      <SiteHeader />

      <section className="px-5 pb-14 pt-28 sm:px-8 lg:pb-20 lg:pt-36">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-800/70">
              příspěvky do kroniky
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-tight text-[#102417] sm:text-7xl">
              Přidejte příspěvek do ČeskéVesnice.cz
            </h1>
            <p className="mt-7 max-w-3xl text-xl leading-9 text-[#435143]">
              Máte fotografie, video, vzpomínku nebo zajímavost ke své obci?
              Pomozte doplnit digitální kroniku českých vesnic.
            </p>
            <p className="mt-5 max-w-3xl border-l-2 border-emerald-800/28 pl-5 text-base leading-8 text-[#515d50]">
              Nemusíte znát GPS, okres ani kraj. Obec si později vyberete z
              ověřené databáze a technické údaje se doplní automaticky.
            </p>
          </div>
        </div>
      </section>

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
                Jediný nutný identifikátor autora bude e-mailová adresa. V
                budoucnu podle ní pošleme potvrzovací odkaz a soukromý kód pro
                úpravy příspěvku.
              </p>
            </div>

            <form className="grid gap-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-[#334235]">
                  E-mail autora
                  <input
                    type="email"
                    placeholder="vas@email.cz"
                    className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3 outline-none transition placeholder:text-[#8a9385] focus:border-emerald-800/45 focus:bg-white"
                  />
                </label>

                <VillageAutocompleteField />
              </div>

              <label className="grid gap-2 text-sm font-medium text-[#334235]">
                Typ příspěvku
                <select className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3 outline-none transition focus:border-emerald-800/45 focus:bg-white">
                  {contributionTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium text-[#334235]">
                Text příspěvku
                <textarea
                  rows={7}
                  placeholder="Napište vzpomínku, popis fotografie, historickou zajímavost nebo opravu záznamu."
                  className="resize-y border border-emerald-950/14 bg-[#f8faf4] px-4 py-3 outline-none transition placeholder:text-[#8a9385] focus:border-emerald-800/45 focus:bg-white"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-[#334235]">
                Odkaz na YouTube video
                <input
                  type="url"
                  placeholder="https://www.youtube.com/..."
                  className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3 outline-none transition placeholder:text-[#8a9385] focus:border-emerald-800/45 focus:bg-white"
                />
              </label>

              <div className="border border-dashed border-emerald-900/24 bg-[#eef7f6] p-5">
                <p className="text-sm font-medium text-[#334235]">
                  Nahrání fotografie / obrázku
                </p>
                <p className="mt-2 text-sm leading-7 text-[#667062]">
                  Zatím pouze UI placeholder. Později zde bude možné přidat
                  fotografii, sken nebo náhled videa.
                </p>
                <button
                  type="button"
                  className="mt-4 border border-emerald-900/20 px-4 py-2 text-sm font-semibold text-[#17331f]"
                >
                  Vybrat soubor
                </button>
              </div>

              <label className="flex gap-3 text-sm leading-7 text-[#515d50]">
                <input type="checkbox" className="mt-2 size-4 accent-emerald-800" />
                Souhlasím se zveřejněním zaslaného příspěvku po schválení
                správcem projektu.
              </label>

              <button
                type="button"
                className="w-fit bg-[#17331f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#214b2e]"
              >
                Odeslat ke schválení
              </button>
            </form>
          </section>

          <aside className="space-y-8">
            <section className="border border-emerald-950/10 bg-[#eef7f6] p-6 shadow-[0_24px_70px_rgba(40,55,35,0.06)] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-800/70">
                B) Upravit vlastní příspěvek
              </p>
              <h2 className="mt-4 font-serif text-4xl text-[#102417]">
                Upravit vlastní příspěvek
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#667062]">
                Po odeslání příspěvku obdrží autor na svůj e-mail soukromý
                odkaz nebo kód. Pomocí něj bude možné příspěvek upravit,
                doplnit, skrýt nebo požádat o jeho smazání.
              </p>

              <form className="mt-7 grid gap-5">
                <label className="grid gap-2 text-sm font-medium text-[#334235]">
                  E-mail autora
                  <input
                    type="email"
                    placeholder="vas@email.cz"
                    className="border border-emerald-950/14 bg-white/72 px-4 py-3 outline-none transition placeholder:text-[#8a9385] focus:border-emerald-800/45 focus:bg-white"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-[#334235]">
                  Soukromý kód nebo odkaz příspěvku
                  <input
                    type="text"
                    placeholder="Kód z e-mailu"
                    className="border border-emerald-950/14 bg-white/72 px-4 py-3 outline-none transition placeholder:text-[#8a9385] focus:border-emerald-800/45 focus:bg-white"
                  />
                </label>

                <button
                  type="button"
                  className="w-fit border border-emerald-900/22 px-5 py-3 text-sm font-semibold text-[#17331f] transition hover:border-emerald-800/45 hover:bg-white/60"
                >
                  Otevřít příspěvek
                </button>
              </form>
            </section>

            <section className="border border-emerald-950/10 bg-[#f7f5ed] p-6 sm:p-8">
              <h2 className="font-serif text-3xl text-[#102417]">Jak to bude fungovat</h2>
              <p className="mt-4 text-sm leading-7 text-[#667062]">
                Uživatel vloží e-mail, systém mu v budoucnu pošle potvrzovací
                odkaz a každý příspěvek půjde upravit pouze přes soukromý odkaz
                nebo kód zaslaný na e-mail. Bez registrací, hesel a veřejných
                profilů.
              </p>
            </section>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
