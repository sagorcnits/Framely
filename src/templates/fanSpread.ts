import type { Template } from "@/types";
import { CANVAS, gradient, slot } from "./helpers";

const page = { width: 0.24, aspect: 0.72 };

export const fanSpread: Template = {
  id: "fan-spread",
  name: "Fan Spread",
  category: "stack",
  tags: ["fan", "stack", "cards", "spread", "pages"],
  premium: false,
  canvas: CANVAS,
  background: gradient("#fde68a", "#fca5a5", 135),
  slots: [
    slot("p1", { ...page, x: 0.29, y: 0.54, rotateZ: -12, zIndex: 1 }, { radius: 14, shadow: "lg" }),
    slot("p2", { ...page, x: 0.43, y: 0.49, rotateZ: -4, zIndex: 2 }, { radius: 14, shadow: "lg" }),
    slot("p3", { ...page, x: 0.57, y: 0.49, rotateZ: 4, zIndex: 3 }, { radius: 14, shadow: "lg" }),
    slot("p4", { ...page, x: 0.71, y: 0.54, rotateZ: 12, zIndex: 4 }, { radius: 14, shadow: "lg" }),
  ],
  texts: [],
};
