import { Hero } from "@/components/Hero";
import { MapSection } from "@/components/MapSection";
import { PublicContributions } from "@/components/PublicContributions";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f1f7f4] text-[#17251b]">
      <SiteHeader />
      <Hero />
      <PublicContributions />
      <MapSection />
      <SiteFooter />
    </main>
  );
}
