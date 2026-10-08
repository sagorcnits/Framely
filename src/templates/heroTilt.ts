import type { Template } from "@/types";
import { CANVAS, gradient, slot } from "./helpers";

export const heroTilt: Template = {
  id: "hero-tilt",
  name: "Hero Tilt",
  category: "3d",
  tags: ["hero", "3d", "tilt", "browser", "cropped", "bold"],
  premium: true,
  canvas: CANVAS,
  background: gradient("#667eea", "#764ba2", 135),
  slots: [
    slot(
      "hero",
      { x: 0.64, y: 0.64, width: 1, aspect: 16 / 10, rotateX: 22, rotateY: -24, rotateZ: 6, perspective: 1600 },
      { frame: "browser-light", radius: 16, shadow: "floating" },
    ),
  ],
  texts: [],
};
