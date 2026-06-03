export type VillageGeoRecord = {
  name: string;
  slug: string;
  // Budoucí jednoznačný identifikátor z RÚIAN nebo jiného ověřeného veřejného registru.
  ruianCode: string;
  district: string;
  region: string;
  latitude: number;
  longitude: number;
  officialWebsite: string;
};

export type VillageEditorialContent = {
  shortDescription: string;
  history: string;
  youtubeUrl: string;
  galleryImages: string[];
  status: "published" | "prepared";
};

export type Village = {
  geo: VillageGeoRecord;
  content: VillageEditorialContent;
};

// Do budoucna mají být geografické údaje plněny z RÚIAN nebo jiného
// ověřeného veřejného registru obcí. Redakční obsah kroniky zůstává odděleně,
// aby se oficiální identita obce nemíchala s autorskými texty, videi a galerií.
export const villages: Village[] = [
  {
    geo: {
      name: "Sloučín",
      slug: "sloucin",
      ruianCode: "706914",
      district: "Strakonice",
      region: "Jihočeský kraj",
      latitude: 49.2552337,
      longitude: 13.8138529,
      officialWebsite: "https://www.novosedly.info/",
    },
    content: {
      shortDescription:
        "Malá jihočeská osada v krajině mezi Novosedly, Koclovem a Katovicemi, kde pole, sady a tiché cesty drží přirozené měřítko místa.",
      history:
        "Sloučín je katastrální území a místní část obce Novosedly u Strakonic. Patří do klidné zemědělské krajiny jihozápadních Čech, v níž se jednotlivé osady čtou spíše přes vztahy v krajině než přes velká centra. Veřejně dostupné zdroje uvádějí Sloučín jako jednu z částí Novosedel spolu s Koclovem a Novosedly u Strakonic. Tato stránka je první pracovní záznam kroniky a počítá s doplněním přesných fotografií, leteckého videa a místních vzpomínek.",
      youtubeUrl: "",
      galleryImages: ["/hero-sharp-spring-village.png"],
      status: "published",
    },
  },
  {
    geo: {
      name: "Makarov",
      slug: "makarov",
      ruianCode: "",
      district: "Strakonice",
      region: "Jihočeský kraj",
      latitude: 49.2479,
      longitude: 13.7969,
      officialWebsite: "",
    },
    content: {
      shortDescription:
        "Připravený záznam pro jihočeskou vesnici v okolí Novosedel a Kraselova.",
      history:
        "Záznam bude doplněn po ověření místních zdrojů, fotografií a vyprávění obyvatel.",
      youtubeUrl: "",
      galleryImages: ["/hero-sharp-spring-village.png"],
      status: "prepared",
    },
  },
  {
    geo: {
      name: "Kladruby",
      slug: "kladruby",
      ruianCode: "",
      district: "Strakonice",
      region: "Jihočeský kraj",
      latitude: 49.2756,
      longitude: 13.7697,
      officialWebsite: "",
    },
    content: {
      shortDescription:
        "Připravená karta pro obec v západní části Strakonicka, zatím bez úplného záznamu.",
      history:
        "Záznam bude doplněn po ověření historie, současné podoby obce a obrazových materiálů.",
      youtubeUrl: "",
      galleryImages: ["/hero-sharp-spring-village.png"],
      status: "prepared",
    },
  },
  {
    geo: {
      name: "Katovice",
      slug: "katovice",
      ruianCode: "",
      district: "Strakonice",
      region: "Jihočeský kraj",
      latitude: 49.2734,
      longitude: 13.8298,
      officialWebsite: "",
    },
    content: {
      shortDescription:
        "Připravený záznam pro sídlo u Otavy, které tvoří přirozený orientační bod okolní krajiny.",
      history:
        "Záznam bude doplněn po dopracování fotografií, leteckého videa a lokálních podkladů.",
      youtubeUrl: "",
      galleryImages: ["/hero-sharp-spring-village.png"],
      status: "prepared",
    },
  },
];

export const villageSearchOptions = villages.map(({ geo }) => ({
  label: `${geo.name} · okres ${geo.district}, ${geo.region}`,
  detail: `${geo.district}, ${geo.region} · ${geo.latitude.toFixed(5)} N / ${geo.longitude.toFixed(5)} E`,
  name: geo.name,
  slug: geo.slug,
  ruianCode: geo.ruianCode,
  district: geo.district,
  region: geo.region,
  latitude: geo.latitude,
  longitude: geo.longitude,
}));

export function getVillageBySlug(slug: string) {
  return villages.find((village) => village.geo.slug === slug);
}
