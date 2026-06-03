import { Hero } from "@/components/Hero";
import { MapSection } from "@/components/MapSection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { VillageCards } from "@/components/VillageCards";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f1f7f4] text-[#17251b]">
      <SiteHeader />
      <Hero />
      <VillageCards />
      <MapSection />
      <SiteFooter />
    </main>
  );
}
