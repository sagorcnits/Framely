import { textLayerStyle } from "@/lib/templateLayout";
import type { CanvasSize, TextLayer } from "@/types";

type TextLayerRendererProps = {
  layer: TextLayer;
  canvas: CanvasSize;
  /** Hidden while the layer is being edited inline in the preview. */
  hidden?: boolean;
};

export function TextLayerRenderer({ layer, canvas, hidden = false }: TextLayerRendererProps) {
  return (
    <div style={{ ...textLayerStyle(layer, canvas), color: layer.color, visibility: hidden ? "hidden" : undefined }}>
      {layer.text}
    </div>
  );
}
