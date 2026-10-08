import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { toast } from "sonner";
import {
  canCopyImage,
  copyPng,
  describeExportError,
  downloadPng,
  resolveExportScale,
} from "@/lib/export";
import { selectHasContent, useEditorStore } from "@/store/useEditorStore";

export type ExportKind = "download" | "copy";

/** Export state plus a runner that renders the hidden full-size canvas. */
export function useExport(
  nodeRef: RefObject<HTMLDivElement | null>,
  size: { width: number; height: number },
) {
  const [busy, setBusy] = useState<ExportKind | null>(null);
  const busyRef = useRef<ExportKind | null>(null);
  const sizeRef = useRef(size);

  useEffect(() => {
    sizeRef.current = size;
  });

  const run = useCallback(async (kind: ExportKind) => {
    if (busyRef.current) return;
    const state = useEditorStore.getState();
    const { exportScale } = state;
    const node = nodeRef.current;
    if (!selectHasContent(state) || !node) {
      toast.error("Add a screenshot first.");
      return;
    }
    if (kind === "copy" && !canCopyImage()) {
      toast.error("Your browser can't copy images to the clipboard. Use Download instead.");
      return;
    }

    const { width, height } = sizeRef.current;
    const { scale, reduced } = resolveExportScale(width, height, exportScale);
    busyRef.current = kind;
    setBusy(kind);
    try {
      if (kind === "download") {
        const filename = await downloadPng(node, { width, height, scale });
        toast.success(`Saved ${filename}`);
      } else {
        await copyPng(node, { width, height, scale });
        toast.success("Copied PNG to clipboard");
      }
      if (reduced) {
        toast.info(`Export scale lowered to ${scale}x to stay within the browser's canvas size limit.`);
      }
    } catch (error) {
      console.error(error);
      toast.error(describeExportError(error));
    } finally {
      busyRef.current = null;
      setBusy(null);
    }
  }, [nodeRef]);

  return { busy, run };
}
