import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { SnapGuides } from "@/lib/layout";
import type { Position } from "@/types";

const NO_GUIDES: SnapGuides = { x: null, y: null };
/** Screen pixels the pointer must travel before a press becomes a drag. */
const DRAG_THRESHOLD = 3;

export type DragResolver = (raw: Position, options: { snap: boolean }) => { position: Position; guides: SnapGuides };

export type DraggableOptions = {
  /** Visual scale of the preview; screen deltas are divided by it to get canvas pixels. */
  previewScale: number;
  /** Current position (canvas px) when a drag starts. */
  getStart: () => Position;
  /** Applies snapping/clamping to a raw canvas position. */
  resolve: DragResolver;
  commit: (position: Position) => void;
  /** Called on pointer down (e.g. to select the item). */
  onPress?: () => void;
  /** Called on release when the pointer didn't move (a click or tap). */
  onTap?: () => void;
};

type DragSession = {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startPosition: Position;
  moved: boolean;
};

type Pending = { position: Position; guides: SnapGuides };

/**
 * Pointer-driven dragging in the scaled preview, shared by the simple-mode screenshot,
 * template slots and text layers. Movement is 1:1 with the cursor in canvas pixels.
 * Shift disables snapping; Alt/Option locks to the dominant axis. Store writes are
 * batched to one per animation frame.
 */
export function useDraggable(options: DraggableOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const [guides, setGuides] = useState<SnapGuides>(NO_GUIDES);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  const session = useRef<DragSession | null>(null);
  const pending = useRef<Pending | null>(null);
  const frame = useRef<number | null>(null);

  const flush = useCallback(() => {
    frame.current = null;
    const next = pending.current;
    if (!next) return;
    pending.current = null;
    optionsRef.current.commit(next.position);
    setGuides((prev) => (prev.x === next.guides.x && prev.y === next.guides.y ? prev : next.guides));
  }, []);

  const schedule = useCallback(
    (next: Pending) => {
      pending.current = next;
      if (frame.current === null) frame.current = requestAnimationFrame(flush);
    },
    [flush],
  );

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    // Blocks native image drag, text selection and the emulated mouse events.
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget;
    target.focus({ preventScroll: true });
    target.setPointerCapture(event.pointerId);
    optionsRef.current.onPress?.();
    session.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startPosition: optionsRef.current.getStart(),
      moved: false,
    };
  }, []);

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const s = session.current;
      if (!s || s.pointerId !== event.pointerId) return;
      const screenDx = event.clientX - s.startClientX;
      const screenDy = event.clientY - s.startClientY;
      if (!s.moved) {
        if (Math.hypot(screenDx, screenDy) < DRAG_THRESHOLD) return;
        s.moved = true;
        setIsDragging(true);
      }
      const scale = optionsRef.current.previewScale || 1;
      let dx = screenDx / scale;
      let dy = screenDy / scale;
      if (event.altKey) {
        if (Math.abs(dx) >= Math.abs(dy)) dy = 0;
        else dx = 0;
      }
      const raw = { x: s.startPosition.x + dx, y: s.startPosition.y + dy };
      schedule(optionsRef.current.resolve(raw, { snap: !event.shiftKey }));
    },
    [schedule],
  );

  const endDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const s = session.current;
      if (!s || s.pointerId !== event.pointerId) return;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      session.current = null;
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
        flush();
      }
      setGuides(NO_GUIDES);
      setIsDragging(false);
      if (!s.moved && event.type === "pointerup") optionsRef.current.onTap?.();
    },
    [flush],
  );

  return {
    isDragging,
    guides,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
}
