const DOT_COLORS = ["#ff6159", "#ffbd2e", "#29c946"] as const;

type TrafficLightsProps = { size: number; gap: number };

/** Three window-control dots, drawn with plain CSS. */
export function TrafficLights({ size, gap }: TrafficLightsProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap, flexShrink: 0 }}>
      {DOT_COLORS.map((color) => (
        <span
          key={color}
          style={{
            display: "block",
            width: size,
            height: size,
            borderRadius: "50%",
            background: color,
            boxShadow: `inset 0 0 0 ${Math.max(0.5, size * 0.06)}px rgba(0, 0, 0, 0.12)`,
          }}
        />
      ))}
    </div>
  );
}
