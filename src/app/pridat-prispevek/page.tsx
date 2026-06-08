import { ContributionForms } from "@/components/ContributionForms";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const runtime = "nodejs";

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

      <ContributionForms />

      <SiteFooter />
    </main>
  );
}
