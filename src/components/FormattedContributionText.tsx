import { contributionTextToSafeHtml } from "@/lib/sanitize";

type FormattedContributionTextProps = {
  text: string | null | undefined;
  variant?: "default" | "compact";
};

export function FormattedContributionText({
  text,
  variant = "default",
}: FormattedContributionTextProps) {
  const safeHtml = contributionTextToSafeHtml(text);

  if (!safeHtml) {
    return null;
  }

  return (
    <div
      className={
        variant === "compact"
          ? "cv-formatted-text cv-formatted-text--compact formatted-contribution-text space-y-3 text-sm leading-7 text-[#515d50]"
          : "cv-formatted-text formatted-contribution-text space-y-6 text-lg leading-9 text-[#435143]"
      }
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
