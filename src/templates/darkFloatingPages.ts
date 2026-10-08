import type { Template } from "@/types";
import { CANVAS, gradient, slot } from "./helpers";

const page = { width: 0.4, aspect: 16 / 10, rotateX: 14, rotateY: -26, rotateZ: 2, perspective: 1800 };

export const darkFloatingPages: Template = {
  id: "dark-floating-pages",
  name: "Dark Floating Pages",
  category: "3d",
  tags: ["dark", "warm", "3d", "floating", "pages", "perspective"],
  premium: true,
  canvas: CANVAS,
  background: gradient("#3d2618", "#130b07", 160),
  slots: [
    slot("left", { ...page, x: 0.28, y: 0.6, zIndex: 1 }, { frame: "browser-dark", shadow: "floating" }),
    slot("center", { ...page, x: 0.5, y: 0.5, zIndex: 2 }, { frame: "browser-dark", shadow: "floating" }),
    slot("right", { ...page, x: 0.72, y: 0.4, zIndex: 3 }, { frame: "browser-dark", shadow: "floating" }),
  ],
  texts: [],
};
