import type { EditorImage } from "@/types";

export const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const ACCEPT_ATTR = ACCEPTED_TYPES.join(",");

const ACCEPTED_EXTENSIONS = /\.(png|jpe?g|webp)$/i;
const MAX_FILE_BYTES = 50 * 1024 * 1024;
/** Sources larger than this on either side are downscaled before editing. */
export const MAX_SOURCE_SIDE = 8000;
const DOWNSCALE_TARGET_SIDE = 6000;
/** Below this longest side we warn that the export will look soft. */
export const SMALL_IMAGE_SIDE = 200;

/** Returns a user-facing error message, or null if the file is acceptable. */
export function validateImageFile(file: File): string | null {
  const typeOk = file.type
    ? (ACCEPTED_TYPES as readonly string[]).includes(file.type) || file.type === "image/jpg"
    : ACCEPTED_EXTENSIONS.test(file.name);
  if (!typeOk) {
    const kind = file.type || file.name.split(".").pop() || "this file";
    return `Unsupported file type (${kind}). Use PNG, JPG, or WebP.`;
  }
  if (file.size > MAX_FILE_BYTES) return "That image is larger than 50 MB.";
  if (file.size === 0) return "That file is empty.";
  return null;
}

function decodeImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that image. The file may be corrupt."));
    img.src = url;
  });
}

function downscale(img: HTMLImageElement, width: number, height: number): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("Could not resize that image."));
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not resize that image."))),
      "image/png",
    );
  });
}

export type LoadedImage = {
  image: EditorImage;
  /** Original size when the image was downscaled, otherwise null. */
  downscaledFrom: { width: number; height: number } | null;
};

/** Loads a file into an object URL and reads its dimensions. The caller owns the URL. */
export async function loadImageFile(file: File): Promise<LoadedImage> {
  let url = URL.createObjectURL(file);
  try {
    const img = await decodeImage(url);
    const { naturalWidth: width, naturalHeight: height } = img;
    if (!width || !height) throw new Error("That image has no pixels.");

    const longest = Math.max(width, height);
    if (longest <= MAX_SOURCE_SIDE) {
      return { image: { url, width, height }, downscaledFrom: null };
    }

    const factor = DOWNSCALE_TARGET_SIDE / longest;
    const nextWidth = Math.max(1, Math.round(width * factor));
    const nextHeight = Math.max(1, Math.round(height * factor));
    const blob = await downscale(img, nextWidth, nextHeight);
    URL.revokeObjectURL(url);
    url = URL.createObjectURL(blob);
    return { image: { url, width: nextWidth, height: nextHeight }, downscaledFrom: { width, height } };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

/** First file in a drop or paste payload, if any. */
export function firstFile(data: DataTransfer | null): File | null {
  if (!data) return null;
  const direct = data.files[0];
  if (direct) return direct;
  for (const item of Array.from(data.items)) {
    if (item.kind === "file") {
      const file = item.getAsFile();
      if (file) return file;
    }
  }
  return null;
}
