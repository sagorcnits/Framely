import type { Template } from "@/types";
import { CANVAS, gradient, slot } from "./helpers";

const phone = { aspect: 0.48 };

export const phoneTrio: Template = {
  id: "phone-trio",
  name: "Phone Trio",
  category: "device",
  tags: ["phone", "mobile", "app", "three", "device"],
  premium: false,
  canvas: CANVAS,
  background: gradient("#ffd8bf", "#ff9f8f", 135),
  slots: [
    slot("left", { ...phone, x: 0.32, y: 0.53, width: 0.17, zIndex: 1 }, { frame: "phone", shadow: "lg" }),
    slot("center", { ...phone, x: 0.5, y: 0.5, width: 0.21, zIndex: 3 }, { frame: "phone", shadow: "xl" }),
    slot("right", { ...phone, x: 0.68, y: 0.53, width: 0.17, zIndex: 1 }, { frame: "phone", shadow: "lg" }),
  ],
  texts: [],
};
