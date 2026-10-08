import { useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useDraggable } from "@/hooks/useDraggable";
import { useFitScale } from "@/hooks/useFitScale";
import { frameOuterRadius, frameTransform, resolveSimpleDrag, type CanvasLayout } from "@/lib/layout";
import { useEditorStore } from "@/store/useEditorStore";
import { CanvasRenderer } from "./CanvasRenderer";
import { Dropzone } from "./Dropzone";
import { SnapGuides } from "./SnapGuides";
import { TemplateOverlay } from "./TemplateOverlay";

type CanvasPreviewProps = { layout: CanvasLayout };

/** Simple mode: the draggable handle over the single screenshot. */
function SimpleOverlay({ layout, previewScale, onDraggingChange }: {
  layout: CanvasLayout;
  previewScale: number;
  onDraggingChange: (dragging: boolean) => void;
}) {
  const { isSelected, rotation, radius, frame, setSelected, setPosition } = useEditorStore(
    useShallow((s) => ({
      isSelected: s.isSelected,
      rotation: s.rotation,
      radius: s.radius,
      frame: s.frame,
      setSelected: s.setSelected,
      setPosition: s.setPosition,
    })),
  );
  const { isDragging, guides, handlers } = useDraggable({
    previewScale,
    getStart: () => layout.offset,
    resolve: (raw, { snap }) => resolveSimpleDrag(raw, layout, snap),
    commit: setPosition,
    onPress: () => setSelected(true),
  });
  useEffect(() => onDraggingChange(isDragging), [isDragging, onDraggingChange]);

  const scale = Math.max(previewScale, 0.01);
  return (
    <>
      <div
        data-drag-handle
        role="button"
        tabIndex={0}
        aria-label="Screenshot. Drag to move; when selected, arrow keys nudge it and Escape deselects."
        aria-pressed={isSelected}
        onFocus={() => setSelected(true)}
        {...handlers}
        className="absolute touch-none select-none focus-visible:outline-none"
        style={{
          left: layout.frameX,
          top: layout.frameY,
          width: layout.frameWidth,
          height: layout.frameHeight,
          transform: frameTransform(layout.offset, rotation),
          borderRadius: frameOuterRadius(frame, layout.frameWidth, layout.frameHeight, radius),
          cursor: isDragging ? "grabbing" : "grab",
          willChange: isDragging ? "transform" : undefined,
          outline: isSelected ? `${1.5 / scale}px solid hsl(var(--primary) / 0.9)` : "none",
          outlineOffset: 3 / scale,
          WebkitTouchCallout: "none",
        }}
      />
      <SnapGuides guides={guides} layout={layout} previewScale={scale} />
    </>
  );
}

/**
 * Fits the true-size renderer into the available space with a CSS scale transform.
 * Interaction (drag handles, selection outlines, snap guides, placeholders) lives in
 * overlays or preview-only renderer props, so none of it can reach the export.
 */
export function CanvasPreview({ layout }: CanvasPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scale = useFitScale(containerRef, layout.width, layout.height);
  const { mode, hasImage, isTransparent, isSelected, setSelected, select } = useEditorStore(
    useShallow((s) => ({
      mode: s.mode,
      hasImage: s.image !== null,
      isTransparent: s.background.type === "transparent",
      isSelected: s.isSelected,
      setSelected: s.setSelected,
      select: s.select,
    })),
  );
  const [dragging, setDragging] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const onEditingTextChange = useCallback((id: string | null) => setEditingTextId(id), []);
  const isTemplate = mode === "template";

  const deselect = () => {
    if (isTemplate) select(null);
    else if (isSelected) setSelected(false);
  };

  return (
    <div
      ref={containerRef}
      className="canvas-backdrop relative flex h-full w-full items-center justify-center overflow-hidden"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) deselect();
      }}
    >
      <div
        role="img"
        aria-label={`Mockup preview, ${layout.width} by ${layout.height} pixels`}
        className="relative select-none shadow-2xl shadow-black/60 ring-1 ring-white/10"
        style={{
          width: layout.width * scale,
          height: layout.height * scale,
          visibility: scale ? "visible" : "hidden",
        }}
      >
        {isTransparent ? <div aria-hidden className="checkerboard absolute inset-0" /> : null}
        <div
          className="absolute left-0 top-0 overflow-hidden"
          style={{ width: layout.width, height: layout.height, transform: `scale(${scale})`, transformOrigin: "0 0" }}
          onPointerDown={(event) => {
            // Clicking the canvas background (not a handle) deselects.
            if (!(event.target as HTMLElement).closest("[data-drag-handle], [role='button'], [role='textbox']")) deselect();
          }}
        >
          <CanvasRenderer layout={layout} dragging={dragging} preview hiddenTextId={editingTextId} />
          {isTemplate ? (
            <TemplateOverlay
              canvas={layout}
              previewScale={scale}
              editingTextId={editingTextId}
              onEditingTextChange={onEditingTextChange}
            />
          ) : hasImage ? (
            <SimpleOverlay layout={layout} previewScale={scale} onDraggingChange={setDragging} />
          ) : null}
        </div>
        {!isTemplate && !hasImage ? <Dropzone className="absolute inset-0" /> : null}
      </div>
      <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-2.5 py-0.5 text-[11px] tabular-nums text-white/70">
        {layout.width} × {layout.height}
        {scale > 0 && scale < 1 ? ` · ${Math.round(scale * 100)}%` : ""}
      </p>
    </div>
  );
}
