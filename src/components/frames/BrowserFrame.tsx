import type { ReactNode } from "react";
import { BROWSER_BAR_RATIO } from "@/lib/layout";
import { TrafficLights } from "./TrafficLights";

const THEMES = {
  light: { bar: "#f0f0f3", divider: "#dfdfe4", field: "#ffffff", text: "#5c5c66", icon: "#8a8a94", body: "#ffffff" },
  dark: { bar: "#222227", divider: "#34343b", field: "#141418", text: "#a5a5b0", icon: "#71717c", body: "#0e0e11" },
} as const;

const SYSTEM_FONT = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

type BrowserFrameProps = {
  variant: keyof typeof THEMES;
  width: number;
  height: number;
  screen: ReactNode;
  radius: number;
  url: string;
};

function LockIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <rect x="5" y="11" width="14" height="10" rx="2.5" stroke={color} strokeWidth="2.4" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/** Browser window: title bar with dots and an optional URL bar. Empty `url` hides the URL bar. */
export function BrowserFrame({ variant, width, height, screen, radius, url }: BrowserFrameProps) {
  const theme = THEMES[variant];
  const bar = width * BROWSER_BAR_RATIO;
  const label = url.trim();

  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        overflow: "hidden",
        background: theme.body,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          position: "relative",
          height: bar,
          flexShrink: 0,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          padding: `0 ${bar * 0.42}px`,
          background: theme.bar,
          borderBottom: `${Math.max(1, bar * 0.02)}px solid ${theme.divider}`,
        }}
      >
        <TrafficLights size={bar * 0.24} gap={bar * 0.15} />
        {label ? (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "48%",
              height: bar * 0.6,
              boxSizing: "border-box",
              padding: `0 ${bar * 0.3}px`,
              borderRadius: bar * 0.18,
              background: theme.field,
              color: theme.text,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: bar * 0.12,
              fontFamily: SYSTEM_FONT,
              fontSize: bar * 0.27,
              lineHeight: 1,
            }}
          >
            <LockIcon size={bar * 0.25} color={theme.icon} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
          </div>
        ) : null}
      </div>
      <div style={{ position: "relative", width: "100%", height: Math.max(0, height - bar), overflow: "hidden", flexShrink: 0 }}>
        {screen}
      </div>
    </div>
  );
}
