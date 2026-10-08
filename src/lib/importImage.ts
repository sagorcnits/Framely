import { toast } from "sonner";
import { SMALL_IMAGE_SIDE, loadImageFile, validateImageFile } from "@/lib/image";
import { resolveTargetSlot, useEditorStore } from "@/store/useEditorStore";

type ImportOptions = {
  /** Template slot to fill. Defaults to the selected slot, then the first empty one. */
  slotId?: string;
};

/** Latest request per target, so a slow decode can't overwrite a newer upload to the same place. */
const latestRequest = new Map<string, number>();
let requestCounter = 0;

/** Validates, loads and stores an image from any source (picker, drop, paste). */
export async function importImageFile(file: File, options: ImportOptions = {}): Promise<void> {
  const error = validateImageFile(file);
  if (error) {
    toast.error(error);
    return;
  }

  const key = options.slotId ?? "auto";
  const request = ++requestCounter;
  latestRequest.set(key, request);
  const loadingToast = file.size > 4 * 1024 * 1024 ? toast.loading("Loading image…") : undefined;

  try {
    const { image, downscaledFrom } = await loadImageFile(file);
    if (latestRequest.get(key) !== request) {
      URL.revokeObjectURL(image.url);
      return;
    }

    const state = useEditorStore.getState();
    if (state.mode === "template") {
      const target = resolveTargetSlot(state, options.slotId);
      if (!target) {
        URL.revokeObjectURL(image.url);
        toast.error("This layout has no image slots. Duplicate a slot or pick another template.");
        return;
      }
      state.setSlotImage(target, image);
    } else {
      state.setImage(image);
    }

    if (downscaledFrom) {
      toast.info(
        `Large image (${downscaledFrom.width}×${downscaledFrom.height}) was resized to ${image.width}×${image.height} for smooth editing.`,
      );
    } else if (Math.max(image.width, image.height) < SMALL_IMAGE_SIDE) {
      toast.info("That image is very small, so it may look soft when exported.");
    }
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Could not load that image.");
  } finally {
    if (loadingToast !== undefined) toast.dismiss(loadingToast);
  }
}

/**
 * Imports several files at once. In template mode they fill the target slot first,
 * then the remaining empty slots in order; in simple mode only the first file is used.
 */
export async function importImageFiles(files: File[], options: ImportOptions = {}): Promise<void> {
  const state = useEditorStore.getState();
  const [first, ...rest] = files;
  if (!first) return;
  if (state.mode !== "template" || rest.length === 0 || state.useOneImage) {
    await importImageFile(first, options);
    return;
  }
  const firstTarget = resolveTargetSlot(state, options.slotId);
  const others = state.slots.filter((s) => s.id !== firstTarget && !state.slotImages[s.id]).map((s) => s.id);
  const targets = [firstTarget, ...others];
  await Promise.all(
    files.slice(0, targets.length).map((file, i) => importImageFile(file, { slotId: targets[i] ?? undefined })),
  );
}
