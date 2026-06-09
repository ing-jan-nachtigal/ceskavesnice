"use client";

import type { MapPlace } from "@/lib/map-types";
import { cleanDistrict } from "@/lib/places";
import { useEffect, useRef, useState } from "react";

type PlacesMapProps = {
  places: MapPlace[];
};

type LeafletMarker = {
  addTo(map: LeafletMap): LeafletMarker;
  bindPopup(html: string): LeafletMarker;
  on(event: "click", handler: () => void): LeafletMarker;
  openPopup(): void;
};

type LeafletMap = {
  fitBounds(bounds: unknown, options?: { padding?: [number, number] }): void;
  remove(): void;
  setView(center: [number, number], zoom: number): void;
};

type LeafletStatic = {
  divIcon(options: {
    className?: string;
    html: string;
    iconAnchor?: [number, number];
    iconSize?: [number, number];
  }): unknown;
  latLngBounds(points: [number, number][]): unknown;
  map(element: HTMLElement, options?: { scrollWheelZoom?: boolean }): LeafletMap;
  marker(position: [number, number], options?: { icon?: unknown }): LeafletMarker;
  tileLayer(
    url: string,
    options?: { attribution?: string; maxZoom?: number },
  ): { addTo(map: LeafletMap): void };
};

declare global {
  interface Window {
    L?: LeafletStatic;
  }
}

const leafletCssUrl = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const leafletScriptUrl = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
let leafletPromise: Promise<LeafletStatic> | null = null;

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadLeaflet() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Leaflet is available only in the browser."));
  }

  if (window.L) {
    return Promise.resolve(window.L);
  }

  if (leafletPromise) {
    return leafletPromise;
  }

  leafletPromise = new Promise<LeafletStatic>((resolve, reject) => {
    if (!document.querySelector(`link[href="${leafletCssUrl}"]`)) {
      const link = document.createElement("link");
      link.href = leafletCssUrl;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${leafletScriptUrl}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (window.L) {
          resolve(window.L);
        } else {
          reject(new Error("Leaflet se nepodařilo načíst."));
        }
      });
      existingScript.addEventListener("error", () =>
        reject(new Error("Leaflet se nepodařilo načíst.")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = leafletScriptUrl;
    script.async = true;
    script.onload = () => {
      if (window.L) {
        resolve(window.L);
      } else {
        reject(new Error("Leaflet se nepodařilo načíst."));
      }
    };
    script.onerror = () => reject(new Error("Leaflet se nepodařilo načíst."));
    document.body.appendChild(script);
  });

  return leafletPromise;
}

function markerHtml(place: MapPlace) {
  const href = `/mista/${place.id}`;

  return `
    <div class="cv-map-marker">
      <a class="cv-map-dot-link" aria-label="${escapeHtml(place.nazev)}" href="${href}">
        <span class="cv-map-dot" aria-hidden="true"></span>
      </a>
      <a class="cv-map-label" href="${href}">${escapeHtml(place.nazev)}</a>
    </div>
  `;
}

function popupHtml(place: MapPlace) {
  const district = cleanDistrict(place.okres);
  const villageLine =
    place.nazev_obce && place.nazev_obce !== place.nazev
      ? `<p class="cv-map-popup-muted">${escapeHtml(place.nazev_obce)}</p>`
      : "";

  return `
    <div class="cv-map-popup">
      <strong>${escapeHtml(place.nazev)}</strong>
      ${villageLine}
      <p>okres ${escapeHtml(district)} · ${escapeHtml(place.kraj || "kraj neuveden")}</p>
      <p>Počet příspěvků: ${escapeHtml(place.pocet_prispevku)}</p>
      <a href="/mista/${place.id}">Zobrazit příspěvky</a>
    </div>
  `;
}

export function PlacesMap({ places }: PlacesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const container = mapRef.current;
    let map: LeafletMap | null = null;
    let cancelled = false;

    if (!container) {
      return undefined;
    }

    loadLeaflet()
      .then((leaflet) => {
        if (cancelled) {
          return;
        }

        map = leaflet.map(container, {
          scrollWheelZoom: false,
        });
        map.setView([49.55, 14.6], 7);

        leaflet
          .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 18,
          })
          .addTo(map);

        const bounds: [number, number][] = [];

        for (const place of places) {
          const position: [number, number] = [place.zemepisna_sirka, place.zemepisna_delka];
          bounds.push(position);

          const marker = leaflet
            .marker(position, {
              icon: leaflet.divIcon({
                className: "cv-map-marker-wrapper",
                html: markerHtml(place),
                iconAnchor: [10, 14],
                iconSize: [180, 30],
              }),
            })
            .addTo(map);

          marker.bindPopup(popupHtml(place));
          marker.on("click", () => marker.openPopup());
        }

        if (bounds.length > 1) {
          map.fitBounds(leaflet.latLngBounds(bounds), {
            padding: [36, 36],
          });
        } else if (bounds.length === 1) {
          map.setView(bounds[0], 11);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Mapu se nepodařilo načíst. Zkuste prosím stránku obnovit.");
        }
      });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [places]);

  return (
    <div className="relative min-h-[520px] overflow-hidden rounded-3xl border border-emerald-950/10 bg-[#dfece5] shadow-[0_30px_90px_rgba(45,67,43,0.12)]">
      <div ref={mapRef} className="absolute inset-0 z-0" />
      {error ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-[#eef7f6]/92 px-6 text-center text-sm leading-7 text-[#667062]">
          {error}
        </div>
      ) : null}
      {places.length === 0 && !error ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-[#eef7f6]/92 px-6 text-center text-sm leading-7 text-[#667062]">
          Na mapě se zobrazí první místa, jakmile budou mít zveřejněný příspěvek a GPS souřadnice.
        </div>
      ) : null}
    </div>
  );
}
