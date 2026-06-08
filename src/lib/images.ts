import "server-only";
import sharp from "sharp";

export const MAX_OPTIMIZED_IMAGE_BYTES = 500_000;

const maxDimensions = [1600, 1400, 1200, 1000];
const webpQualities = [80, 72, 64, 56];

export async function optimizeContributionImage(file: File): Promise<{
  buffer: Buffer;
  contentType: "image/webp";
  extension: "webp";
  size: number;
}> {
  try {
    const input = Buffer.from(await file.arrayBuffer());

    for (const dimension of maxDimensions) {
      for (const quality of webpQualities) {
        const buffer = await sharp(input, {
          failOn: "warning",
        })
          .rotate()
          .resize({
            fit: "inside",
            height: dimension,
            withoutEnlargement: true,
            width: dimension,
          })
          .webp({
            effort: 5,
            quality,
          })
          .toBuffer();

        if (buffer.byteLength <= MAX_OPTIMIZED_IMAGE_BYTES) {
          return {
            buffer,
            contentType: "image/webp",
            extension: "webp",
            size: buffer.byteLength,
          };
        }
      }
    }
  } catch {
    throw new Error("Fotografii se nepodařilo zpracovat. Zkuste prosím jiný obrázek.");
  }

  throw new Error("Fotografii se nepodařilo zpracovat. Zkuste prosím jiný obrázek.");
}
