import type { ReactNode } from "react";
import { PHONE_BEZEL_RATIO } from "@/lib/layout";

type PhoneFrameProps = {
  width: number;
  height: number;
  screen: ReactNode;
  outerRadius: number;
};

/**
 * Generic phone: graphite body, a notch cut into the top edge with a camera dot,
 * and a home indicator. The screenshot covers the whole screen (object-fit: cover).
 */
export function PhoneFrame({ width, height, screen, outerRadius }: PhoneFrameProps) {
  const bezel = width * PHONE_BEZEL_RATIO;
  const screenRadius = Math.max(0, outerRadius - bezel);
  const notchWidth = width * 0.3;
  const notchHeight = width * 0.058;
  const camera = width * 0.022;

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: outerRadius,
        background: "linear-gradient(150deg, #3b3b43 0%, #18181c 42%, #0b0b0d 100%)",
        boxShadow: `inset 0 0 0 ${Math.max(1, width * 0.004)}px rgba(255, 255, 255, 0.14), inset 0 0 0 ${Math.max(2, width * 0.012)}px rgba(0, 0, 0, 0.55)`,
      }}
    >
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
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: notchWidth,
            height: notchHeight,
            background: "#0b0b0d",
            borderBottomLeftRadius: notchHeight * 0.62,
            borderBottomRightRadius: notchHeight * 0.62,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingRight: notchWidth * 0.2,
            boxSizing: "border-box",
          }}
        >
          <span
            style={{
              display: "block",
              width: camera,
              height: camera,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #3a4766 0%, #12131a 55%, #050506 100%)",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: width * 0.022,
            left: "50%",
            transform: "translateX(-50%)",
            width: width * 0.32,
            height: Math.max(2, width * 0.011),
            borderRadius: 999,
            background: "rgba(255, 255, 255, 0.75)",
            boxShadow: "0 0 2px rgba(0, 0, 0, 0.35)",
          }}
        />
      </div>
    </div>
  );
}
