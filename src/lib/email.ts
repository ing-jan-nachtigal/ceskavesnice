import "server-only";

type EmailParams = {
  html: string;
  subject: string;
  text: string;
  to: string;
};

export async function sendEmail({ html, subject, text, to }: EmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (process.env.NODE_ENV !== "production") {
    console.log(`[ČeskáVesnice.cz e-mail] ${subject}\nKomu: ${to}\n${text}`);
  }

  if (!apiKey || !from) {
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from,
      html,
      subject,
      text,
      to,
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "E-mail se nepodařilo odeslat.");
  }
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
