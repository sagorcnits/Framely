import type { Template } from "@/types";
import { CANVAS, slot, solid, text } from "./helpers";

export const layeredCardsHeadline: Template = {
  id: "layered-cards-headline",
  name: "Layered Cards with Headline",
  category: "text",
  tags: ["cards", "headline", "serif", "text", "layered", "pale blue", "marketing"],
  premium: true,
  canvas: CANVAS,
  background: solid("#dbe8f6"),
  slots: [
    slot("page", { x: 0.42, y: 0.6, width: 0.58, aspect: 16 / 10, zIndex: 2 }, { frame: "browser-light", shadow: "xl" }),
    slot("card-1", { x: 0.13, y: 0.36, width: 0.17, aspect: 0.8, rotateZ: -4, zIndex: 3 }, { radius: 18, shadow: "floating" }),
    slot("card-2", { x: 0.8, y: 0.52, width: 0.15, aspect: 1, rotateZ: 3, zIndex: 3 }, { radius: 18, shadow: "floating" }),
    slot("card-3", { x: 0.74, y: 0.82, width: 0.2, aspect: 1.5, rotateZ: -2, zIndex: 4 }, { radius: 18, shadow: "floating" }),
  ],
  texts: [
    text("headline", "Designed to\nbe noticed.", {
      x: 0.95,
      y: 0.16,
      fontSize: 76,
      fontWeight: 600,
      color: "#10243e",
      align: "right",
      fontFamily: "serif",
    }),
  ],
};
