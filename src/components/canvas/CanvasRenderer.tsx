import { forwardRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { FrameWrapper } from "@/components/frames/FrameWrapper";
import { frameTransform, type CanvasLayout } from "@/lib/layout";
import { backgroundCss } from "@/lib/presets";
import { useEditorStore } from "@/store/useEditorStore";
import { TemplateScene } from "./TemplateScene";

type CanvasRendererProps = {
  layout: CanvasLayout;
  /** Preview-only hint while the screenshot is being dragged. */
  dragging?: boolean;
  /** Editor preview: empty template slots show a "Drop image here" placeholder. Export omits them. */
  preview?: boolean;
  /** Text layer currently edited inline (hidden here so the editor copy shows instead). */
  hiddenTextId?: string | null;
};

/**
 * The composition at its true pixel size. The preview scales this with a CSS
 * transform; export captures a separate, unscaled instance.
 */
export const CanvasRenderer = forwardRef<HTMLDivElement, CanvasRendererProps>(function CanvasRenderer(
  { layout, dragging = false, preview = false, hiddenTextId = null },
  ref,
) {
  const s = useEditorStore(
    useShallow((state) => ({
      mode: state.mode,
      image: state.image,
      background: state.background,
      radius: state.radius,
      rotation: state.rotation,
      shadow: state.shadow,
      shadowOpacity: state.shadowOpacity,
      border: state.border,
      frame: state.frame,
      browserUrl: state.browserUrl,
      slots: state.slots,
      slotImages: state.slotImages,
      texts: state.texts,
    })),
  );

  if (s.mode === "template") {
    return (
      <TemplateScene
        ref={ref}
        canvas={{ width: layout.width, height: layout.height }}
        background={s.background}
        slots={s.slots}
        texts={s.texts}
        images={s.slotImages}
        placeholder={preview ? "label" : "none"}
        browserUrl={s.browserUrl}
        hiddenTextId={hiddenTextId}
      />
    );
  }

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: layout.width,
        height: layout.height,
        overflow: "hidden",
        isolation: "isolate",
        userSelect: "none",
        background: backgroundCss(s.background),
      }}
    >
      {s.image ? (
        <div
          style={{
            position: "absolute",
            left: layout.frameX,
            top: layout.frameY,
            width: layout.frameWidth,
            height: layout.frameHeight,
            transform: frameTransform(layout.offset, s.rotation),
            willChange: dragging ? "transform" : undefined,
          }}
        >
          <FrameWrapper
            frame={s.frame}
            screen={
              <img
                src={s.image.url}
                alt=""
                draggable={false}
                style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
              />
            }
            width={layout.frameWidth}
            height={layout.frameHeight}
            radius={s.radius}
            shadow={s.shadow}
            shadowOpacity={s.shadowOpacity}
            border={s.border}
            browserUrl={s.browserUrl}
          />
        </div>
      ) : null}
    </div>
  );
});
