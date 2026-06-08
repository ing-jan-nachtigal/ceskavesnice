import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { supabaseRest, type PrispevekRecord } from "@/lib/supabase/server";
import { hashToken } from "@/lib/tokens";

type ConfirmContributionPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export const metadata = {
  title: "Potvrzení příspěvku - ČeskáVesnice.cz",
};

async function confirmContribution(token: string | undefined) {
  if (!token) {
    return false;
  }

  try {
    const tokenHash = hashToken(token);
    const params = new URLSearchParams({
      limit: "1",
      potvrzovaci_token_hash: `eq.${tokenHash}`,
      potvrzeno_v: "is.null",
      select: "id",
    });
    const rows = await supabaseRest<Pick<PrispevekRecord, "id">[]>(
      `prispevky?${params.toString()}`,
    );
    const contribution = rows[0];

    if (!contribution) {
      return false;
    }

    await supabaseRest(`prispevky?id=eq.${contribution.id}`, {
      body: JSON.stringify({
        potvrzeno_v: new Date().toISOString(),
        zverejneno: true,
      }),
      method: "PATCH",
    });

    return true;
  } catch {
    return false;
  }
}

export default async function ConfirmContributionPage({
  searchParams,
}: ConfirmContributionPageProps) {
  const { token } = await searchParams;
  const confirmed = await confirmContribution(token);

  return (
    <main className="min-h-screen bg-[#f1f7f4] text-[#17251b]">
      <SiteHeader />
      <section className="px-5 py-28 sm:px-8 lg:py-36">
        <div className="mx-auto max-w-3xl border border-emerald-950/10 bg-white/70 p-8 shadow-[0_24px_70px_rgba(40,55,35,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-800/70">
            potvrzení příspěvku
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-tight text-[#102417]">
            {confirmed ? "Děkujeme." : "Odkaz nelze použít."}
          </h1>
          <p className="mt-6 text-lg leading-9 text-[#435143]">
            {confirmed
              ? "Děkujeme, váš příspěvek byl potvrzen a zveřejněn."
              : "Odkaz je neplatný nebo už byl použit."}
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
