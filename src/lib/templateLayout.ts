import type { CSSProperties } from "react";
import { SNAP_THRESHOLD, type SnapGuides } from "@/lib/layout";
import { FONT_STACKS } from "@/lib/presets";
import type { CanvasSize, Position, Slot, SlotShadow, TextLayer } from "@/types";

/** Text layers always sit above image slots. */
export const TEXT_Z_INDEX = 1000;

export type SlotBox = {
  left: number;
  top: number;
  width: number;
  height: number;
  /** CSS transform for the inner (rotated) element. */
  transform: string;
  perspective: number | undefined;
};

/** Pixel box and 3D transform of a slot on a canvas. Shared by renderer and preview handles. */
export function slotBox(slot: Slot, canvas: CanvasSize): SlotBox {
  const t = slot.transform;
  const width = t.width * canvas.width;
  const height = width / t.aspect;
  return {
    left: t.x * canvas.width - width / 2,
    top: t.y * canvas.height - height / 2,
    width,
    height,
    transform: `rotateX(${t.rotateX}deg) rotateY(${t.rotateY}deg) rotateZ(${t.rotateZ}deg)`,
    perspective: t.perspective > 0 ? t.perspective : undefined,
  };
}

/** [offsetY, blur, alpha] layers at a 1600px-wide canvas. */
const SLOT_SHADOWS: Record<Exclude<SlotShadow, "none">, readonly (readonly [number, number, number])[]> = {
  sm: [[3, 6, 0.22]],
  md: [[10, 18, 0.26]],
  lg: [[22, 32, 0.3], [6, 10, 0.12]],
  xl: [[38, 52, 0.38], [10, 16, 0.16]],
  floating: [[70, 70, 0.32], [14, 22, 0.18]],
};

/**
 * Screen-space `filter: drop-shadow()` for a slot. It is applied to the perspective
 * wrapper, so the shadow follows the projected (tilted) silhouette and always falls downward.
 */
export function slotShadowFilter(shadow: SlotShadow, canvas: CanvasSize): string | undefined {
  if (shadow === "none") return undefined;
  const u = canvas.width / 1600;
  return SLOT_SHADOWS[shadow]
    .map(([y, blur, alpha]) => `drop-shadow(0px ${(y * u).toFixed(1)}px ${(blur * u).toFixed(1)}px rgba(0, 0, 0, ${alpha}))`)
    .join(" ");
}

/** Vertical scroll position of the image inside its slot, in percent. */
export function slotScroll(slot: Slot): number {
  return slot.scroll ?? (slot.objectPosition === "top" ? 0 : 50);
}

const ALIGN_SHIFT = { left: "0%", center: "-50%", right: "-100%" } as const;

/** Absolute position and typography of a text layer. Shared by renderer and editor handle. */
export function textLayerStyle(layer: TextLayer, canvas: CanvasSize): CSSProperties {
  return {
    position: "absolute",
    left: layer.x * canvas.width,
    top: layer.y * canvas.height,
    transform: `translate(${ALIGN_SHIFT[layer.align]}, -50%)`,
    fontFamily: FONT_STACKS[layer.fontFamily],
    fontSize: layer.fontSize,
    fontWeight: layer.fontWeight,
    lineHeight: 1.15,
    letterSpacing: layer.fontSize >= 40 ? "-0.02em" : "normal",
    textAlign: layer.align,
    whiteSpace: "pre",
    zIndex: TEXT_Z_INDEX,
  };
}

const NO_GUIDES: SnapGuides = { x: null, y: null };

/**
 * Drag resolution for template items whose position is a point (slot center or text anchor):
 * snaps to the canvas center lines and keeps the point on the canvas.
 */
export function resolvePointDrag(
  raw: Position,
  canvas: CanvasSize,
  snap: boolean,
): { position: Position; guides: SnapGuides } {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const snapX = snap && Math.abs(raw.x - cx) <= SNAP_THRESHOLD;
  const snapY = snap && Math.abs(raw.y - cy) <= SNAP_THRESHOLD;
  const position = {
    x: Math.min(canvas.width, Math.max(0, snapX ? cx : raw.x)),
    y: Math.min(canvas.height, Math.max(0, snapY ? cy : raw.y)),
  };
  if (!snapX && !snapY) return { position, guides: NO_GUIDES };
  return { position, guides: { x: snapX ? cx : null, y: snapY ? cy : null } };
}

export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}
