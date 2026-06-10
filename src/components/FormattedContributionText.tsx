import { parseContributionText, type ContributionTextInline } from "@/lib/sanitize";

type FormattedContributionTextProps = {
  text: string | null | undefined;
  variant?: "default" | "compact";
};

function renderInline(parts: ContributionTextInline[]) {
  return parts.map((part, index) =>
    part.type === "strong" ? (
      <strong className="font-semibold text-[#102417]" key={`${part.text}-${index}`}>
        {part.text}
      </strong>
    ) : part.type === "large" ? (
      <span className="cv-text-large" key={`${part.text}-${index}`}>
        {part.text}
      </span>
    ) : (
      <span key={`${part.text}-${index}`}>{part.text}</span>
    ),
  );
}

export function FormattedContributionText({
  text,
  variant = "default",
}: FormattedContributionTextProps) {
  const blocks = parseContributionText(text);

  if (blocks.length === 0) {
    return null;
  }

  const isCompact = variant === "compact";

  return (
    <div
      className={
        isCompact
          ? "cv-formatted-text formatted-contribution-text space-y-3 text-sm leading-7 text-[#515d50]"
          : "cv-formatted-text formatted-contribution-text space-y-6 text-lg leading-9 text-[#435143]"
      }
    >
      {blocks.map((block, index) => {
        if (block.type === "h2") {
          return (
            <h2
              className={
                isCompact
                  ? "font-serif text-2xl leading-tight text-[#102417]"
                  : "font-serif text-4xl leading-tight text-[#102417]"
              }
              key={index}
            >
              {renderInline(block.children)}
            </h2>
          );
        }

        if (block.type === "ul") {
          return (
            <ul className="list-disc space-y-2 pl-6" key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={index}>
            {block.lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 ? <br /> : null}
                {renderInline(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
