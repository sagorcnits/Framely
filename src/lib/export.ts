import { domToBlob } from "modern-screenshot";

export type ExportSize = { width: number; height: number; scale: number };

/** Browsers refuse to allocate canvases beyond these limits (Safari is much stricter on area). */
const MAX_CANVAS_SIDE = 16384;
const isSafari =
  typeof navigator !== "undefined" && /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);
const MAX_CANVAS_AREA = isSafari ? 16_777_216 : 140_000_000;

/** Clamps the requested scale so the output canvas stays within browser limits. */
export function resolveExportScale(
  width: number,
  height: number,
  requested: number,
): { scale: number; reduced: boolean } {
  const bySide = MAX_CANVAS_SIDE / Math.max(width, height);
  const byArea = Math.sqrt(MAX_CANVAS_AREA / (width * height));
  const limit = Math.floor(Math.min(bySide, byArea) * 100) / 100;
  if (requested <= limit) return { scale: requested, reduced: false };
  return { scale: Math.max(limit, 0.1), reduced: true };
}

async function waitForImages(node: HTMLElement): Promise<void> {
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    images.map((img) =>
      img.complete && img.naturalWidth > 0 ? Promise.resolve() : img.decode().catch(() => undefined),
    ),
  );
}

/** Renders the full-size canvas node (never the scaled preview) to a PNG blob. */
export async function renderPng(node: HTMLElement, { width, height, scale }: ExportSize): Promise<Blob> {
  await waitForImages(node);
  const blob = await domToBlob(node, {
    width,
    height,
    scale,
    type: "image/png",
    // Keep transparent pixels transparent; the canvas paints its own background.
    backgroundColor: null,
    // Frames use system fonts only, so skip web-font embedding.
    font: false,
    maximumCanvasSize: MAX_CANVAS_SIDE,
  });
  if (!blob || blob.size === 0) throw new Error("The export produced an empty image.");
  return blob;
}

/** framely-YYYYMMDD-HHmmss.png in local time. */
export function exportFilename(date: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  const day = `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}`;
  const time = `${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}`;
  return `framely-${day}-${time}.png`;
}

/** Renders and downloads the PNG. Returns the file name. */
export async function downloadPng(node: HTMLElement, size: ExportSize): Promise<string> {
  const blob = await renderPng(node, size);
  const filename = exportFilename();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return filename;
}

export class ClipboardUnsupportedError extends Error {
  constructor() {
    super("Your browser can't copy images to the clipboard. Use Download instead.");
    this.name = "ClipboardUnsupportedError";
  }
}

export function canCopyImage(): boolean {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    typeof window.ClipboardItem !== "undefined" &&
    typeof navigator.clipboard?.write === "function"
  );
}

/**
 * Copies the PNG to the clipboard. The ClipboardItem receives a promise so
 * `clipboard.write` is called synchronously inside the user gesture (Safari requires it).
 */
export async function copyPng(node: HTMLElement, size: ExportSize): Promise<void> {
  if (!canCopyImage()) throw new ClipboardUnsupportedError();
  const item = new ClipboardItem({ "image/png": renderPng(node, size) });
  await navigator.clipboard.write([item]);
}

export function describeExportError(error: unknown): string {
  if (error instanceof ClipboardUnsupportedError) return error.message;
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "Clipboard access was blocked. Allow clipboard permission for this site, or use Download.";
  }
  if (error instanceof DOMException && error.name === "SecurityError") {
    return "The browser blocked clipboard access. Use Download instead.";
  }
  return "Export failed. Try a lower export scale.";
}
