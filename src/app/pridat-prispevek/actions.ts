"use server";

import { getSiteUrl, sendEmail, sendManagementLinkEmail } from "@/lib/email";
import {
  contributionTextLimits,
  isValidEmail,
  sanitizeContributionText,
  sanitizePlainText,
  validateExternalUrl,
  validateYoutubeUrl,
} from "@/lib/sanitize";
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
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

export type ActionState = {
  message: string;
  ok: boolean;
};

const allowedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const photoSlots = [1, 2, 3, 4, 5] as const;

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function plainValue(formData: FormData, key: string, maxLength: number) {
  return sanitizePlainText(stringValue(formData, key), maxLength);
}

function fileValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function getPhotoSlotFiles(formData: FormData) {
  const photo1 = fileValue(formData, "foto_1");
  const photo2 = fileValue(formData, "foto_2");
  const photo3 = fileValue(formData, "foto_3");
  const photo4 = fileValue(formData, "foto_4");
  const photo5 = fileValue(formData, "foto_5");

  return [
    { file: photo1, slot: 1 },
    { file: photo2, slot: 2 },
    { file: photo3, slot: 3 },
    { file: photo4, slot: 4 },
    { file: photo5, slot: 5 },
  ]
    .filter((entry): entry is { file: File; slot: (typeof photoSlots)[number] } =>
      Boolean(entry.file),
    );
}

function describePhotoFiles(photos: Array<{ file: File; slot: number }>) {
  return photos.map(({ file, slot }) => ({
    name: file.name,
    size: file.size,
    slot,
    type: file.type,
  }));
}

function validatePhotoFile(photo: File) {
  if (!allowedPhotoTypes.has(photo.type)) {
    return "Podporované jsou fotografie JPG, PNG a WebP.";
  }

  if (photo.size > 8 * 1024 * 1024) {
    return "Fotografie je příliš velká. Nahrajte prosím menší soubor.";
  }

  return null;
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
  console.log("[create-contribution] submit start");

  try {
  if (stringValue(formData, "website")) {
    return {
      message:
        "Děkujeme. Poslali jsme vám potvrzovací e-mail. Po kliknutí na odkaz v e-mailu se příspěvek zveřejní.",
      ok: true,
    };
  }

  const email = plainValue(formData, "email", contributionTextLimits.email).toLowerCase();
  const jmenoAutora = plainValue(formData, "jmeno_autora", contributionTextLimits.authorName);
  const mistoId = Number(stringValue(formData, "misto_id"));
  const nadpis = plainValue(formData, "nadpis", contributionTextLimits.title);
  const textPrispevku = sanitizeContributionText(stringValue(formData, "text_prispevku"));
  const videoUrl = plainValue(formData, "video_url", contributionTextLimits.url);
  const popisVidea = plainValue(
    formData,
    "popis_videa",
    contributionTextLimits.videoDescription,
  );
  const webObce = plainValue(formData, "web_obce", contributionTextLimits.url);
  const souhlas = formData.get("souhlas") === "on";
  const photos = getPhotoSlotFiles(formData);
  console.log("[create-contribution] form fields loaded");
  console.log("[create-contribution] photo fields:", describePhotoFiles(photos));

  if (!isValidEmail(email)) {
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
      message: "Doplňte prosím text, video nebo alespoň jednu fotografii.",
      ok: false,
    };
  }

  if (!validateYoutubeUrl(videoUrl)) {
    return { message: "Video odkaz musí vést na YouTube nebo Vimeo.", ok: false };
  }

  if (!validateExternalUrl(webObce)) {
    return { message: "Web obce musí začínat na http:// nebo https://.", ok: false };
  }

  if (photos.length > 5) {
    return { message: "Můžete nahrát nejvýše 5 fotografií.", ok: false };
  }

  for (const { file } of photos) {
    const photoError = validatePhotoFile(file);

    if (photoError) {
      return { message: photoError, ok: false };
    }
  }

  try {
    const misto = await getMisto(mistoId);

    if (!misto) {
      return { message: "Vybrané místo se nepodařilo ověřit.", ok: false };
    }
    console.log("[create-contribution] place verified:", misto.id);

    const token = createToken();
    const tokenHash = hashToken(token);
    console.log("[create-contribution] contribution insert start");
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
    console.log("[create-contribution] contribution inserted:", contribution?.id);

    if (!contribution?.id) {
      throw new Error("Contribution insert did not return an id.");
    }

    const photoPaths: Record<string, string> = {};

    try {
      for (const { file, slot } of photos) {
        console.log("[create-contribution] photo upload start", {
          name: file.name,
          size: file.size,
          slot,
          type: file.type,
        });
        const path = await uploadContributionPhoto(contribution.id, slot, file);
        photoPaths[`foto_${slot}`] = path;
        console.log("[create-contribution] photo uploaded:", path);
      }

      if (Object.keys(photoPaths).length > 0) {
        console.log("[create-contribution] photo paths update start", photoPaths);
        await supabaseRest(`prispevky?id=eq.${contribution.id}`, {
          body: JSON.stringify(photoPaths),
          method: "PATCH",
        });
      }
    } catch (error) {
      console.error("Contribution photo processing or upload failed", error);
      console.error("[create-contribution] failed:", error);

      return {
        message: "Fotografii se nepodařilo uložit. Zkuste prosím jiný obrázek.",
        ok: false,
      };
    }

    const confirmUrl = `${getSiteUrl()}/potvrdit-prispevek?token=${token}`;

    try {
      console.log("[create-contribution] confirmation email sending");
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
      console.log("[create-contribution] confirmation email sent");
    } catch (error) {
      console.error("Contribution confirmation email failed", error);

      return {
        message: "Příspěvek se nepodařilo uložit. Zkuste to prosím znovu.",
        ok: false,
      };
    }

    revalidatePath("/");
    console.log("[create-contribution] done");

    redirect("/?odeslano=1");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    console.error("[create-contribution] failed:", error);

    return {
      message: "Příspěvek se nepodařilo uložit. Zkuste to prosím znovu.",
      ok: false,
    };
  }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    console.error("[create-contribution] failed:", error);

    return {
      message: "Příspěvek se nepodařilo uložit. Zkuste to prosím znovu.",
      ok: false,
    };
  }
}

export async function requestManagementLinkAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = plainValue(formData, "email", contributionTextLimits.email).toLowerCase();
  const successMessage =
    "Pokud k tomuto e-mailu existují příspěvky, poslali jsme odkaz pro jejich úpravu.";

  if (!isValidEmail(email)) {
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
  console.log("[edit-contribution] start", { id });

  if (!token || !id || !session) {
    redirect("/moje-prispevky?error=missing");
  }

  const photoFiles = getPhotoSlotFiles(formData);

  for (const { file } of photoFiles) {
    const error = validatePhotoFile(file);

    if (error) {
      console.error("Contribution update photo validation failed", error);
      redirect(`/moje-prispevky?token=${token}&chyba=fotky`);
    }
  }

  const updatedTitle = plainValue(formData, "nadpis", contributionTextLimits.title);
  const updatedVideoUrl = plainValue(formData, "video_url", contributionTextLimits.url);
  const updatedWebObce = plainValue(formData, "web_obce", contributionTextLimits.url);

  if (!updatedTitle) {
    redirect(`/moje-prispevky?token=${token}&chyba=nadpis`);
  }

  if (!validateYoutubeUrl(updatedVideoUrl)) {
    redirect(`/moje-prispevky?token=${token}&chyba=video`);
  }

  if (!validateExternalUrl(updatedWebObce)) {
    redirect(`/moje-prispevky?token=${token}&chyba=web`);
  }

  const body: Record<string, string | boolean | null> = {
    jmeno_autora:
      plainValue(formData, "jmeno_autora", contributionTextLimits.authorName) || null,
    nadpis: updatedTitle,
    popis_videa:
      plainValue(formData, "popis_videa", contributionTextLimits.videoDescription) || null,
    text_prispevku: sanitizeContributionText(stringValue(formData, "text_prispevku")) || null,
    upraveno: new Date().toISOString(),
    video_url: updatedVideoUrl || null,
    web_obce: updatedWebObce || null,
  };

  try {
    const currentRows = await supabaseRest<PrispevekRecord[]>(
      `prispevky?id=eq.${id}&email=eq.${encodeURIComponent(
        session.email,
      )}&limit=1&select=id,foto_1,foto_2,foto_3,foto_4,foto_5`,
    );
    const currentContribution = currentRows[0];

    if (!currentContribution) {
      redirect("/moje-prispevky?error=missing");
    }
    console.log("[edit-contribution] authorized", { id });

    const photoValues = [
      currentContribution.foto_1,
      currentContribution.foto_2,
      currentContribution.foto_3,
      currentContribution.foto_4,
      currentContribution.foto_5,
    ];

    for (const slot of photoSlots) {
      if (formData.get(`remove_foto_${slot}`) === "on") {
        photoValues[slot - 1] = null;
      }
    }

    for (const { file, slot } of photoFiles) {
      photoValues[slot - 1] = await uploadContributionPhoto(id, slot, file);
    }

    photoValues.forEach((value, index) => {
      body[`foto_${index + 1}`] = value;
    });

    await supabaseRest(`prispevky?id=eq.${id}&email=eq.${encodeURIComponent(session.email)}`, {
      body: JSON.stringify(body),
      method: "PATCH",
    });
    console.log("[edit-contribution] updated", { id });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    console.error("[edit-contribution] failed", error);
    redirect(`/moje-prispevky?token=${token}&chyba=ulozeni`);
  }

  revalidatePath("/");
  revalidatePath(`/prispevky/${id}`);
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
