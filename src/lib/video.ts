export type VideoProvider = "vimeo" | "youtube";

export type VideoInfo = {
  embedUrl: string | null;
  provider: VideoProvider;
  thumbnailUrl: string | null;
  url: string;
  videoId: string;
};

export function getYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return parsed.pathname.split("/").filter(Boolean)[0] || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }

      const [kind, id] = parsed.pathname.split("/").filter(Boolean);

      if (["embed", "shorts"].includes(kind)) {
        return id || null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function getVimeoVideoId(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (!["vimeo.com", "player.vimeo.com"].includes(host)) {
      return null;
    }

    const parts = parsed.pathname.split("/").filter(Boolean);

    if (host === "player.vimeo.com" && parts[0] === "video") {
      return /^\d+$/.test(parts[1] || "") ? parts[1] : null;
    }

    const numericPart = parts.find((part) => /^\d+$/.test(part));
    return numericPart || null;
  } catch {
    return null;
  }
}

export function getVideoInfo(url: string | null | undefined): VideoInfo | null {
  if (!url) {
    return null;
  }

  const youtubeId = getYouTubeVideoId(url);

  if (youtubeId) {
    return {
      embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
      provider: "youtube",
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
      url,
      videoId: youtubeId,
    };
  }

  const vimeoId = getVimeoVideoId(url);

  if (vimeoId) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
      provider: "vimeo",
      thumbnailUrl: null,
      url,
      videoId: vimeoId,
    };
  }

  return null;
}

export function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  const info = getVideoInfo(url);
  return info?.embedUrl ?? null;
}

export function getYouTubeThumbnailUrl(url: string | null | undefined): string | null {
  const info = getVideoInfo(url);
  return info?.thumbnailUrl ?? null;
}
