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

  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    console.log(`[ČeskáVesnice.cz e-mail] ${subject}\nKomu: ${to}\n${text}`);
  }

  if (!apiKey || !from) {
    if (isProduction) {
      throw new Error("Chybí nastavení pro odesílání e-mailů.");
    }

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

export async function sendManagementLinkEmail({
  managementUrl,
  to,
}: {
  managementUrl: string;
  to: string;
}) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`Správní odkaz pro úpravu příspěvků:\n${managementUrl}`);
  }

  await sendEmail({
    html: `<p>Dobrý den,</p>
<p>posíláme vám odkaz pro správu vašich příspěvků na webu ČeskáVesnice.cz.</p>
<p><a href="${managementUrl}">Otevřít moje příspěvky</a></p>
<p>Odkaz je časově omezený.</p>
<p>ČeskáVesnice.cz</p>`,
    subject: "Odkaz pro úpravu příspěvků – ČeskáVesnice.cz",
    text: `Dobrý den,

posíláme vám odkaz pro správu vašich příspěvků na webu ČeskáVesnice.cz.

Otevřít moje příspěvky:
${managementUrl}

Odkaz je časově omezený.

ČeskáVesnice.cz`,
    to,
  });
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
