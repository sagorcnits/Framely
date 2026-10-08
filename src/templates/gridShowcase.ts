import type { Template } from "@/types";
import { CANVAS, slot, solid } from "./helpers";

// 672×420 tiles with 48px gaps, centered on the 1600×1200 canvas.
const tile = { width: 0.42, aspect: 1.6 };

export const gridShowcase: Template = {
  id: "grid-showcase",
  name: "Grid Showcase",
  category: "multi",
  tags: ["grid", "four", "flat", "gallery", "multi"],
  premium: false,
  canvas: CANVAS,
  background: solid("#f1f2f5"),
  slots: [
    slot("top-left", { ...tile, x: 0.275, y: 0.305 }, { radius: 14, shadow: "md" }),
    slot("top-right", { ...tile, x: 0.725, y: 0.305 }, { radius: 14, shadow: "md" }),
    slot("bottom-left", { ...tile, x: 0.275, y: 0.695 }, { radius: 14, shadow: "md" }),
    slot("bottom-right", { ...tile, x: 0.725, y: 0.695 }, { radius: 14, shadow: "md" }),
  ],
  texts: [],
};
