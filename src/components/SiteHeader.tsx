"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteSearch } from "./SiteSearch";

const navItems = [
  { label: "Vesnice", href: "/#vesnice" },
  { label: "Mapa", href: "/#mapa" },
  { label: "Přidat příspěvek", href: "/pridat-prispevek" },
  { label: "Moje příspěvky", href: "/upravit-prispevky" },
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/35 bg-[#f3f8f3]/55 backdrop-blur-xl">
      <nav className="mx-auto grid min-h-16 max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-5 py-3 sm:px-8 lg:grid-cols-[auto_minmax(260px,420px)_auto]">
        <Link href="/" className="font-serif text-xl font-semibold tracking-normal text-[#17331f]">
          ČeskáVesnice.cz
        </Link>

        <div className="hidden lg:block">
          <SiteSearch />
        </div>

        <div className="hidden items-center gap-6 text-sm font-extrabold uppercase tracking-[0.18em] text-[#27382b] lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[#0d2415]">
              {item.label}
            </Link>
          ))}
        </div>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-label="Otevřít menu"
          onClick={() => setIsOpen((value) => !value)}
          className="btn-3d btn-secondary grid size-10 place-items-center lg:hidden"
        >
          <span className="grid gap-1.5">
            <span className="block h-0.5 w-5 bg-[#17331f]" />
            <span className="block h-0.5 w-5 bg-[#17331f]" />
            <span className="block h-0.5 w-5 bg-[#17331f]" />
          </span>
        </button>
      </nav>
      {isOpen ? (
        <div className="border-t border-emerald-950/10 bg-[#f3f8f3]/95 px-5 py-4 shadow-[0_18px_40px_rgba(40,55,35,0.14)] lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-3">
            <SiteSearch />
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="px-2 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-[#27382b] transition hover:text-[#0d2415]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
