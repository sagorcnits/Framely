import { useEffect, useRef } from "react";
import { clampPosition, type CanvasLayout } from "@/lib/layout";
import { clamp } from "@/lib/utils";
import { useEditorStore } from "@/store/useEditorStore";

const ARROWS: Record<string, readonly [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

/** Controls that use arrow keys or Escape themselves. */
function ownsKeys(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable || target.closest("input, textarea, select")) return true;
  return target.closest('[role="slider"], [role="tab"], [role="option"], [role="listbox"], [role="menu"], [role="dialog"]') !== null;
}

/**
 * Arrow keys nudge the selected item 1px (Shift: 10px); Escape deselects it.
 * Simple mode moves the screenshot; template mode moves the selected slot or text layer.
 */
export function useNudgeKeys(layout: CanvasLayout): void {
  const layoutRef = useRef(layout);
  useEffect(() => {
    layoutRef.current = layout;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || ownsKeys(event.target)) return;
      const store = useEditorStore.getState();
      const dir = ARROWS[event.key];

      if (store.mode === "template") {
        const id = store.selectedId;
        if (!id) return;
        if (event.key === "Escape") {
          store.select(null);
          return;
        }
        if (!dir) return;
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        const { width, height } = store.templateCanvas;
        const slot = store.slots.find((s) => s.id === id);
        if (slot) {
          store.updateSlot(id, {
            transform: {
              x: clamp(slot.transform.x + (dir[0] * step) / width, 0, 1),
              y: clamp(slot.transform.y + (dir[1] * step) / height, 0, 1),
            },
          });
          return;
        }
        const text = store.texts.find((t) => t.id === id);
        if (text) {
          store.updateText(id, {
            x: clamp(text.x + (dir[0] * step) / width, 0, 1),
            y: clamp(text.y + (dir[1] * step) / height, 0, 1),
          });
        }
        return;
      }

      if (!store.isSelected || !store.image) return;
      if (event.key === "Escape") {
        store.setSelected(false);
        return;
      }
      if (!dir) return;
      event.preventDefault();
      const step = event.shiftKey ? 10 : 1;
      const current = layoutRef.current.offset;
      store.setPosition(
        clampPosition({ x: current.x + dir[0] * step, y: current.y + dir[1] * step }, layoutRef.current),
      );
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
