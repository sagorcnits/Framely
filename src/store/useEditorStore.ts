import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import {
  ASPECT_RATIO_IDS,
  DEFAULT_SETTINGS,
  EXPORT_SCALES,
  FRAME_IDS,
  GRADIENT_PRESETS,
  LIMITS,
  SHADOW_IDS,
  SLOT_SHADOW_IDS,
  gradientFromPreset,
} from "@/lib/presets";
import { newId } from "@/lib/templateLayout";
import { clamp, randomItem } from "@/lib/utils";
import { getTemplate } from "@/templates";
import type {
  AspectRatio,
  Background,
  BorderSettings,
  CanvasSize,
  EditorImage,
  EditorMode,
  ExportScale,
  FontFamily,
  FrameType,
  Position,
  ShadowPreset,
  Slot,
  SlotTransform,
  StyleSettings,
  Template,
  TextAlign,
  TextLayer,
} from "@/types";

export type SlotPatch = Partial<Omit<Slot, "id" | "transform">> & { transform?: Partial<SlotTransform> };
export type TextPatch = Partial<Omit<TextLayer, "id">>;

type TemplateState = {
  mode: EditorMode;
  activeTemplateId: string | null;
  templateCanvas: CanvasSize;
  /** Working copy of the active template's slots. */
  slots: Slot[];
  slotImages: Record<string, EditorImage | null>;
  texts: TextLayer[];
  /** Selected slot or text layer id (template mode). */
  selectedId: string | null;
  useOneImage: boolean;
};

type EditorActions = {
  setImage: (image: EditorImage) => void;
  removeImage: () => void;
  setAspectRatio: (aspectRatio: AspectRatio) => void;
  setBackground: (background: Background) => void;
  setPadding: (padding: number) => void;
  setScale: (scale: number) => void;
  setRadius: (radius: number) => void;
  setRotation: (rotation: number) => void;
  setShadow: (shadow: ShadowPreset) => void;
  setShadowOpacity: (opacity: number) => void;
  setBorder: (border: Partial<BorderSettings>) => void;
  setFrame: (frame: FrameType) => void;
  setBrowserUrl: (url: string) => void;
  setExportScale: (scale: ExportScale) => void;
  /** Offset from the canvas center in canvas pixels. Clamped to the canvas by `computeLayout`. */
  setPosition: (position: Position) => void;
  resetPosition: () => void;
  setSelected: (selected: boolean) => void;
  /** Restores every style setting to its default. Keeps the image. */
  reset: () => void;
  /** Picks a random gradient, padding and shadow. */
  randomize: () => void;

  // Templates
  setGalleryOpen: (open: boolean) => void;
  /** Loads a template; existing images fill the new slots in order. */
  applyTemplate: (template: Template) => void;
  exitTemplateMode: () => void;
  /** Restores the template's layout and texts, keeping the user's images. */
  resetTemplate: () => void;
  setSlotImage: (slotId: string, image: EditorImage) => void;
  removeSlotImage: (slotId: string) => void;
  updateSlot: (id: string, patch: SlotPatch) => void;
  duplicateSlot: (id: string) => void;
  deleteSlot: (id: string) => void;
  /** Moves a slot one step up (1) or down (−1) in the stacking order. */
  moveSlotLayer: (id: string, direction: 1 | -1) => void;
  addText: () => void;
  updateText: (id: string, patch: TextPatch) => void;
  deleteText: (id: string) => void;
  select: (id: string | null) => void;
  setUseOneImage: (value: boolean) => void;
};

export type EditorState = {
  image: EditorImage | null;
  /** Screenshot selected in the preview (outline shown, arrow keys nudge). Not persisted. */
  isSelected: boolean;
  isGalleryOpen: boolean;
} & StyleSettings &
  TemplateState &
  EditorActions;

/** True when there is something worth exporting in the current mode. */
export function selectHasContent(s: EditorState): boolean {
  if (s.mode === "simple") return s.image !== null;
  return s.slots.some((slot) => s.slotImages[slot.id]) || s.texts.length > 0;
}

/**
 * Slot that an imported image goes to: the explicit target, else the selected slot,
 * else the first empty slot, else the first slot.
 */
export function resolveTargetSlot(s: EditorState, slotId?: string): string | null {
  if (slotId && s.slots.some((slot) => slot.id === slotId)) return slotId;
  if (s.selectedId && s.slots.some((slot) => slot.id === s.selectedId)) return s.selectedId;
  return s.slots.find((slot) => !s.slotImages[slot.id])?.id ?? s.slots[0]?.id ?? null;
}

/** localStorage can throw (private mode, quota, disabled storage) — never let it break the app. */
const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      // Storage unavailable or full: settings simply won't persist.
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name);
    } catch {
      // Ignore.
    }
  },
};

// ---------- Persisted-state validation ----------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isOneOf<T>(value: unknown, options: readonly T[]): value is T {
  return options.includes(value as T);
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{3,8}$/i.test(value);
}

function sanitizeBackground(value: unknown): Background | undefined {
  if (!isRecord(value)) return undefined;
  if (value.type === "transparent") return { type: "transparent" };
  if (value.type === "solid" && isColor(value.color)) return { type: "solid", color: value.color };
  if (value.type === "gradient" && isColor(value.from) && isColor(value.to) && isNumber(value.angle)) {
    return { type: "gradient", from: value.from, to: value.to, angle: clamp(value.angle, 0, 360) };
  }
  return undefined;
}

const TRANSFORM_KEYS = ["x", "y", "width", "aspect", "rotateX", "rotateY", "rotateZ", "perspective", "zIndex"] as const;

function sanitizeSlot(raw: unknown): Slot | null {
  if (!isRecord(raw) || typeof raw.id !== "string" || !isRecord(raw.transform)) return null;
  const t = raw.transform;
  if (!TRANSFORM_KEYS.every((key) => isNumber(t[key]))) return null;
  if (!isOneOf(raw.frame, FRAME_IDS) || !isOneOf(raw.shadow, SLOT_SHADOW_IDS) || !isNumber(raw.radius)) return null;
  if (!isOneOf(raw.fit, ["cover", "contain"] as const) || !isOneOf(raw.objectPosition, ["top", "center"] as const)) {
    return null;
  }
  const n = (key: (typeof TRANSFORM_KEYS)[number]) => t[key] as number;
  return {
    id: raw.id,
    transform: {
      x: clamp(n("x"), -1, 2),
      y: clamp(n("y"), -1, 2),
      width: clamp(n("width"), 0.02, 3),
      aspect: clamp(n("aspect"), 0.1, 10),
      rotateX: clamp(n("rotateX"), -89, 89),
      rotateY: clamp(n("rotateY"), -89, 89),
      rotateZ: clamp(n("rotateZ"), -180, 180),
      perspective: clamp(n("perspective"), 0, 5000),
      zIndex: clamp(Math.round(n("zIndex")), 0, 999),
    },
    frame: raw.frame,
    radius: clamp(raw.radius, 0, 80),
    shadow: raw.shadow,
    fit: raw.fit,
    objectPosition: raw.objectPosition,
    scroll: isNumber(raw.scroll) ? clamp(raw.scroll, 0, 100) : null,
  };
}

const FONT_FAMILIES: readonly FontFamily[] = ["sans", "serif", "mono"];
const TEXT_ALIGNS: readonly TextAlign[] = ["left", "center", "right"];

function sanitizeText(raw: unknown): TextLayer | null {
  if (!isRecord(raw) || typeof raw.id !== "string" || typeof raw.text !== "string") return null;
  if (!isNumber(raw.x) || !isNumber(raw.y) || !isNumber(raw.fontSize) || !isNumber(raw.fontWeight)) return null;
  if (!isColor(raw.color) || !isOneOf(raw.align, TEXT_ALIGNS) || !isOneOf(raw.fontFamily, FONT_FAMILIES)) return null;
  return {
    id: raw.id,
    text: raw.text.slice(0, 500),
    x: clamp(raw.x, -1, 2),
    y: clamp(raw.y, -1, 2),
    fontSize: clamp(raw.fontSize, 8, 400),
    fontWeight: clamp(Math.round(raw.fontWeight / 100) * 100, 100, 900),
    color: raw.color,
    align: raw.align,
    fontFamily: raw.fontFamily,
  };
}

type PersistedState = StyleSettings &
  Pick<TemplateState, "mode" | "activeTemplateId" | "templateCanvas" | "slots" | "texts" | "useOneImage">;

/** Accepts only well-formed persisted values, so a stale or corrupt entry can't break the editor. */
function sanitizePersisted(raw: unknown): Partial<PersistedState> {
  if (!isRecord(raw)) return {};
  const out: Partial<PersistedState> = {};
  if (isOneOf(raw.aspectRatio, ASPECT_RATIO_IDS)) out.aspectRatio = raw.aspectRatio;
  const background = sanitizeBackground(raw.background);
  if (background) out.background = background;
  if (isNumber(raw.padding)) out.padding = clamp(raw.padding, LIMITS.padding.min, LIMITS.padding.max);
  if (isNumber(raw.scale)) out.scale = clamp(raw.scale, LIMITS.scale.min, LIMITS.scale.max);
  if (isNumber(raw.radius)) out.radius = clamp(raw.radius, LIMITS.radius.min, LIMITS.radius.max);
  if (isNumber(raw.rotation)) out.rotation = clamp(raw.rotation, LIMITS.rotation.min, LIMITS.rotation.max);
  if (isOneOf(raw.shadow, SHADOW_IDS)) out.shadow = raw.shadow;
  if (isNumber(raw.shadowOpacity)) {
    out.shadowOpacity = clamp(raw.shadowOpacity, LIMITS.shadowOpacity.min, LIMITS.shadowOpacity.max);
  }
  if (isRecord(raw.border) && typeof raw.border.enabled === "boolean" && isColor(raw.border.color) && isNumber(raw.border.width)) {
    out.border = {
      enabled: raw.border.enabled,
      color: raw.border.color,
      width: clamp(raw.border.width, LIMITS.borderWidth.min, LIMITS.borderWidth.max),
    };
  }
  if (isOneOf(raw.frame, FRAME_IDS)) out.frame = raw.frame;
  if (typeof raw.browserUrl === "string") out.browserUrl = raw.browserUrl.slice(0, 200);
  if (isOneOf(raw.exportScale, EXPORT_SCALES)) out.exportScale = raw.exportScale;
  if (isRecord(raw.position) && isNumber(raw.position.x) && isNumber(raw.position.y)) {
    // Loose bound only; the layout clamps precisely once the image size is known.
    out.position = { x: clamp(raw.position.x, -20000, 20000), y: clamp(raw.position.y, -20000, 20000) };
  }

  // Template state
  const slots = Array.isArray(raw.slots) ? raw.slots.map(sanitizeSlot).filter((s): s is Slot => s !== null) : [];
  const texts = Array.isArray(raw.texts) ? raw.texts.map(sanitizeText).filter((t): t is TextLayer => t !== null) : [];
  const canvasOk =
    isRecord(raw.templateCanvas) && isNumber(raw.templateCanvas.width) && isNumber(raw.templateCanvas.height);
  if (raw.mode === "template" && slots.length + texts.length > 0 && canvasOk) {
    out.mode = "template";
    out.activeTemplateId = typeof raw.activeTemplateId === "string" ? raw.activeTemplateId : null;
    out.templateCanvas = {
      width: clamp((raw.templateCanvas as CanvasSize).width, 100, 8000),
      height: clamp((raw.templateCanvas as CanvasSize).height, 100, 8000),
    };
    out.slots = slots;
    out.texts = texts;
  }
  if (typeof raw.useOneImage === "boolean") out.useOneImage = raw.useOneImage;
  return out;
}

function pickPersisted(state: EditorState): PersistedState {
  return {
    aspectRatio: state.aspectRatio,
    background: state.background,
    padding: state.padding,
    scale: state.scale,
    radius: state.radius,
    rotation: state.rotation,
    shadow: state.shadow,
    shadowOpacity: state.shadowOpacity,
    border: state.border,
    frame: state.frame,
    browserUrl: state.browserUrl,
    exportScale: state.exportScale,
    position: state.position,
    mode: state.mode,
    activeTemplateId: state.activeTemplateId,
    templateCanvas: state.templateCanvas,
    slots: state.slots,
    texts: state.texts,
    useOneImage: state.useOneImage,
  };
}

// ---------- Image bookkeeping ----------

/** Every object URL the state still references (simple image + slot images). */
function referencedUrls(s: Pick<EditorState, "image" | "slotImages">): Set<string> {
  const urls = new Set<string>();
  if (s.image) urls.add(s.image.url);
  for (const img of Object.values(s.slotImages)) if (img) urls.add(img.url);
  return urls;
}

/** Distinct images in reading order: the simple image first when in simple mode, then slot images. */
function imagePool(s: EditorState): EditorImage[] {
  const seen = new Set<string>();
  const pool: EditorImage[] = [];
  const add = (img: EditorImage | null | undefined) => {
    if (img && !seen.has(img.url)) {
      seen.add(img.url);
      pool.push(img);
    }
  };
  if (s.mode === "simple") add(s.image);
  for (const slot of s.slots) add(s.slotImages[slot.id]);
  if (s.mode === "template") add(s.image);
  return pool;
}

function fillSlots(slots: Slot[], pool: EditorImage[], useOne: boolean): Record<string, EditorImage | null> {
  const out: Record<string, EditorImage | null> = {};
  slots.forEach((slot, i) => {
    out[slot.id] = (useOne ? pool[0] : pool[i]) ?? null;
  });
  return out;
}

const RANDOM_SHADOWS: readonly ShadowPreset[] = ["sm", "md", "lg", "xl"];
const DEFAULT_TEMPLATE_STATE: TemplateState = {
  mode: "simple",
  activeTemplateId: null,
  templateCanvas: { width: 1600, height: 1200 },
  slots: [],
  slotImages: {},
  texts: [],
  selectedId: null,
  useOneImage: false,
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => {
      /** Applies a partial update, then revokes object URLs nothing references anymore. */
      const update = (partial: Partial<EditorState>) => {
        const before = referencedUrls(get());
        set(partial);
        const after = referencedUrls(get());
        for (const url of before) if (!after.has(url)) URL.revokeObjectURL(url);
      };

      const normalizeZ = (slots: Slot[]): Slot[] => {
        const order = [...slots].sort((a, b) => a.transform.zIndex - b.transform.zIndex);
        return slots.map((slot) => ({
          ...slot,
          transform: { ...slot.transform, zIndex: order.findIndex((s) => s.id === slot.id) + 1 },
        }));
      };

      return {
        image: null,
        isSelected: false,
        isGalleryOpen: false,
        ...DEFAULT_SETTINGS,
        ...DEFAULT_TEMPLATE_STATE,

        setImage: (image) => update({ image, position: { x: 0, y: 0 }, isSelected: false }),
        removeImage: () => update({ image: null, isSelected: false }),
        setAspectRatio: (aspectRatio) => set({ aspectRatio }),
        setBackground: (background) => set({ background }),
        setPadding: (padding) => set({ padding: clamp(padding, LIMITS.padding.min, LIMITS.padding.max) }),
        setScale: (scale) => set({ scale: clamp(scale, LIMITS.scale.min, LIMITS.scale.max) }),
        setRadius: (radius) => set({ radius: clamp(radius, LIMITS.radius.min, LIMITS.radius.max) }),
        setRotation: (rotation) =>
          set({ rotation: clamp(rotation, LIMITS.rotation.min, LIMITS.rotation.max) }),
        setShadow: (shadow) => set({ shadow }),
        setShadowOpacity: (shadowOpacity) =>
          set({ shadowOpacity: clamp(shadowOpacity, LIMITS.shadowOpacity.min, LIMITS.shadowOpacity.max) }),
        setBorder: (border) => {
          const next = { ...get().border, ...border };
          next.width = clamp(next.width, LIMITS.borderWidth.min, LIMITS.borderWidth.max);
          set({ border: next });
        },
        setFrame: (frame) => set({ frame }),
        setBrowserUrl: (browserUrl) => set({ browserUrl }),
        setExportScale: (exportScale) => set({ exportScale }),
        setPosition: (position) => {
          if (Number.isFinite(position.x) && Number.isFinite(position.y)) set({ position });
        },
        resetPosition: () => set({ position: { x: 0, y: 0 } }),
        setSelected: (isSelected) => set({ isSelected }),
        reset: () => set({ ...DEFAULT_SETTINGS }),
        randomize: () => {
          const { background } = get();
          const candidates = GRADIENT_PRESETS.filter(
            (p) => background.type !== "gradient" || p.from !== background.from || p.to !== background.to,
          );
          set({
            background: gradientFromPreset(randomItem(candidates)),
            padding: 32 + 8 * Math.floor(Math.random() * 17), // 32–160 in steps of 8
            shadow: randomItem(RANDOM_SHADOWS),
          });
        },

        // ---------- Templates ----------

        setGalleryOpen: (isGalleryOpen) => set({ isGalleryOpen }),

        applyTemplate: (template) => {
          const s = get();
          const slots = structuredClone(template.slots);
          update({
            mode: "template",
            activeTemplateId: template.id,
            templateCanvas: { ...template.canvas },
            background: structuredClone(template.background),
            slots,
            texts: structuredClone(template.texts),
            slotImages: fillSlots(slots, imagePool(s), s.useOneImage),
            selectedId: null,
            isSelected: false,
          });
        },

        exitTemplateMode: () => {
          const s = get();
          const fallback = s.image ?? imagePool(s)[0] ?? null;
          update({
            mode: "simple",
            selectedId: null,
            image: fallback,
            position: s.image ? s.position : { x: 0, y: 0 },
          });
        },

        resetTemplate: () => {
          const s = get();
          const template = getTemplate(s.activeTemplateId);
          if (!template) return;
          const slots = structuredClone(template.slots);
          // Keep images on slots that still exist, then fill empty ones with the leftovers.
          const slotImages: Record<string, EditorImage | null> = {};
          const used = new Set<string>();
          for (const slot of slots) {
            const img = s.slotImages[slot.id] ?? null;
            slotImages[slot.id] = img;
            if (img) used.add(img.url);
          }
          const leftovers = imagePool(s).filter((img) => !used.has(img.url));
          for (const slot of slots) {
            if (!slotImages[slot.id]) slotImages[slot.id] = leftovers.shift() ?? null;
          }
          update({
            slots,
            texts: structuredClone(template.texts),
            templateCanvas: { ...template.canvas },
            slotImages: s.useOneImage ? fillSlots(slots, imagePool(s), true) : slotImages,
            selectedId: null,
          });
        },

        setSlotImage: (slotId, image) => {
          const s = get();
          if (s.useOneImage) {
            update({ slotImages: fillSlots(s.slots, [image], true) });
          } else {
            update({ slotImages: { ...s.slotImages, [slotId]: image } });
          }
        },

        removeSlotImage: (slotId) => {
          const s = get();
          if (s.useOneImage) update({ slotImages: fillSlots(s.slots, [], true) });
          else update({ slotImages: { ...s.slotImages, [slotId]: null } });
        },

        updateSlot: (id, patch) =>
          set((s) => ({
            slots: s.slots.map((slot) =>
              slot.id === id
                ? { ...slot, ...patch, transform: { ...slot.transform, ...patch.transform } }
                : slot,
            ),
          })),

        duplicateSlot: (id) => {
          const s = get();
          const source = s.slots.find((slot) => slot.id === id);
          if (!source) return;
          const copy: Slot = {
            ...structuredClone(source),
            id: newId("slot"),
            transform: {
              ...source.transform,
              x: clamp(source.transform.x + 0.03, 0, 1),
              y: clamp(source.transform.y + 0.03, 0, 1),
              zIndex: Math.max(...s.slots.map((slot) => slot.transform.zIndex)) + 1,
            },
          };
          update({
            slots: [...s.slots, copy],
            slotImages: { ...s.slotImages, [copy.id]: s.slotImages[id] ?? null },
            selectedId: copy.id,
          });
        },

        deleteSlot: (id) => {
          const s = get();
          const slotImages = { ...s.slotImages };
          delete slotImages[id];
          update({
            slots: s.slots.filter((slot) => slot.id !== id),
            slotImages,
            selectedId: s.selectedId === id ? null : s.selectedId,
          });
        },

        moveSlotLayer: (id, direction) => {
          const order = [...normalizeZ(get().slots)].sort((a, b) => a.transform.zIndex - b.transform.zIndex);
          const index = order.findIndex((slot) => slot.id === id);
          const target = index + direction;
          const current = order[index];
          const neighbour = order[target];
          if (!current || !neighbour) return;
          order[index] = neighbour;
          order[target] = current;
          const z = new Map(order.map((slot, i) => [slot.id, i + 1]));
          set((s) => ({
            slots: s.slots.map((slot) => ({ ...slot, transform: { ...slot.transform, zIndex: z.get(slot.id) ?? 1 } })),
          }));
        },

        addText: () => {
          const s = get();
          const layer: TextLayer = {
            id: newId("text"),
            text: "Your headline",
            x: 0.5,
            y: 0.12,
            fontSize: Math.round(s.templateCanvas.width * 0.04),
            fontWeight: 700,
            color: s.background.type === "solid" && /^#(f|e|d)/i.test(s.background.color) ? "#111111" : "#ffffff",
            align: "center",
            fontFamily: "sans",
          };
          set({ texts: [...s.texts, layer], selectedId: layer.id });
        },

        updateText: (id, patch) =>
          set((s) => ({ texts: s.texts.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer)) })),

        deleteText: (id) =>
          set((s) => ({
            texts: s.texts.filter((layer) => layer.id !== id),
            selectedId: s.selectedId === id ? null : s.selectedId,
          })),

        select: (selectedId) => set({ selectedId }),

        setUseOneImage: (useOneImage) => {
          const s = get();
          if (!useOneImage) {
            set({ useOneImage });
            return;
          }
          const selectedImage = s.selectedId ? s.slotImages[s.selectedId] : null;
          const first = selectedImage ?? imagePool(s)[0];
          update({ useOneImage, ...(first ? { slotImages: fillSlots(s.slots, [first], true) } : {}) });
        },
      };
    },
    {
      name: "framely:settings",
      version: 1,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: pickPersisted,
      merge: (persisted, current) => {
        const restored = { ...current, ...sanitizePersisted(persisted) };
        restored.slotImages = Object.fromEntries(restored.slots.map((slot) => [slot.id, null]));
        return restored;
      },
    },
  ),
);
