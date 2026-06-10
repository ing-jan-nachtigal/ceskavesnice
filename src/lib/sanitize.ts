export const contributionTextLimits = {
  authorName: 120,
  contributionText: 12_000,
  email: 254,
  title: 160,
  url: 500,
  videoDescription: 220,
};

export type ContributionTextInline =
  | {
      text: string;
      type: "text";
    }
  | {
      text: string;
      type: "strong";
    };

export type ContributionTextBlock =
  | {
      lines: ContributionTextInline[][];
      type: "p";
    }
  | {
      children: ContributionTextInline[];
      type: "h2";
    }
  | {
      children: ContributionTextInline[];
      type: "h3";
    }
  | {
      items: ContributionTextInline[][];
      type: "ul";
    };

export function sanitizePlainText(value: string, maxLength = 1_000) {
  return value
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeContributionText(value: string) {
  return sanitizePlainText(value, contributionTextLimits.contributionText);
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= contributionTextLimits.email;
}

export function validateYoutubeUrl(value: string) {
  if (!value) {
    return true;
  }

  if (value.length > contributionTextLimits.url) {
    return false;
  }

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");

    return ["youtube.com", "m.youtube.com", "youtu.be"].includes(host);
  } catch {
    return false;
  }
}

export function validateExternalUrl(value: string) {
  if (!value) {
    return true;
  }

  if (value.length > contributionTextLimits.url) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function parseContributionText(value: string | null | undefined) {
  const text = sanitizeContributionText(value || "");

  if (!text) {
    return [] as ContributionTextBlock[];
  }

  const blocks: ContributionTextBlock[] = [];
  const paragraphLines: string[] = [];
  let listItems: string[] = [];

  function flushParagraph() {
    if (paragraphLines.length === 0) {
      return;
    }

    blocks.push({
      lines: paragraphLines.map(parseInlineStrong),
      type: "p",
    });
    paragraphLines.length = 0;
  }

  function flushList() {
    if (listItems.length === 0) {
      return;
    }

    blocks.push({
      items: listItems.map(parseInlineStrong),
      type: "ul",
    });
    listItems = [];
  }

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({
        children: parseInlineStrong(line.slice(3).trim()),
        type: "h2",
      });
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({
        children: parseInlineStrong(line.slice(4).trim()),
        type: "h3",
      });
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      listItems.push(line.slice(2).trim());
      continue;
    }

    flushList();
    paragraphLines.push(rawLine.trimEnd());
  }

  flushParagraph();
  flushList();

  return blocks;
}

export function contributionTextToPlainExcerpt(
  value: string | null | undefined,
  maxLength = 160,
) {
  const plain = sanitizeContributionText(value || "")
    .split("\n")
    .map((line) => line.replace(/^#{2,3}\s+/, "").replace(/^-\s+/, ""))
    .join(" ")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  if (!plain) {
    return "Příspěvek zatím nemá textový úvod.";
  }

  return plain.length > maxLength ? `${plain.slice(0, maxLength - 3)}...` : plain;
}

function parseInlineStrong(value: string): ContributionTextInline[] {
  const parts: ContributionTextInline[] = [];
  const pattern = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(value)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        text: value.slice(lastIndex, match.index),
        type: "text",
      });
    }

    parts.push({
      text: match[1],
      type: "strong",
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < value.length) {
    parts.push({
      text: value.slice(lastIndex),
      type: "text",
    });
  }

  return parts.length > 0 ? parts : [{ text: "", type: "text" }];
}
