import type { ReactNode } from "react";
import { LAPTOP } from "@/lib/layout";
import type { BorderSettings } from "@/types";

type LaptopFrameProps = {
  width: number;
  height: number;
  screen: ReactNode;
  radius: number;
  /** Optional outline drawn around the lid (the laptop isn't a rectangle). */
  border?: BorderSettings;
};

/** Generic laptop: dark lid with a thin bezel and camera, on a slim aluminium base. */
export function LaptopFrame({ width, height, screen, radius, border }: LaptopFrameProps) {
  const inset = width * LAPTOP.lidInset;
  const base = width * LAPTOP.base;
  const lidWidth = width - inset * 2;
  const lidHeight = Math.max(0, height - base);
  const side = width * LAPTOP.sideBezel;
  const top = width * LAPTOP.topBezel;
  const chin = width * LAPTOP.chin;
  const lidRadius = Math.max(width * 0.014, radius * 0.8);
  const camera = Math.max(2, width * 0.006);

  return (
    <div style={{ position: "relative", width, height }}>
      {/* Lid */}
      <div
        style={{
          position: "absolute",
          left: inset,
          top: 0,
          width: lidWidth,
          height: lidHeight,
          borderRadius: `${lidRadius}px ${lidRadius}px ${width * 0.003}px ${width * 0.003}px`,
          background: "linear-gradient(180deg, #26262c 0%, #141417 100%)",
          boxShadow: `inset 0 0 0 ${Math.max(1, width * 0.0025)}px rgba(255, 255, 255, 0.14)`,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: top / 2 - camera / 2,
            left: "50%",
            transform: "translateX(-50%)",
            width: camera,
            height: camera,
            borderRadius: "50%",
            background: "#2b3247",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: side,
            top,
            width: Math.max(0, lidWidth - side * 2),
            height: Math.max(0, lidHeight - top - chin),
            overflow: "hidden",
            borderRadius: width * 0.003,
            background: "#000000",
          }}
        >
          {screen}
        </div>
        {border?.enabled ? (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              boxSizing: "border-box",
              borderRadius: "inherit",
              border: `${border.width}px solid ${border.color}`,
              pointerEvents: "none",
            }}
          />
        ) : null}
      </div>
      {/* Base */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width,
          height: base,
          borderRadius: `${base * 0.15}px ${base * 0.15}px ${base * 0.9}px ${base * 0.9}px`,
          background: "linear-gradient(180deg, #e4e6ea 0%, #c3c6cc 38%, #8f939b 100%)",
          boxShadow: `inset 0 ${Math.max(1, base * 0.06)}px 0 rgba(255, 255, 255, 0.7)`,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: width * 0.14,
            height: base * 0.3,
            borderRadius: `0 0 ${base * 0.3}px ${base * 0.3}px`,
            background: "linear-gradient(180deg, #a7abb2, #c9ccd2)",
          }}
        />
      </div>
    </div>
  );
}
