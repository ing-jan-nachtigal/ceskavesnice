import Link from "next/link";

export function SiteFooter() {
  return (
    <footer
      id="kontakt"
      className="border-t border-emerald-950/10 bg-[#102417] px-5 py-10 text-sm text-lime-50/55 sm:px-8"
    >
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <p className="font-serif text-xl font-semibold tracking-normal text-white">
            ČeskáVesnice.cz
          </p>
          <p className="mt-2">digitální krajinná kronika</p>
          <p className="mt-5 max-w-xl leading-7 text-lime-50/62">
            Máte dotaz, připomínku nebo chcete nahlásit chybu? Napište správci
            projektu.
          </p>
        </div>
        <div className="space-y-3 md:text-right">
          <div className="text-lime-50/72">
            <p>Správce projektu: Jan Nachtigal</p>
            <p>
              E-mail:{" "}
              <a href="mailto:ili@ili.cz" className="text-white transition hover:text-lime-100">
                ili@ili.cz
              </a>
            </p>
          </div>
          <Link href="/#hero" className="transition hover:text-white">
            nahoru
          </Link>
        </div>
      </div>
    </footer>
  );
}
