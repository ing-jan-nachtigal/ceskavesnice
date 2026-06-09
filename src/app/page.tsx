import { Hero } from "@/components/Hero";
import { MapSection } from "@/components/MapSection";
import { PublicContributions } from "@/components/PublicContributions";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

type HomePageProps = {
  searchParams: Promise<{
    odeslano?: string;
  }>;
};

function ContributionSubmittedNotice() {
  return (
    <section className="bg-[#f7f5ed] px-5 pt-10 sm:px-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-emerald-700/18 bg-emerald-50 px-5 py-5 text-[#17331f] shadow-[0_18px_48px_rgba(32,84,52,0.16)] sm:px-7">
        <div className="flex gap-4">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-700 text-lg font-bold text-white">
            ✓
          </div>
          <p className="text-base font-semibold leading-8 sm:text-lg">
            Děkujeme. Poslali jsme vám potvrzovací e-mail. Po kliknutí na odkaz v
            e-mailu se příspěvek zveřejní.
          </p>
        </div>
      </div>
    </section>
  );
}

export default async function Home({ searchParams }: HomePageProps) {
  const { odeslano } = await searchParams;

  return (
    <main className="min-h-screen overflow-hidden bg-[#f1f7f4] text-[#17251b]">
      <SiteHeader />
      <Hero />
      {odeslano === "1" ? <ContributionSubmittedNotice /> : null}
      <PublicContributions />
      <MapSection />
      <SiteFooter />
    </main>
  );
}
