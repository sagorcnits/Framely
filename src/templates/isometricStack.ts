import type { Template } from "@/types";
import { CANVAS, gradient, slot } from "./helpers";

const layer = { x: 0.5, width: 0.44, aspect: 16 / 10, rotateX: 55, rotateZ: -45, perspective: 0 };

export const isometricStack: Template = {
  id: "isometric-stack",
  name: "Isometric Stack",
  category: "isometric",
  tags: ["isometric", "stack", "layers", "pages", "flat"],
  premium: false,
  canvas: CANVAS,
  background: gradient("#f7f2ec", "#e6dacb", 160),
  slots: [
    slot("bottom", { ...layer, y: 0.66, zIndex: 1 }, { radius: 16, shadow: "floating" }),
    slot("middle", { ...layer, y: 0.5, zIndex: 2 }, { radius: 16, shadow: "floating" }),
    slot("top", { ...layer, y: 0.34, zIndex: 3 }, { radius: 16, shadow: "floating" }),
  ],
  texts: [],
};
