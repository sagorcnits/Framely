import type { ReactNode } from "react";
import { WINDOW_BAR_RATIO } from "@/lib/layout";
import { TrafficLights } from "./TrafficLights";

type WindowFrameProps = {
  width: number;
  height: number;
  screen: ReactNode;
  radius: number;
};

/** Minimal app window: a thin title bar with dots only. */
export function WindowFrame({ width, height, screen, radius }: WindowFrameProps) {
  const bar = width * WINDOW_BAR_RATIO;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        overflow: "hidden",
        background: "#f7f7f9",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: bar,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          padding: `0 ${bar * 0.45}px`,
          background: "#f7f7f9",
        }}
      >
        <TrafficLights size={bar * 0.32} gap={bar * 0.2} />
      </div>
      <div style={{ position: "relative", width: "100%", height: Math.max(0, height - bar), overflow: "hidden", flexShrink: 0 }}>
        {screen}
      </div>
    </div>
  );
}
