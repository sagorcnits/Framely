import type { Template } from "@/types";
import { CANVAS, gradient, slot } from "./helpers";

const page = { width: 0.44, aspect: 16 / 10, rotateX: 50, rotateZ: -30, perspective: 2400 };

export const perspectiveCascade: Template = {
  id: "perspective-cascade",
  name: "Perspective Cascade",
  category: "3d",
  tags: ["3d", "perspective", "browser", "cascade", "diagonal", "pages"],
  premium: true,
  canvas: CANVAS,
  background: gradient("#e4e9f7", "#b4c1e6", 160),
  slots: [
    slot("page-1", { ...page, x: 0.31, y: 0.66, zIndex: 3 }, { frame: "browser-light", shadow: "xl" }),
    slot("page-2", { ...page, x: 0.5, y: 0.5, zIndex: 2 }, { frame: "browser-light", shadow: "xl" }),
    slot("page-3", { ...page, x: 0.69, y: 0.34, zIndex: 1 }, { frame: "browser-light", shadow: "xl" }),
  ],
  texts: [],
};
