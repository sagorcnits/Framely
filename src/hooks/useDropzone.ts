import { useEffect, useState } from "react";
import { importImageFiles } from "@/lib/importImage";

function carriesFiles(event: DragEvent): boolean {
  return Array.from(event.dataTransfer?.types ?? []).includes("Files");
}

function droppedFiles(data: DataTransfer | null): File[] {
  if (!data) return [];
  if (data.files.length) return Array.from(data.files);
  return Array.from(data.items)
    .filter((item) => item.kind === "file")
    .map((item) => item.getAsFile())
    .filter((file): file is File => file !== null);
}

/**
 * Accepts file drops anywhere on the page. A drop onto a template slot fills that slot.
 * Dragging the screenshot itself uses pointer events and never reaches here.
 * Returns true while a file is dragged over the page.
 */
export function useDropzone(): boolean {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // dragenter/dragleave fire for every child element; count depth to know when we really left.
    let depth = 0;

    const onDragEnter = (event: DragEvent) => {
      if (!carriesFiles(event)) return;
      event.preventDefault();
      depth += 1;
      setIsDragging(true);
    };
    const onDragOver = (event: DragEvent) => {
      if (!carriesFiles(event)) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    };
    const onDragLeave = (event: DragEvent) => {
      if (!carriesFiles(event)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setIsDragging(false);
    };
    const onDrop = (event: DragEvent) => {
      if (!carriesFiles(event)) return;
      event.preventDefault();
      depth = 0;
      setIsDragging(false);
      const slotId =
        event.target instanceof Element
          ? (event.target.closest("[data-slot-id]")?.getAttribute("data-slot-id") ?? undefined)
          : undefined;
      void importImageFiles(droppedFiles(event.dataTransfer), { slotId });
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  return isDragging;
}
