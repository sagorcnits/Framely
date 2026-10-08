import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { computeLayout, templateCanvasLayout, type CanvasLayout } from "@/lib/layout";
import { useEditorStore } from "@/store/useEditorStore";

/** Canvas size and screenshot placement derived from the current settings. */
export function useCanvasLayout(): CanvasLayout {
  const { mode, templateCanvas, image, aspectRatio, frame, padding, scale, position } = useEditorStore(
    useShallow((s) => ({
      mode: s.mode,
      templateCanvas: s.templateCanvas,
      image: s.image,
      aspectRatio: s.aspectRatio,
      frame: s.frame,
      padding: s.padding,
      scale: s.scale,
      position: s.position,
    })),
  );
  return useMemo(
    () =>
      mode === "template"
        ? templateCanvasLayout(templateCanvas)
        : computeLayout({ image, aspectRatio, frame, padding, scale, position }),
    [mode, templateCanvas, image, aspectRatio, frame, padding, scale, position],
  );
}
