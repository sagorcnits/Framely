import { ASPECT_RATIOS } from "@/lib/presets";
import type { AspectRatio, EditorImage, FrameType, Position } from "@/types";

/** Browser title bar height as a fraction of the frame width. */
export const BROWSER_BAR_RATIO = 0.052;
/** Minimal window title bar height as a fraction of the frame width. */
export const WINDOW_BAR_RATIO = 0.034;
/** Phone bezel thickness as a fraction of the phone width. */
export const PHONE_BEZEL_RATIO = 0.045;
/** Phone screen height / width. */
export const PHONE_SCREEN_RATIO = 2.1;
/** Tablet bezel thickness as a fraction of the tablet width. */
export const TABLET_BEZEL_RATIO = 0.04;
/** Laptop proportions, all as fractions of the laptop's total width. */
export const LAPTOP = {
  /** Lid inset from each side of the base. */
  lidInset: 0.07,
  sideBezel: 0.022,
  topBezel: 0.035,
  chin: 0.035,
  base: 0.045,
} as const;
const LAPTOP_SCREEN_WIDTH = 1 - 2 * LAPTOP.lidInset - 2 * LAPTOP.sideBezel;
const LAPTOP_VERTICAL = LAPTOP.topBezel + LAPTOP.chin + LAPTOP.base;

/** Auto canvases keep the screenshot's longest side within this range (px). */
const AUTO_MAX_SIDE = 2400;
const AUTO_MIN_SIDE = 480;
/** Natural phone width used by auto canvases (the phone has a fixed shape). */
const AUTO_PHONE_WIDTH = 900;
/** Canvas used for the empty state in auto mode. */
const EMPTY_AUTO_SIZE = { width: 1600, height: 1000 } as const;

/** Minimum fraction of the framed screenshot that must stay inside the canvas. */
const MIN_VISIBLE = 0.1;
/** Snap distance in canvas pixels. */
export const SNAP_THRESHOLD = 8;

export type CanvasLayout = {
  /** True canvas size in px — the size of a 1x export. */
  width: number;
  height: number;
  padding: number;
  /** Size and centered position of the framed screenshot inside the canvas. */
  frameWidth: number;
  frameHeight: number;
  frameX: number;
  frameY: number;
  /** User offset from the centered position, already clamped. */
  offset: Position;
};

/** The parts of a layout that position math depends on. */
type Geometry = Pick<CanvasLayout, "width" | "height" | "padding" | "frameWidth" | "frameHeight">;

/**
 * Height / width of the framed screenshot. Every frame's chrome is proportional to
 * its width, so the ratio is constant and fitting it into a box is a closed form.
 */
export function frameAspect(frame: FrameType, imageAspect: number): number {
  switch (frame) {
    case "none":
      return imageAspect;
    case "browser-light":
    case "browser-dark":
      return imageAspect + BROWSER_BAR_RATIO;
    case "window":
      return imageAspect + WINDOW_BAR_RATIO;
    case "phone":
      return (1 - 2 * PHONE_BEZEL_RATIO) * PHONE_SCREEN_RATIO + 2 * PHONE_BEZEL_RATIO;
    case "tablet":
      return (1 - 2 * TABLET_BEZEL_RATIO) * imageAspect + 2 * TABLET_BEZEL_RATIO;
    case "laptop":
      return LAPTOP_SCREEN_WIDTH * imageAspect + LAPTOP_VERTICAL;
  }
}

export function tabletOuterRadius(width: number, height: number, radius: number): number {
  return Math.min(width, height) * 0.06 + radius * 0.6;
}

/** Corner radius of a frame's outer silhouette (used for borders and outlines). */
export function frameOuterRadius(frame: FrameType, width: number, height: number, radius: number): number {
  if (frame === "phone") return phoneOuterRadius(width, radius);
  if (frame === "tablet") return tabletOuterRadius(width, height, radius);
  return radius;
}

/** Screenshot width used for auto canvases: very large images shrink, tiny ones grow. */
function autoImageWidth(image: EditorImage): number {
  const longest = Math.max(image.width, image.height);
  if (longest > AUTO_MAX_SIDE) return (image.width * AUTO_MAX_SIDE) / longest;
  if (longest < AUTO_MIN_SIDE) return (image.width * AUTO_MIN_SIDE) / longest;
  return image.width;
}

/** Outer corner radius of the phone body; grows with the radius setting. */
export function phoneOuterRadius(width: number, radius: number): number {
  return width * (0.06 + radius * 0.0025);
}

type LayoutInput = {
  image: EditorImage | null;
  aspectRatio: AspectRatio;
  frame: FrameType;
  padding: number;
  /** Percent, 50–100. */
  scale: number;
  position: Position;
};

/** Visible fraction of a span of `size` centered at `offset` from the middle of `canvas`. */
function visibleFraction(offset: number, size: number, canvas: number): number {
  const overhang = Math.max(0, Math.abs(offset) - (canvas - size) / 2);
  return Math.max(0, 1 - overhang / size);
}

/** Largest |offset| that keeps `fraction` of the span visible. */
function maxOffset(fraction: number, size: number, canvas: number): number {
  return Math.max(0, canvas / 2 + size / 2 - fraction * size);
}

function limitAxis(value: number, fraction: number, size: number, canvas: number): number {
  const max = maxOffset(fraction, size, canvas);
  return Math.min(max, Math.max(-max, value));
}

/**
 * Keeps at least 10% of the framed screenshot's area inside the canvas.
 * Each axis keeps ≥10% visible; if the combined area still drops below 10%,
 * the axis that is further out is pulled back in.
 */
export function clampPosition(position: Position, g: Geometry): Position {
  const fw = Math.max(g.frameWidth, 1);
  const fh = Math.max(g.frameHeight, 1);
  let x = limitAxis(position.x, MIN_VISIBLE, fw, g.width);
  let y = limitAxis(position.y, MIN_VISIBLE, fh, g.height);
  const vx = visibleFraction(x, fw, g.width);
  const vy = visibleFraction(y, fh, g.height);
  if (vx * vy < MIN_VISIBLE) {
    if (vx <= vy) x = limitAxis(x, MIN_VISIBLE / vy, fw, g.width);
    else y = limitAxis(y, MIN_VISIBLE / vx, fh, g.height);
  }
  return { x, y };
}

/** Offsets that put the screenshot's start edge, center, or end edge on the padding lines. */
function axisStops(size: number, canvas: number, padding: number) {
  return {
    start: padding - canvas / 2 + size / 2,
    center: 0,
    end: canvas / 2 - padding - size / 2,
  };
}

export type SnapGuides = {
  /** Canvas x of a vertical guide line, or null. */
  x: number | null;
  /** Canvas y of a horizontal guide line, or null. */
  y: number | null;
};

function snapAxis(value: number, size: number, canvas: number, padding: number) {
  const stops = axisStops(size, canvas, padding);
  const candidates = [
    { offset: stops.center, guide: canvas / 2 },
    { offset: stops.start, guide: padding },
    { offset: stops.end, guide: canvas - padding },
  ];
  let best: { offset: number; guide: number } | null = null;
  for (const c of candidates) {
    const distance = Math.abs(value - c.offset);
    if (distance <= SNAP_THRESHOLD && (!best || distance < Math.abs(value - best.offset))) best = c;
  }
  return best ? { value: best.offset, guide: best.guide } : { value, guide: null };
}

/** Snaps to the canvas centers and padding edges within SNAP_THRESHOLD canvas pixels. */
export function snapPosition(position: Position, g: Geometry): { position: Position; guides: SnapGuides } {
  const sx = snapAxis(position.x, g.frameWidth, g.width, g.padding);
  const sy = snapAxis(position.y, g.frameHeight, g.height, g.padding);
  return { position: { x: sx.value, y: sy.value }, guides: { x: sx.guide, y: sy.guide } };
}

const NO_GUIDES: SnapGuides = { x: null, y: null };

/** Simple-mode drag: optional snapping, then clamping; guides only where the snap survived the clamp. */
export function resolveSimpleDrag(
  raw: Position,
  g: Geometry,
  snap: boolean,
): { position: Position; guides: SnapGuides } {
  const snapped = snap ? snapPosition(raw, g) : { position: raw, guides: NO_GUIDES };
  const position = clampPosition(snapped.position, g);
  return {
    position,
    guides: {
      x: snapped.guides.x !== null && position.x === snapped.position.x ? snapped.guides.x : null,
      y: snapped.guides.y !== null && position.y === snapped.position.y ? snapped.guides.y : null,
    },
  };
}

/** Layout used in template mode: the template's fixed canvas, no simple-mode frame. */
export function templateCanvasLayout(canvas: { width: number; height: number }): CanvasLayout {
  return {
    width: canvas.width,
    height: canvas.height,
    padding: 0,
    frameWidth: 0,
    frameHeight: 0,
    frameX: 0,
    frameY: 0,
    offset: { x: 0, y: 0 },
  };
}

export type Alignment = "start" | "center" | "end";

/** Position for a 3×3 alignment cell, respecting the padding. */
export function alignedPosition(horizontal: Alignment, vertical: Alignment, g: Geometry): Position {
  return clampPosition(
    {
      x: axisStops(g.frameWidth, g.width, g.padding)[horizontal],
      y: axisStops(g.frameHeight, g.height, g.padding)[vertical],
    },
    g,
  );
}

/**
 * Transform for the framed screenshot: translate first, then rotate (scale is baked
 * into the frame size). Shared by the renderer and the preview's drag overlay.
 */
export function frameTransform(offset: Position, rotation: number): string {
  return `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`;
}

export function samePosition(a: Position, b: Position): boolean {
  return Math.abs(a.x - b.x) < 0.01 && Math.abs(a.y - b.y) < 0.01;
}

export function computeLayout({ image, aspectRatio, frame, padding, scale, position }: LayoutInput): CanvasLayout {
  const imageAspect = image ? image.height / image.width : 10 / 16;
  const k = frameAspect(frame, imageAspect);

  let width: number;
  let height: number;
  const preset = ASPECT_RATIOS.find((r) => r.id === aspectRatio)?.size ?? null;

  if (preset) {
    width = preset.width;
    height = preset.height;
  } else if (!image) {
    width = EMPTY_AUTO_SIZE.width;
    height = EMPTY_AUTO_SIZE.height;
  } else {
    const naturalWidth = frame === "phone" ? AUTO_PHONE_WIDTH : autoImageWidth(image);
    width = Math.round(naturalWidth + padding * 2);
    height = Math.round(naturalWidth * k + padding * 2);
  }

  const availableWidth = Math.max(width - padding * 2, 1);
  const availableHeight = Math.max(height - padding * 2, 1);
  const frameWidth = Math.min(availableWidth, availableHeight / k) * (scale / 100);
  const frameHeight = frameWidth * k;
  const geometry = { width, height, padding, frameWidth, frameHeight };

  return {
    ...geometry,
    frameX: (width - frameWidth) / 2,
    frameY: (height - frameHeight) / 2,
    offset: image ? clampPosition(position, geometry) : { x: 0, y: 0 },
  };
}
