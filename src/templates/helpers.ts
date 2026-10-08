import type { Background, Slot, SlotTransform, TextLayer } from "@/types";

const DEFAULT_TRANSFORM: SlotTransform = {
  x: 0.5,
  y: 0.5,
  width: 0.5,
  aspect: 16 / 10,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  perspective: 0,
  zIndex: 1,
};

/** Builds a slot from partial values, filling in sensible defaults. */
export function slot(
  id: string,
  transform: Partial<SlotTransform>,
  options: Partial<Omit<Slot, "id" | "transform">> = {},
): Slot {
  return {
    id,
    transform: { ...DEFAULT_TRANSFORM, ...transform },
    frame: "none",
    radius: 12,
    shadow: "lg",
    fit: "cover",
    objectPosition: "top",
    scroll: null,
    ...options,
  };
}

export function text(id: string, value: string, options: Partial<Omit<TextLayer, "id" | "text">> = {}): TextLayer {
  return {
    id,
    text: value,
    x: 0.5,
    y: 0.12,
    fontSize: 64,
    fontWeight: 700,
    color: "#111111",
    align: "center",
    fontFamily: "sans",
    ...options,
  };
}

export function gradient(from: string, to: string, angle = 135): Background {
  return { type: "gradient", from, to, angle };
}

export function solid(color: string): Background {
  return { type: "solid", color };
}

/** All built-in templates share this canvas, so gallery cards line up. */
export const CANVAS = { width: 1600, height: 1200 } as const;
