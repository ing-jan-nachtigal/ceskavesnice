import { getSiteUrl } from "@/lib/email";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl().replace(/\/$/, "");

  return {
    rules: {
      allow: "/",
      disallow: ["/moje-prispevky", "/potvrdit-prispevek", "/upravit-prispevky"],
      userAgent: "*",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
