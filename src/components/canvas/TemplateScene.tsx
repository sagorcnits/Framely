import { forwardRef } from "react";
import { backgroundCss } from "@/lib/presets";
import type { Background, CanvasSize, EditorImage, Slot, TextLayer } from "@/types";
import { SlotRenderer, type SlotPlaceholder } from "./SlotRenderer";
import { TextLayerRenderer } from "./TextLayerRenderer";

type TemplateSceneProps = {
  canvas: CanvasSize;
  background: Background;
  slots: readonly Slot[];
  texts: readonly TextLayer[];
  images: Readonly<Record<string, EditorImage | null>>;
  placeholder: SlotPlaceholder;
  browserUrl: string;
  hiddenTextId?: string | null;
};

/**
 * A template composition at its true pixel size. Pure: driven entirely by props, so the
 * editor canvas, the export and the gallery thumbnails all render the exact same thing.
 */
export const TemplateScene = forwardRef<HTMLDivElement, TemplateSceneProps>(function TemplateScene(
  { canvas, background, slots, texts, images, placeholder, browserUrl, hiddenTextId = null },
  ref,
) {
  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: canvas.width,
        height: canvas.height,
        overflow: "hidden",
        isolation: "isolate",
        userSelect: "none",
        background: backgroundCss(background),
      }}
    >
      {slots.map((slot) => (
        <SlotRenderer
          key={slot.id}
          slot={slot}
          canvas={canvas}
          image={images[slot.id] ?? null}
          placeholder={placeholder}
          browserUrl={browserUrl}
        />
      ))}
      {texts.map((layer) => (
        <TextLayerRenderer key={layer.id} layer={layer} canvas={canvas} hidden={layer.id === hiddenTextId} />
      ))}
    </div>
  );
});
