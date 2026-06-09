import { Hero } from "@/components/Hero";
import { MapSection } from "@/components/MapSection";
import { PublicContributions } from "@/components/PublicContributions";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SuccessToast } from "@/components/SuccessToast";

type HomePageProps = {
  searchParams: Promise<{
    odeslano?: string;
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const { odeslano } = await searchParams;

  return (
    <main className="min-h-screen overflow-hidden bg-[#f1f7f4] text-[#17251b]">
      <SiteHeader />
      {odeslano === "1" ? (
        <SuccessToast message="Děkujeme. Poslali jsme vám potvrzovací e-mail. Po kliknutí na odkaz v e-mailu se příspěvek zveřejní." />
      ) : null}
      <Hero />
      <PublicContributions />
      <MapSection />
      <SiteFooter />
    </main>
  );
}
