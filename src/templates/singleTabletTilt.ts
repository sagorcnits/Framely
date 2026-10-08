import type { Template } from "@/types";
import { CANVAS, gradient, slot } from "./helpers";

export const singleTabletTilt: Template = {
  id: "single-tablet-tilt",
  name: "Single Tablet Tilt",
  category: "3d",
  tags: ["tablet", "device", "3d", "tilt", "perspective"],
  premium: false,
  canvas: CANVAS,
  background: gradient("#a1c4fd", "#c2e9fb", 135),
  slots: [
    slot(
      "tablet",
      { x: 0.5, y: 0.5, width: 0.62, aspect: 4 / 3, rotateX: 10, rotateY: -20, perspective: 1800 },
      { frame: "tablet", radius: 10, shadow: "floating" },
    ),
  ],
  texts: [],
};
