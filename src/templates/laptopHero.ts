import type { Template } from "@/types";
import { CANVAS, gradient, slot } from "./helpers";

export const laptopHero: Template = {
  id: "laptop-hero",
  name: "Laptop Hero",
  category: "device",
  tags: ["laptop", "desktop", "device", "hero", "gradient"],
  premium: false,
  canvas: CANVAS,
  background: gradient("#fbc2eb", "#a6c1ee", 135),
  slots: [slot("laptop", { x: 0.5, y: 0.53, width: 0.74, aspect: 1.6 }, { frame: "laptop", radius: 14, shadow: "xl" })],
  texts: [],
};
