import Image from "next/image";

export function Hero() {
  return (
    <section id="hero" className="relative min-h-[96svh] bg-[#eef3e7]">
      <Image
        src="/hero-sharp-spring-village.png"
        alt="Ostrá jarní česká krajina s vesnicí, loukami a modrou oblohou"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,28,18,0.38),rgba(12,28,18,0.12)_42%,rgba(12,28,18,0.01)),linear-gradient(180deg,rgba(243,247,236,0.03),rgba(243,247,236,0)_48%,rgba(238,243,231,0.24))]" />

      <div className="relative z-10 mx-auto flex min-h-[96svh] max-w-7xl flex-col justify-center px-5 py-28 sm:px-8 lg:py-36">
        <div className="max-w-4xl animate-fade-in">
          <h1 className="brand-logo font-serif tracking-normal text-white drop-shadow-[0_8px_34px_rgba(12,24,16,0.28)]">
            <span>Česká</span>
            <span>Vesnice.cz</span>
          </h1>
          <p className="mt-8 max-w-2xl text-xl leading-9 text-white/92 sm:text-2xl">
            Objevujte české vesnice očima lidí, kteří je mají rádi.
          </p>
          <p className="mt-4 max-w-xl text-base leading-8 text-white/82 sm:text-lg">
            Letecké pohledy, fotografie a příběhy českých vesnic.
          </p>

          <a
            href="#vesnice"
            className="mt-10 inline-flex w-fit border border-white/48 bg-white/14 px-5 py-3 text-sm font-semibold tracking-[0.08em] text-white backdrop-blur-sm transition hover:border-lime-100/80 hover:bg-white/24"
          >
            Prohlédnout vesnice
          </a>
        </div>
      </div>
    </section>
  );
}
