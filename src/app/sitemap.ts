import { getSiteUrl } from "@/lib/email";
import {
  isServerSupabaseConfigured,
  supabaseRest,
  type PrispevekRecord,
} from "@/lib/supabase/server";
import type { MetadataRoute } from "next";

type SitemapContribution = Pick<
  PrispevekRecord,
  "id" | "id_mista" | "potvrzeno_v" | "upraveno" | "vytvoreno"
>;

export const revalidate = 3600;

function siteUrl() {
  return getSiteUrl().replace(/\/$/, "");
}

function bestModifiedDate(contribution: SitemapContribution) {
  return new Date(contribution.upraveno || contribution.potvrzeno_v || contribution.vytvoreno);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteUrl();
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      changeFrequency: "daily",
      lastModified: now,
      priority: 1,
      url: `${baseUrl}/`,
    },
    {
      changeFrequency: "daily",
      lastModified: now,
      priority: 0.7,
      url: `${baseUrl}/mapa`,
    },
    {
      changeFrequency: "daily",
      lastModified: now,
      priority: 0.7,
      url: `${baseUrl}/vesnice`,
    },
    {
      changeFrequency: "monthly",
      lastModified: now,
      priority: 0.5,
      url: `${baseUrl}/pridat-prispevek`,
    },
  ];

  if (!isServerSupabaseConfigured()) {
    return staticRoutes;
  }

  try {
    const contributions = await supabaseRest<SitemapContribution[]>(
      "prispevky?select=id,id_mista,vytvoreno,upraveno,potvrzeno_v&zverejneno=eq.true&smazano_autorem_v=is.null&order=vytvoreno.desc&limit=50000",
    );
    const placeModifiedDates = new Map<number, Date>();

    for (const contribution of contributions) {
      const modified = bestModifiedDate(contribution);
      const current = placeModifiedDates.get(contribution.id_mista);

      if (!current || modified > current) {
        placeModifiedDates.set(contribution.id_mista, modified);
      }
    }

    return [
      ...staticRoutes,
      ...contributions.map((contribution) => ({
        changeFrequency: "weekly" as const,
        lastModified: bestModifiedDate(contribution),
        priority: 0.55,
        url: `${baseUrl}/prispevky/${contribution.id}`,
      })),
      ...[...placeModifiedDates.entries()].map(([placeId, lastModified]) => ({
        changeFrequency: "weekly" as const,
        lastModified,
        priority: 0.55,
        url: `${baseUrl}/mista/${placeId}`,
      })),
    ];
  } catch (error) {
    console.error("Sitemap generation failed", error);
    return staticRoutes;
  }
}
