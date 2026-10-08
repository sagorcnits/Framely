import type { Template } from "@/types";
import { CANVAS, gradient, slot } from "./helpers";

export const browserPhone: Template = {
  id: "browser-phone",
  name: "Browser + Phone",
  category: "multi",
  tags: ["responsive", "browser", "phone", "desktop", "mobile", "multi"],
  premium: false,
  canvas: CANVAS,
  background: gradient("#e3f8f2", "#afe3d4", 135),
  slots: [
    slot("desktop", { x: 0.44, y: 0.46, width: 0.66, aspect: 16 / 10, zIndex: 1 }, { frame: "browser-light", shadow: "xl" }),
    slot("mobile", { x: 0.79, y: 0.64, width: 0.16, aspect: 0.48, zIndex: 2 }, { frame: "phone", shadow: "xl" }),
  ],
  texts: [],
};
