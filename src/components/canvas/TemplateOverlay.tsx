import { useEffect, useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { useShallow } from "zustand/react/shallow";
import { useDraggable } from "@/hooks/useDraggable";
import { useFilePicker } from "@/hooks/useFilePicker";
import { frameOuterRadius } from "@/lib/layout";
import { TEXT_Z_INDEX, resolvePointDrag, slotBox, textLayerStyle } from "@/lib/templateLayout";
import { useEditorStore } from "@/store/useEditorStore";
import type { CanvasSize, Slot, TextLayer } from "@/types";
import { SnapGuides } from "./SnapGuides";

type HandleProps = { canvas: CanvasSize; previewScale: number };

function selectionOutline(selected: boolean, previewScale: number, dashed = false) {
  const scale = Math.max(previewScale, 0.01);
  return {
    outline: selected ? `${1.5 / scale}px ${dashed ? "dashed" : "solid"} hsl(var(--primary) / 0.95)` : "none",
    outlineOffset: 3 / scale,
  };
}

function SlotHandle({ slot, canvas, previewScale, filled, selected }: HandleProps & {
  slot: Slot;
  filled: boolean;
  selected: boolean;
}) {
  const box = slotBox(slot, canvas);
  const picker = useFilePicker(slot.id);
  const select = useEditorStore((s) => s.select);
  const updateSlot = useEditorStore((s) => s.updateSlot);

  const { isDragging, guides, handlers } = useDraggable({
    previewScale,
    getStart: () => {
      const current = useEditorStore.getState().slots.find((s) => s.id === slot.id) ?? slot;
      return { x: current.transform.x * canvas.width, y: current.transform.y * canvas.height };
    },
    resolve: (raw, { snap }) => resolvePointDrag(raw, canvas, snap),
    commit: (p) => updateSlot(slot.id, { transform: { x: p.x / canvas.width, y: p.y / canvas.height } }),
    onPress: () => select(slot.id),
    onTap: () => {
      if (!filled) picker.open();
    },
  });

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!filled) picker.open();
    }
  };

  return (
    <>
      <input {...picker.inputProps} />
      <div
        data-slot-id={slot.id}
        style={{
          position: "absolute",
          left: box.left,
          top: box.top,
          width: box.width,
          height: box.height,
          zIndex: slot.transform.zIndex,
          perspective: box.perspective,
          pointerEvents: "none",
        }}
      >
        <div
          role="button"
          tabIndex={0}
          aria-label={filled ? "Image slot. Drag to move." : "Empty image slot. Click to add an image, or drop one here."}
          aria-pressed={selected}
          onFocus={() => select(slot.id)}
          onKeyDown={onKeyDown}
          {...handlers}
          className="select-none focus-visible:outline-none"
          style={{
            width: "100%",
            height: "100%",
            transform: box.transform,
            transformStyle: "preserve-3d",
            pointerEvents: "auto",
            touchAction: "none",
            borderRadius: frameOuterRadius(slot.frame, box.width, box.height, slot.radius),
            cursor: isDragging ? "grabbing" : filled ? "grab" : "pointer",
            willChange: isDragging ? "transform" : undefined,
            ...selectionOutline(selected, previewScale),
          }}
        />
      </div>
      <SnapGuides guides={guides} layout={canvas} previewScale={previewScale} />
    </>
  );
}

function TextHandle({ layer, canvas, previewScale, selected, editing, onEditChange }: HandleProps & {
  layer: TextLayer;
  selected: boolean;
  editing: boolean;
  onEditChange: (editing: boolean) => void;
}) {
  const select = useEditorStore((s) => s.select);
  const updateText = useEditorStore((s) => s.updateText);
  const lastTap = useRef(0);
  const editorRef = useRef<HTMLDivElement>(null);

  const { isDragging, guides, handlers } = useDraggable({
    previewScale,
    getStart: () => {
      const current = useEditorStore.getState().texts.find((t) => t.id === layer.id) ?? layer;
      return { x: current.x * canvas.width, y: current.y * canvas.height };
    },
    resolve: (raw, { snap }) => resolvePointDrag(raw, canvas, snap),
    commit: (p) => updateText(layer.id, { x: p.x / canvas.width, y: p.y / canvas.height }),
    onPress: () => select(layer.id),
    onTap: () => {
      // Double click / double tap enters inline editing.
      const now = performance.now();
      if (now - lastTap.current < 400) onEditChange(true);
      lastTap.current = now;
    },
  });

  // Seed the editable element once, then let the browser own its content until commit.
  useLayoutEffect(() => {
    const el = editorRef.current;
    if (!editing || !el) return;
    el.textContent = layer.text;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    // Seed only when editing starts; later text changes come from the user typing.
  }, [editing]);

  const commit = () => {
    const value = (editorRef.current?.innerText ?? "").replace(/\n$/, "");
    if (value.trim()) updateText(layer.id, { text: value });
    onEditChange(false);
  };

  const base = textLayerStyle(layer, canvas);

  if (editing) {
    return (
      <div
        ref={editorRef}
        role="textbox"
        aria-multiline
        aria-label="Edit text"
        contentEditable="plaintext-only"
        suppressContentEditableWarning
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            commit();
          } else if (event.key === "Escape") {
            event.preventDefault();
            onEditChange(false);
          }
        }}
        style={{
          ...base,
          color: layer.color,
          cursor: "text",
          userSelect: "text",
          caretColor: layer.color,
          minWidth: layer.fontSize,
          ...selectionOutline(true, previewScale, true),
        }}
      />
    );
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Text layer: ${layer.text}. Drag to move, double-click to edit.`}
        aria-pressed={selected}
        onFocus={() => select(layer.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onEditChange(true);
          }
        }}
        {...handlers}
        className="select-none focus-visible:outline-none"
        style={{
          ...base,
          zIndex: TEXT_Z_INDEX,
          color: "transparent",
          touchAction: "none",
          cursor: isDragging ? "grabbing" : "grab",
          ...selectionOutline(selected, previewScale, true),
        }}
      >
        {layer.text}
      </div>
      <SnapGuides guides={guides} layout={canvas} previewScale={previewScale} />
    </>
  );
}

type TemplateOverlayProps = {
  canvas: CanvasSize;
  previewScale: number;
  editingTextId: string | null;
  onEditingTextChange: (id: string | null) => void;
};

/**
 * Interactive handles over the template preview: selection outlines, slot click-to-fill,
 * dragging and inline text editing. Lives outside the renderer so none of it is exported.
 */
export function TemplateOverlay({ canvas, previewScale, editingTextId, onEditingTextChange }: TemplateOverlayProps) {
  const { slots, texts, slotImages, selectedId, select } = useEditorStore(
    useShallow((s) => ({
      slots: s.slots,
      texts: s.texts,
      slotImages: s.slotImages,
      selectedId: s.selectedId,
      select: s.select,
    })),
  );

  // Leave inline editing if the layer disappears.
  useEffect(() => {
    if (editingTextId && !texts.some((t) => t.id === editingTextId)) onEditingTextChange(null);
  }, [editingTextId, texts, onEditingTextChange]);

  return (
    <div
      className="absolute inset-0"
      style={{ zIndex: 1 }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) select(null);
      }}
    >
      {slots.map((slot) => (
        <SlotHandle
          key={slot.id}
          slot={slot}
          canvas={canvas}
          previewScale={previewScale}
          filled={Boolean(slotImages[slot.id])}
          selected={selectedId === slot.id}
        />
      ))}
      {texts.map((layer) => (
        <TextHandle
          key={layer.id}
          layer={layer}
          canvas={canvas}
          previewScale={previewScale}
          selected={selectedId === layer.id}
          editing={editingTextId === layer.id}
          onEditChange={(editing) => onEditingTextChange(editing ? layer.id : null)}
        />
      ))}
    </div>
  );
}
