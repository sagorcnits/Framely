import type { ReactNode } from "react";
import { TABLET_BEZEL_RATIO } from "@/lib/layout";

type TabletFrameProps = {
  width: number;
  height: number;
  screen: ReactNode;
  outerRadius: number;
};

/** Generic tablet: even graphite bezel with a front camera centered on a short edge. */
export function TabletFrame({ width, height, screen, outerRadius }: TabletFrameProps) {
  const bezel = width * TABLET_BEZEL_RATIO;
  const screenRadius = Math.max(0, outerRadius - bezel * 0.9);
  const camera = Math.max(2, Math.min(width, height) * 0.012);
  const landscape = width >= height;

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: outerRadius,
        background: "linear-gradient(155deg, #3a3a42 0%, #1a1a1f 45%, #0d0d10 100%)",
        boxShadow: `inset 0 0 0 ${Math.max(1, width * 0.003)}px rgba(255, 255, 255, 0.16), inset 0 0 0 ${Math.max(2, width * 0.008)}px rgba(0, 0, 0, 0.5)`,
      }}
    >
      <span
        style={{
          position: "absolute",
          width: camera,
          height: camera,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #34405e 0%, #101118 60%, #050506 100%)",
          ...(landscape
            ? { left: bezel / 2 - camera / 2, top: "50%", transform: "translateY(-50%)" }
            : { top: bezel / 2 - camera / 2, left: "50%", transform: "translateX(-50%)" }),
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: bezel,
          borderRadius: screenRadius,
          overflow: "hidden",
          background: "#000000",
        }}
      >
        {screen}
      </div>
    </div>
  );
}
