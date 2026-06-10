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
      items: ContributionTextInline[][];
      type: "ul";
    };

const allowedContributionHtmlTags = new Set(["p", "br", "strong", "ul", "li", "h2"]);

export function sanitizePlainText(value: string, maxLength = 1_000) {
  return value
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeContributionText(value: string) {
  const normalized = value
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .slice(0, contributionTextLimits.contributionText);

  if (looksLikeHtml(normalized)) {
    return sanitizeContributionHtml(normalized);
  }

  return normalized;
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

  if (looksLikeHtml(text)) {
    return parseContributionHtml(text);
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
        type: "h2",
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
  const plain = htmlToPlainText(sanitizeContributionText(value || ""))
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

export function contributionTextToEditorHtml(value: string | null | undefined) {
  const text = sanitizeContributionText(value || "");

  if (!text) {
    return "";
  }

  if (looksLikeHtml(text)) {
    return text;
  }

  return renderContributionBlocksToHtml(parseContributionText(text));
}

export function plainTextToContributionHtml(value: string) {
  const paragraphs = sanitizePlainText(value, contributionTextLimits.contributionText)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function sanitizeContributionHtml(value: string) {
  return value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*b(\s[^>]*)?>/gi, "<strong>")
    .replace(/<\s*\/\s*b\s*>/gi, "</strong>")
    .replace(/<\s*(h[1-6])(\s[^>]*)?>/gi, "<h2>")
    .replace(/<\s*\/\s*h[1-6]\s*>/gi, "</h2>")
    .replace(/<\s*(div|section|article)(\s[^>]*)?>/gi, "<p>")
    .replace(/<\s*\/\s*(div|section|article)\s*>/gi, "</p>")
    .replace(/<\s*span(\s[^>]*)?>/gi, "")
    .replace(/<\s*\/\s*span\s*>/gi, "")
    .replace(/<\s*([/]?)([a-z0-9]+)(?:\s[^>]*)?>/gi, (match, slash: string, tag: string) => {
      const normalizedTag = tag.toLowerCase();

      if (!allowedContributionHtmlTags.has(normalizedTag)) {
        return "";
      }

      if (normalizedTag === "br") {
        return "<br>";
      }

      return slash ? `</${normalizedTag}>` : `<${normalizedTag}>`;
    })
    .replace(/javascript:/gi, "")
    .trim();
}

function parseContributionHtml(value: string) {
  const html = sanitizeContributionHtml(value);
  const blocks: ContributionTextBlock[] = [];
  const blockPattern = /<(h2|p|ul)>([\s\S]*?)<\/\1>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = blockPattern.exec(html)) !== null) {
    const textBefore = htmlToPlainText(html.slice(lastIndex, match.index)).trim();

    if (textBefore) {
      blocks.push({
        lines: [parseInlineStrong(textBefore)],
        type: "p",
      });
    }

    const tag = match[1].toLowerCase();
    const content = match[2];

    if (tag === "h2") {
      blocks.push({
        children: parseHtmlInlineStrong(content),
        type: "h2",
      });
    }

    if (tag === "p") {
      blocks.push({
        lines: content.split(/<br\s*\/?>/i).map(parseHtmlInlineStrong),
        type: "p",
      });
    }

    if (tag === "ul") {
      const items = [...content.matchAll(/<li>([\s\S]*?)<\/li>/gi)].map((item) =>
        parseHtmlInlineStrong(item[1]),
      );

      if (items.length > 0) {
        blocks.push({
          items,
          type: "ul",
        });
      }
    }

    lastIndex = match.index + match[0].length;
  }

  const textAfter = htmlToPlainText(html.slice(lastIndex)).trim();

  if (textAfter) {
    blocks.push({
      lines: [parseInlineStrong(textAfter)],
      type: "p",
    });
  }

  if (blocks.length === 0) {
    return [
      {
        lines: [parseInlineStrong(htmlToPlainText(html))],
        type: "p" as const,
      },
    ];
  }

  return blocks;
}

function parseHtmlInlineStrong(value: string): ContributionTextInline[] {
  const parts: ContributionTextInline[] = [];
  const pattern = /<strong>([\s\S]*?)<\/strong>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(value)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        text: htmlToPlainText(value.slice(lastIndex, match.index)),
        type: "text",
      });
    }

    parts.push({
      text: htmlToPlainText(match[1]),
      type: "strong",
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < value.length) {
    parts.push({
      text: htmlToPlainText(value.slice(lastIndex)),
      type: "text",
    });
  }

  return parts.filter((part) => part.text.length > 0);
}

function renderContributionBlocksToHtml(blocks: ContributionTextBlock[]) {
  return blocks
    .map((block) => {
      if (block.type === "h2") {
        return `<h2>${renderInlineToHtml(block.children)}</h2>`;
      }

      if (block.type === "ul") {
        return `<ul>${block.items
          .map((item) => `<li>${renderInlineToHtml(item)}</li>`)
          .join("")}</ul>`;
      }

      return `<p>${block.lines.map(renderInlineToHtml).join("<br>")}</p>`;
    })
    .join("");
}

function renderInlineToHtml(parts: ContributionTextInline[]) {
  return parts
    .map((part) =>
      part.type === "strong"
        ? `<strong>${escapeHtml(part.text)}</strong>`
        : escapeHtml(part.text),
    )
    .join("");
}

function htmlToPlainText(value: string) {
  return decodeHtmlEntities(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|h2|li)>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n"),
  ).trim();
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
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
