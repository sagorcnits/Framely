import type { Template } from "@/types";
import { CANVAS, slot, solid } from "./helpers";

export const twinTablets: Template = {
  id: "twin-tablets",
  name: "Twin Tablets",
  category: "device",
  tags: ["tablet", "pair", "device", "side by side", "light"],
  premium: false,
  canvas: CANVAS,
  background: solid("#eceef1"),
  slots: [
    slot("front", { x: 0.34, y: 0.46, width: 0.5, aspect: 4 / 3, zIndex: 2 }, { frame: "tablet", radius: 10, shadow: "xl" }),
    slot("back", { x: 0.68, y: 0.56, width: 0.46, aspect: 4 / 3, zIndex: 1 }, { frame: "tablet", radius: 10, shadow: "lg" }),
  ],
  texts: [],
};
