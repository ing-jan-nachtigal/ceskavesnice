"use server";

import { getSiteUrl, sendEmail, sendManagementLinkEmail } from "@/lib/email";
import {
  formatMisto,
  supabaseRest,
  uploadContributionPhoto,
  type MistoRecord,
  type PrispevekRecord,
  type SpravniOdkazRecord,
} from "@/lib/supabase/server";
import { createToken, hashToken } from "@/lib/tokens";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionState = {
  message: string;
  ok: boolean;
};

const allowedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isYoutubeUrl(value: string) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    return ["youtube.com", "www.youtube.com", "youtu.be", "m.youtube.com"].includes(url.hostname);
  } catch {
    return false;
  }
}

function getPhotos(formData: FormData) {
  return formData
    .getAll("photos")
    .filter((file): file is File => file instanceof File && file.size > 0);
}

async function getMisto(id: number) {
  const params = new URLSearchParams({
    id: `eq.${id}`,
    limit: "1",
    select: "id,nazev,nazev_obce,okres,kraj",
  });
  const rows = await supabaseRest<MistoRecord[]>(`mista?${params.toString()}`);
  return rows[0];
}

export async function submitContributionAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (stringValue(formData, "website")) {
    return {
      message:
        "Děkujeme. Poslali jsme vám potvrzovací e-mail. Po kliknutí na odkaz v e-mailu se příspěvek zveřejní.",
      ok: true,
    };
  }

  const email = stringValue(formData, "email");
  const jmenoAutora = stringValue(formData, "jmeno_autora");
  const mistoId = Number(stringValue(formData, "misto_id"));
  const nadpis = stringValue(formData, "nadpis");
  const textPrispevku = stringValue(formData, "text_prispevku");
  const videoUrl = stringValue(formData, "video_url");
  const popisVidea = stringValue(formData, "popis_videa");
  const webObce = stringValue(formData, "web_obce");
  const souhlas = formData.get("souhlas") === "on";
  const photos = getPhotos(formData);

  if (!email || !email.includes("@")) {
    return { message: "Vyplňte prosím platný e-mail autora.", ok: false };
  }

  if (!mistoId) {
    return { message: "Vyberte prosím místo z našeho vyhledávání.", ok: false };
  }

  if (!nadpis) {
    return { message: "Vyplňte prosím nadpis příspěvku.", ok: false };
  }

  if (!souhlas) {
    return { message: "Bez souhlasu se zveřejněním nemůžeme příspěvek přijmout.", ok: false };
  }

  if (!textPrispevku && !videoUrl && photos.length === 0) {
    return {
      message: "Doplňte prosím text, YouTube video nebo alespoň jednu fotografii.",
      ok: false,
    };
  }

  if (!isYoutubeUrl(videoUrl)) {
    return { message: "YouTube odkaz není ve správném tvaru.", ok: false };
  }

  if (photos.length > 5) {
    return { message: "Můžete nahrát nejvýše 5 fotografií.", ok: false };
  }

  for (const photo of photos) {
    if (!allowedPhotoTypes.has(photo.type)) {
      return { message: "Podporované jsou fotografie JPG, PNG a WebP.", ok: false };
    }

    if (photo.size > 8 * 1024 * 1024) {
      return { message: "Fotografie je příliš velká. Nahrajte prosím menší soubor.", ok: false };
    }
  }

  try {
    const misto = await getMisto(mistoId);

    if (!misto) {
      return { message: "Vybrané místo se nepodařilo ověřit.", ok: false };
    }

    const token = createToken();
    const tokenHash = hashToken(token);
    const inserted = await supabaseRest<PrispevekRecord[]>("prispevky", {
      body: JSON.stringify({
        email,
        id_mista: mistoId,
        jmeno_autora: jmenoAutora || null,
        nadpis,
        popis_videa: popisVidea || null,
        potvrzovaci_token_hash: tokenHash,
        smazano_autorem_v: null,
        text_prispevku: textPrispevku || null,
        upraveno: null,
        video_url: videoUrl || null,
        vytvoreno: new Date().toISOString(),
        web_obce: webObce || null,
        zverejneno: false,
      }),
      method: "POST",
      prefer: "return=representation",
    });

    const contribution = inserted[0];
    const photoPaths: Record<string, string> = {};

    try {
      for (let index = 0; index < photos.length; index += 1) {
        const path = await uploadContributionPhoto(contribution.id, index + 1, photos[index]);
        photoPaths[`foto_${index + 1}`] = path;
      }

      if (Object.keys(photoPaths).length > 0) {
        await supabaseRest(`prispevky?id=eq.${contribution.id}`, {
          body: JSON.stringify(photoPaths),
          method: "PATCH",
        });
      }
    } catch (error) {
      console.error("Contribution photo processing or upload failed", error);

      return {
        message: "Fotografii se nepodařilo zpracovat. Zkuste prosím jiný obrázek.",
        ok: false,
      };
    }

    const confirmUrl = `${getSiteUrl()}/potvrdit-prispevek?token=${token}`;

    try {
      await sendEmail({
        html: `<p>Dobrý den,</p><p>děkujeme za příspěvek „${nadpis}“ pro ${formatMisto(
          misto,
        )}.</p><p>Potvrďte jej prosím kliknutím na odkaz: <a href="${confirmUrl}">${confirmUrl}</a></p><p>Po potvrzení se příspěvek zveřejní na ČeskáVesnice.cz.</p>`,
        subject: `Potvrzení příspěvku: ${nadpis}`,
        text: `ČeskáVesnice.cz\n\nPříspěvek: ${nadpis}\nMísto: ${formatMisto(
          misto,
        )}\n\nPotvrzovací odkaz: ${confirmUrl}\n\nPo potvrzení se příspěvek zveřejní.`,
        to: email,
      });
    } catch (error) {
      console.error("Contribution confirmation email failed", error);

      return {
        message:
          "Příspěvek jsme přijali, ale nepodařilo se odeslat potvrzovací e-mail. Zkuste to prosím později nebo napište správci projektu.",
        ok: false,
      };
    }

    revalidatePath("/");

    return {
      message:
        "Děkujeme. Poslali jsme vám potvrzovací e-mail. Po kliknutí na odkaz v e-mailu se příspěvek zveřejní.",
      ok: true,
    };
  } catch (error) {
    console.error("Contribution submit failed", error);

    return {
      message: "Příspěvek se nepodařilo odeslat. Zkuste to prosím později.",
      ok: false,
    };
  }
}

export async function requestManagementLinkAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = stringValue(formData, "email").toLowerCase();
  const successMessage =
    "Pokud k tomuto e-mailu existují příspěvky, poslali jsme odkaz pro jejich úpravu.";

  if (!email || !email.includes("@")) {
    return { message: "Vyplňte prosím platný e-mail.", ok: false };
  }

  console.log("[management-link] žádost přijata:", email);

  try {
    const contributionParams = new URLSearchParams({
      email: `eq.${email}`,
      limit: "1",
      select: "id",
    });
    const existingContributions = await supabaseRest<Array<Pick<PrispevekRecord, "id">>>(
      `prispevky?${contributionParams.toString()}`,
    );

    if (existingContributions.length === 0) {
      return {
        message: successMessage,
        ok: true,
      };
    }

    const token = createToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await supabaseRest("prispevky_spravni_odkazy", {
      body: JSON.stringify({
        email,
        platnost_do: expiresAt,
        token_hash: tokenHash,
      }),
      method: "POST",
    });
    console.log("[management-link] token uložen do DB:", email);

    const managementUrl = `${getSiteUrl()}/moje-prispevky?token=${token}`;
    console.log("[management-link] managementUrl:", managementUrl);
    console.log("[management-link] volám sendManagementLinkEmail:", email);
    await sendManagementLinkEmail({
      managementUrl,
      to: email,
    });
    console.log("[management-link] e-mail odeslán:", email);

    return {
      message: successMessage,
      ok: true,
    };
  } catch (error) {
    console.error("[management-link] chyba:", error);

    return {
      message: successMessage,
      ok: true,
    };
  }
}

export async function validateManagementToken(token: string) {
  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);
  const params = new URLSearchParams({
    limit: "1",
    platnost_do: `gte.${new Date().toISOString()}`,
    select: "id,email,token_hash,vytvoreno,platnost_do,naposledy_pouzito",
    token_hash: `eq.${tokenHash}`,
  });
  const rows = await supabaseRest<SpravniOdkazRecord[]>(
    `prispevky_spravni_odkazy?${params.toString()}`,
  );
  const link = rows[0];

  if (!link) {
    return null;
  }

  await supabaseRest(`prispevky_spravni_odkazy?id=eq.${link.id}`, {
    body: JSON.stringify({
      naposledy_pouzito: new Date().toISOString(),
    }),
    method: "PATCH",
  });

  return link;
}

export async function updateContributionAction(formData: FormData) {
  const token = stringValue(formData, "token");
  const id = Number(stringValue(formData, "id"));
  const session = await validateManagementToken(token);

  if (!token || !id || !session) {
    redirect("/moje-prispevky?error=missing");
  }

  const body = {
    jmeno_autora: stringValue(formData, "jmeno_autora") || null,
    nadpis: stringValue(formData, "nadpis"),
    popis_videa: stringValue(formData, "popis_videa") || null,
    text_prispevku: stringValue(formData, "text_prispevku") || null,
    upraveno: new Date().toISOString(),
    video_url: stringValue(formData, "video_url") || null,
    web_obce: stringValue(formData, "web_obce") || null,
  };

  try {
    await supabaseRest(`prispevky?id=eq.${id}&email=eq.${encodeURIComponent(session.email)}`, {
      body: JSON.stringify(body),
      method: "PATCH",
    });
  } catch (error) {
    console.error("Contribution update failed", error);
    redirect(`/moje-prispevky?token=${token}&chyba=ulozeni`);
  }

  revalidatePath("/");
  redirect(`/moje-prispevky?token=${token}&ulozeno=1`);
}

export async function deleteContributionAction(formData: FormData) {
  const token = stringValue(formData, "token");
  const id = Number(stringValue(formData, "id"));
  const session = await validateManagementToken(token);

  if (!token || !id || !session) {
    redirect("/moje-prispevky?error=missing");
  }

  try {
    await supabaseRest(`prispevky?id=eq.${id}&email=eq.${encodeURIComponent(session.email)}`, {
      body: JSON.stringify({
        smazano_autorem_v: new Date().toISOString(),
        upraveno: new Date().toISOString(),
        zverejneno: false,
      }),
      method: "PATCH",
    });
  } catch (error) {
    console.error("Contribution delete failed", error);
    redirect(`/moje-prispevky?token=${token}&chyba=smazani`);
  }

  revalidatePath("/");
  redirect(`/moje-prispevky?token=${token}&smazano=1`);
}
