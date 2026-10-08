import type {
  AspectRatio,
  Background,
  ExportScale,
  FontFamily,
  FrameType,
  GradientBackground,
  ShadowPreset,
  SlotShadow,
  StyleSettings,
  TemplateCategory,
} from "@/types";

export type GradientPreset = { id: string; name: string; from: string; to: string; angle: number };

export const GRADIENT_PRESETS: readonly GradientPreset[] = [
  { id: "lagoon", name: "Lagoon", from: "#00c6ff", to: "#0072ff", angle: 135 },
  { id: "sunset-fizz", name: "Sunset Fizz", from: "#ff7e5f", to: "#feb47b", angle: 135 },
  { id: "orchid", name: "Orchid", from: "#c471f5", to: "#fa71cd", angle: 135 },
  { id: "mint-leaf", name: "Mint Leaf", from: "#43e97b", to: "#38f9d7", angle: 135 },
  { id: "peach-cream", name: "Peach Cream", from: "#ffecd2", to: "#fcb69f", angle: 135 },
  { id: "midnight", name: "Midnight", from: "#0f2027", to: "#2c5364", angle: 160 },
  { id: "violet-rush", name: "Violet Rush", from: "#8e2de2", to: "#4a00e0", angle: 135 },
  { id: "citrus", name: "Citrus", from: "#f7971e", to: "#ffd200", angle: 120 },
  { id: "rose-quartz", name: "Rose Quartz", from: "#fbc2eb", to: "#a6c1ee", angle: 135 },
  { id: "deep-sea", name: "Deep Sea", from: "#2b5876", to: "#4e4376", angle: 135 },
  { id: "ember", name: "Ember", from: "#f12711", to: "#f5af19", angle: 135 },
  { id: "glacier", name: "Glacier", from: "#e0eafc", to: "#cfdef3", angle: 180 },
  { id: "aurora", name: "Aurora", from: "#00f260", to: "#0575e6", angle: 135 },
  { id: "plum-dusk", name: "Plum Dusk", from: "#614385", to: "#516395", angle: 135 },
  { id: "coral-reef", name: "Coral Reef", from: "#ff9a9e", to: "#fecfef", angle: 135 },
  { id: "graphite", name: "Graphite", from: "#232526", to: "#414345", angle: 135 },
  { id: "nebula", name: "Nebula", from: "#7f00ff", to: "#e100ff", angle: 135 },
  { id: "lime-soda", name: "Lime Soda", from: "#d4fc79", to: "#96e6a1", angle: 135 },
];

export type SolidPreset = { name: string; color: string };

export const SOLID_PRESETS: readonly SolidPreset[] = [
  { name: "White", color: "#ffffff" },
  { name: "Mist", color: "#f1f1f4" },
  { name: "Charcoal", color: "#1c1c21" },
  { name: "Black", color: "#000000" },
  { name: "Red", color: "#ef4444" },
  { name: "Orange", color: "#f97316" },
  { name: "Yellow", color: "#facc15" },
  { name: "Green", color: "#22c55e" },
  { name: "Cyan", color: "#06b6d4" },
  { name: "Blue", color: "#3b82f6" },
  { name: "Violet", color: "#8b5cf6" },
  { name: "Pink", color: "#ec4899" },
];

export type AspectRatioPreset = {
  id: AspectRatio;
  label: string;
  /** Fixed canvas size, or null for "auto" (image plus padding). */
  size: { width: number; height: number } | null;
};

export const ASPECT_RATIOS: readonly AspectRatioPreset[] = [
  { id: "auto", label: "Auto", size: null },
  { id: "16:9", label: "16:9", size: { width: 1920, height: 1080 } },
  { id: "1:1", label: "1:1", size: { width: 1080, height: 1080 } },
  { id: "4:5", label: "4:5", size: { width: 1080, height: 1350 } },
  { id: "9:16", label: "9:16", size: { width: 1080, height: 1920 } },
  { id: "4:3", label: "4:3", size: { width: 1600, height: 1200 } },
];

export const ASPECT_RATIO_IDS: readonly AspectRatio[] = ASPECT_RATIOS.map((r) => r.id);

export const SHADOW_OPTIONS: readonly { id: ShadowPreset; label: string; short: string }[] = [
  { id: "none", label: "None", short: "None" },
  { id: "sm", label: "Small", short: "S" },
  { id: "md", label: "Medium", short: "M" },
  { id: "lg", label: "Large", short: "L" },
  { id: "xl", label: "Extra large", short: "XL" },
];

export const SHADOW_IDS: readonly ShadowPreset[] = SHADOW_OPTIONS.map((s) => s.id);

/** [offsetY, blur, spread, relative alpha] per layer, in px at a 1000px-wide frame. */
const SHADOW_LAYERS: Record<Exclude<ShadowPreset, "none">, readonly (readonly [number, number, number, number])[]> = {
  sm: [
    [2, 6, 0, 0.55],
    [1, 2, 0, 0.35],
  ],
  md: [
    [10, 24, -4, 0.7],
    [4, 10, -2, 0.4],
  ],
  lg: [
    [24, 50, -10, 0.85],
    [10, 20, -6, 0.45],
  ],
  xl: [
    [40, 90, -16, 1],
    [18, 40, -12, 0.55],
  ],
};

/**
 * The same preset as a `filter: drop-shadow()` chain. Follows the alpha shape, so it
 * suits non-rectangular frames (laptop) and 3D-tilted slots.
 */
export function shadowFilterCss(preset: ShadowPreset, opacityPercent: number, unit: number): string | undefined {
  if (preset === "none" || opacityPercent <= 0) return undefined;
  const u = Math.min(2.5, Math.max(0.4, unit));
  const opacity = opacityPercent / 100;
  return SHADOW_LAYERS[preset]
    .map(
      ([y, blur, , alpha]) =>
        `drop-shadow(0px ${(y * u).toFixed(1)}px ${(blur * u).toFixed(1)}px rgba(0, 0, 0, ${(alpha * opacity).toFixed(3)}))`,
    )
    .join(" ");
}

/**
 * CSS box-shadow for a preset. `unit` scales the shadow with the frame size so it
 * looks the same on a small 1:1 canvas and a large auto-sized one.
 */
export function shadowCss(preset: ShadowPreset, opacityPercent: number, unit: number): string | undefined {
  if (preset === "none" || opacityPercent <= 0) return undefined;
  const u = Math.min(2.5, Math.max(0.4, unit));
  const opacity = opacityPercent / 100;
  return SHADOW_LAYERS[preset]
    .map(
      ([y, blur, spread, alpha]) =>
        `0px ${(y * u).toFixed(1)}px ${(blur * u).toFixed(1)}px ${(spread * u).toFixed(1)}px rgba(0, 0, 0, ${(alpha * opacity).toFixed(3)})`,
    )
    .join(", ");
}

export const FRAME_OPTIONS: readonly { id: FrameType; label: string }[] = [
  { id: "none", label: "None" },
  { id: "browser-light", label: "Browser light" },
  { id: "browser-dark", label: "Browser dark" },
  { id: "window", label: "Window" },
  { id: "phone", label: "Phone" },
  { id: "tablet", label: "Tablet" },
  { id: "laptop", label: "Laptop" },
];

export const SLOT_SHADOW_OPTIONS: readonly { id: SlotShadow; label: string; short: string }[] = [
  ...SHADOW_OPTIONS,
  { id: "floating", label: "Floating", short: "Float" },
];

export const SLOT_SHADOW_IDS: readonly SlotShadow[] = SLOT_SHADOW_OPTIONS.map((s) => s.id);

/** System font stacks only, so exports render identically without font embedding. */
export const FONT_STACKS: Record<FontFamily, string> = {
  sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  serif: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", serif',
  mono: 'ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace',
};

export const TEMPLATE_CATEGORIES: readonly { id: TemplateCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "device", label: "Device" },
  { id: "3d", label: "3D Perspective" },
  { id: "isometric", label: "Isometric" },
  { id: "stack", label: "Stack" },
  { id: "multi", label: "Multi-screen" },
  { id: "text", label: "With text" },
];

export const FRAME_IDS: readonly FrameType[] = FRAME_OPTIONS.map((f) => f.id);

export const EXPORT_SCALES: readonly ExportScale[] = [1, 2, 3];

export function linearGradientCss(from: string, to: string, angle: number): string {
  return `linear-gradient(${angle}deg, ${from}, ${to})`;
}

export function backgroundCss(background: Background): string | undefined {
  switch (background.type) {
    case "gradient":
      return linearGradientCss(background.from, background.to, background.angle);
    case "solid":
      return background.color;
    case "transparent":
      return undefined;
  }
}

export function gradientFromPreset(preset: GradientPreset): GradientBackground {
  return { type: "gradient", from: preset.from, to: preset.to, angle: preset.angle };
}

const firstGradient = GRADIENT_PRESETS[0];
if (!firstGradient) throw new Error("GRADIENT_PRESETS must not be empty");

export const DEFAULT_SETTINGS: StyleSettings = {
  aspectRatio: "auto",
  background: gradientFromPreset(firstGradient),
  padding: 64,
  scale: 90,
  radius: 12,
  rotation: 0,
  shadow: "lg",
  shadowOpacity: 40,
  border: { enabled: false, color: "#ffffff", width: 2 },
  frame: "none",
  browserUrl: "example.com",
  exportScale: 2,
  position: { x: 0, y: 0 },
};

export const LIMITS = {
  padding: { min: 0, max: 200 },
  scale: { min: 50, max: 100 },
  radius: { min: 0, max: 40 },
  rotation: { min: -15, max: 15 },
  shadowOpacity: { min: 0, max: 100 },
  borderWidth: { min: 1, max: 8 },
  angle: { min: 0, max: 360 },
} as const;
