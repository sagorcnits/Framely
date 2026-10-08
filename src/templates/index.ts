import type { Template } from "@/types";
import { browserPhone } from "./browserPhone";
import { darkFloatingPages } from "./darkFloatingPages";
import { fanSpread } from "./fanSpread";
import { gridShowcase } from "./gridShowcase";
import { headlineHero } from "./headlineHero";
import { heroTilt } from "./heroTilt";
import { isometricStack } from "./isometricStack";
import { laptopHero } from "./laptopHero";
import { layeredCardsHeadline } from "./layeredCardsHeadline";
import { perspectiveCascade } from "./perspectiveCascade";
import { phoneTrio } from "./phoneTrio";
import { singleTabletTilt } from "./singleTabletTilt";
import { twinTablets } from "./twinTablets";

/** Gallery order. */
export const TEMPLATES: readonly Template[] = [
  twinTablets,
  perspectiveCascade,
  isometricStack,
  darkFloatingPages,
  layeredCardsHeadline,
  singleTabletTilt,
  phoneTrio,
  laptopHero,
  browserPhone,
  fanSpread,
  heroTilt,
  gridShowcase,
  headlineHero,
];

const BY_ID = new Map(TEMPLATES.map((t) => [t.id, t]));

export function getTemplate(id: string | null): Template | undefined {
  return id ? BY_ID.get(id) : undefined;
}
