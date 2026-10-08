import type { Template } from "@/types";
import { CANVAS, gradient, slot, text } from "./helpers";

export const headlineHero: Template = {
  id: "headline-hero",
  name: "Headline Hero",
  category: "text",
  tags: ["headline", "text", "dark", "launch", "announcement", "browser"],
  premium: false,
  canvas: CANVAS,
  background: gradient("#0f172a", "#1e3a8a", 180),
  slots: [slot("page", { x: 0.5, y: 0.65, width: 0.72, aspect: 16 / 10 }, { frame: "browser-dark", shadow: "xl" })],
  texts: [
    text("title", "Your product, beautifully framed", { y: 0.12, fontSize: 76, fontWeight: 800, color: "#ffffff" }),
    text("subtitle", "Launch-ready screenshots in seconds", { y: 0.21, fontSize: 34, fontWeight: 400, color: "#cbd5e1" }),
  ],
};
