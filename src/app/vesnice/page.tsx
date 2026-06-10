import { PublicContributions } from "@/components/PublicContributions";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  description:
    "Veřejné příspěvky, fotografie, videa a vzpomínky z českých vesnic v projektu ČeskáVesnice.cz.",
  title: "Vesnice v kronice - ČeskáVesnice.cz",
};

export const dynamic = "force-dynamic";

export default function VillagesPage() {
  return (
    <main className="min-h-screen bg-[#f1f7f4] text-[#17251b]">
      <SiteHeader />
      <section className="px-5 pb-8 pt-28 sm:px-8 lg:pt-36">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-800/70">
            veřejná kronika
          </p>
          <h1 className="mt-5 font-serif text-5xl leading-tight text-[#102417] sm:text-7xl">
            Vesnice v kronice
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-9 text-[#435143]">
            Přehled zveřejněných příspěvků z míst, která už v digitální kronice žijí.
          </p>
        </div>
      </section>
      <PublicContributions />
      <SiteFooter />
    </main>
  );
}
