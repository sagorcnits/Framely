export type AspectRatio = "auto" | "16:9" | "1:1" | "4:5" | "9:16" | "4:3";

export type GradientBackground = { type: "gradient"; from: string; to: string; angle: number };
export type SolidBackground = { type: "solid"; color: string };
export type TransparentBackground = { type: "transparent" };
export type Background = GradientBackground | SolidBackground | TransparentBackground;

export type ShadowPreset = "none" | "sm" | "md" | "lg" | "xl";
export type FrameType = "none" | "browser-light" | "browser-dark" | "window" | "phone" | "tablet" | "laptop";
export type ExportScale = 1 | 2 | 3;

export type EditorImage = { url: string; width: number; height: number };

export type BorderSettings = { enabled: boolean; color: string; width: number };

/** Offset of the screenshot's center from the canvas center, in canvas pixels. */
export type Position = { x: number; y: number };

/** Everything that describes the look of the mockup (persisted to localStorage). */
export type StyleSettings = {
  aspectRatio: AspectRatio;
  background: Background;
  /** Canvas padding in px (0–200). */
  padding: number;
  /** Screenshot scale in percent (50–100). */
  scale: number;
  /** Corner radius in px (0–40). */
  radius: number;
  /** Rotation in degrees (−15–15). */
  rotation: number;
  shadow: ShadowPreset;
  /** Shadow opacity in percent (0–100). */
  shadowOpacity: number;
  border: BorderSettings;
  frame: FrameType;
  /** Text in the browser frame's URL bar. Empty hides the URL bar. */
  browserUrl: string;
  exportScale: ExportScale;
  position: Position;
};

// ---------- Templates ----------

export type EditorMode = "simple" | "template";

export type SlotTransform = {
  /** Center position as a fraction of canvas width/height (0–1). */
  x: number;
  y: number;
  /** Width as a fraction of canvas width. */
  width: number;
  /** Width / height of the slot (including its frame). */
  aspect: number;
  /** Degrees. Applied as rotateX() rotateY() rotateZ(). */
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  /** Perspective distance in canvas px; 0 = flat (orthographic). */
  perspective: number;
  zIndex: number;
};

export type SlotShadow = ShadowPreset | "floating";

export type Slot = {
  id: string;
  transform: SlotTransform;
  frame: FrameType;
  radius: number;
  shadow: SlotShadow;
  fit: "cover" | "contain";
  /** 'top' suits tall webpage screenshots. */
  objectPosition: "top" | "center";
  /** Vertical scroll inside the slot (0–100%). Null follows `objectPosition`. */
  scroll: number | null;
};

export type FontFamily = "sans" | "serif" | "mono";
export type TextAlign = "left" | "center" | "right";

export type TextLayer = {
  id: string;
  text: string;
  /** Anchor position as a fraction of canvas width/height. */
  x: number;
  y: number;
  /** Canvas px. */
  fontSize: number;
  fontWeight: number;
  color: string;
  align: TextAlign;
  fontFamily: FontFamily;
};

export type TemplateCategory = "device" | "3d" | "isometric" | "stack" | "multi" | "text";

export type CanvasSize = { width: number; height: number };

export type Template = {
  id: string;
  name: string;
  category: TemplateCategory;
  tags: string[];
  /** Reserved for a future paid tier; premium templates are fully usable today. */
  premium: boolean;
  canvas: CanvasSize;
  background: Background;
  slots: Slot[];
  texts: TextLayer[];
};
