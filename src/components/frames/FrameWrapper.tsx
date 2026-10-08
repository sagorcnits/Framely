import type { ReactNode } from "react";
import { frameOuterRadius } from "@/lib/layout";
import { shadowCss, shadowFilterCss } from "@/lib/presets";
import type { BorderSettings, FrameType, ShadowPreset } from "@/types";
import { BrowserFrame } from "./BrowserFrame";
import { LaptopFrame } from "./LaptopFrame";
import { PhoneFrame } from "./PhoneFrame";
import { TabletFrame } from "./TabletFrame";
import { WindowFrame } from "./WindowFrame";

const NO_BORDER: BorderSettings = { enabled: false, color: "#ffffff", width: 1 };

type FrameWrapperProps = {
  frame: FrameType;
  /** What fills the frame's screen area (an image, or a placeholder). */
  screen: ReactNode;
  width: number;
  height: number;
  radius: number;
  shadow?: ShadowPreset;
  shadowOpacity?: number;
  border?: BorderSettings;
  browserUrl: string;
};

/** Applies the shared corner radius, shadow and border around whichever frame is selected. */
export function FrameWrapper({
  frame,
  screen,
  width,
  height,
  radius,
  shadow = "none",
  shadowOpacity = 0,
  border = NO_BORDER,
  browserUrl,
}: FrameWrapperProps) {
  const outerRadius = frameOuterRadius(frame, width, height, radius);
  const unit = width / 1000;
  // The laptop isn't a rectangle, so its shadow must follow the alpha shape.
  const isLaptop = frame === "laptop";

  let content: ReactNode;
  switch (frame) {
    case "browser-light":
    case "browser-dark":
      content = (
        <BrowserFrame
          variant={frame === "browser-light" ? "light" : "dark"}
          width={width}
          height={height}
          screen={screen}
          radius={radius}
          url={browserUrl}
        />
      );
      break;
    case "window":
      content = <WindowFrame width={width} height={height} screen={screen} radius={radius} />;
      break;
    case "phone":
      content = <PhoneFrame width={width} height={height} screen={screen} outerRadius={outerRadius} />;
      break;
    case "tablet":
      content = <TabletFrame width={width} height={height} screen={screen} outerRadius={outerRadius} />;
      break;
    case "laptop":
      content = <LaptopFrame width={width} height={height} screen={screen} radius={radius} border={border} />;
      break;
    case "none":
      content = (
        <div style={{ position: "relative", width, height, borderRadius: radius, overflow: "hidden" }}>{screen}</div>
      );
      break;
  }

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: isLaptop ? undefined : outerRadius,
        boxShadow: isLaptop ? undefined : shadowCss(shadow, shadowOpacity, unit),
        filter: isLaptop ? shadowFilterCss(shadow, shadowOpacity, unit) : undefined,
      }}
    >
      {content}
      {border.enabled && !isLaptop ? (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            boxSizing: "border-box",
            borderRadius: outerRadius,
            border: `${border.width}px solid ${border.color}`,
            pointerEvents: "none",
          }}
        />
      ) : null}
    </div>
  );
}
