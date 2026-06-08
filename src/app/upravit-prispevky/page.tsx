import { ManagementLinkForm } from "@/components/ManagementLinkForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Úprava mých příspěvků - ČeskáVesnice.cz",
  description:
    "Nechte si poslat soukromý odkaz pro úpravu nebo smazání vlastních příspěvků na ČeskáVesnice.cz.",
};

export default function EditContributionsRequestPage() {
  return (
    <main className="min-h-screen bg-[#f1f7f4] text-[#17251b]">
      <SiteHeader />

      <section className="px-5 pb-20 pt-28 sm:px-8 lg:pb-28 lg:pt-36">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_0.75fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-800/70">
              soukromý odkaz
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-tight text-[#102417] sm:text-7xl">
              Úprava mých příspěvků
            </h1>
            <p className="mt-7 max-w-3xl text-xl leading-9 text-[#435143]">
              Zadejte e-mail, kterým jste příspěvek vložili. Pošleme vám odkaz,
              přes který uvidíte svoje příspěvky a budete je moci upravit nebo
              smazat z webu.
            </p>
          </div>

          <section className="border border-emerald-950/10 bg-white/72 p-6 shadow-[0_24px_70px_rgba(40,55,35,0.08)] sm:p-8">
            <h2 className="font-serif text-3xl text-[#102417]">Poslat odkaz</h2>
            <p className="mt-4 text-sm leading-7 text-[#667062]">
              Odkaz je časově omezený a patří jen k zadanému e-mailu. Není potřeba
              registrace, heslo ani veřejný profil.
            </p>
            <ManagementLinkForm />
          </section>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
