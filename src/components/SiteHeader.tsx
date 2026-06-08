import Link from "next/link";

const navItems = [
  { label: "Vesnice", href: "/#vesnice" },
  { label: "Mapa", href: "/#mapa" },
  { label: "Přidat příspěvek", href: "/pridat-prispevek" },
  { label: "Moje příspěvky", href: "/upravit-prispevky" },
];

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/35 bg-[#f3f8f3]/55 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="font-serif text-xl font-semibold tracking-normal text-[#17331f]">
          ČeskáVesnice.cz
        </Link>
        <div className="hidden items-center gap-7 text-xs uppercase tracking-[0.22em] text-[#334235] md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[#0d2415]">
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
