export const MAX_CLIENT_OPTIMIZED_IMAGE_BYTES = 500_000;

const maxDimensions = [1600, 1400, 1200, 1000];
const webpQualities = [0.82, 0.74, 0.66, 0.58];

export const allowedClientPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas export failed."));
          return;
        }

        resolve(blob);
      },
      "image/webp",
      quality,
    );
  });
}

function getResizedDimensions(width: number, height: number, maxDimension: number) {
  const scale = Math.min(1, maxDimension / Math.max(width, height));

  return {
    height: Math.round(height * scale),
    width: Math.round(width * scale),
  };
}

function toWebpFileName(fileName: string) {
  return /\.[^.]+$/.test(fileName) ? fileName.replace(/\.[^.]+$/, ".webp") : `${fileName}.webp`;
}

export async function optimizeContributionImageInBrowser(file: File) {
  if (!allowedClientPhotoTypes.has(file.type)) {
    throw new Error("Podporované jsou fotografie JPG, PNG a WebP.");
  }

  let bestBlob: Blob | null = null;

  try {
    const image = await createImageBitmap(file);

    for (const maxDimension of maxDimensions) {
      const { height, width } = getResizedDimensions(image.width, image.height, maxDimension);
      const canvas = document.createElement("canvas");
      canvas.height = height;
      canvas.width = width;
      const context = canvas.getContext("2d", {
        alpha: false,
      });

      if (!context) {
        throw new Error("Canvas context failed.");
      }

      context.drawImage(image, 0, 0, width, height);

      for (const quality of webpQualities) {
        const blob = await canvasToBlob(canvas, quality);

        if (!bestBlob || blob.size < bestBlob.size) {
          bestBlob = blob;
        }

        if (blob.size <= MAX_CLIENT_OPTIMIZED_IMAGE_BYTES) {
          image.close();

          return new File([blob], toWebpFileName(file.name), {
            lastModified: Date.now(),
            type: "image/webp",
          });
        }
      }
    }

    image.close();
  } catch {
    throw new Error("Fotografii se nepodařilo připravit. Zkuste prosím jiný obrázek.");
  }

  if (!bestBlob || bestBlob.size > MAX_CLIENT_OPTIMIZED_IMAGE_BYTES) {
    throw new Error("Fotografii se nepodařilo připravit. Zkuste prosím jiný obrázek.");
  }

  return new File([bestBlob], toWebpFileName(file.name), {
    lastModified: Date.now(),
    type: "image/webp",
  });
}
