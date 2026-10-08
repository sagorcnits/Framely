import { FrameWrapper } from "@/components/frames/FrameWrapper";
import { FONT_STACKS } from "@/lib/presets";
import { slotBox, slotScroll, slotShadowFilter } from "@/lib/templateLayout";
import type { CanvasSize, EditorImage, Slot } from "@/types";

/**
 * What an empty slot shows: nothing (export), a "Drop image here" hint (editor preview),
 * or neutral skeleton content (gallery thumbnails).
 */
export type SlotPlaceholder = "none" | "label" | "gray";

type SlotRendererProps = {
  slot: Slot;
  canvas: CanvasSize;
  image: EditorImage | null;
  placeholder: SlotPlaceholder;
  browserUrl: string;
};

function PlaceholderLabel({ size }: { size: number }) {
  const fontSize = Math.max(12, Math.min(44, size * 0.07));
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: fontSize * 0.5,
        background: "repeating-linear-gradient(135deg, #e8eaef 0px, #e8eaef 16px, #dfe2e8 16px, #dfe2e8 32px)",
        color: "#5b6170",
        fontFamily: FONT_STACKS.sans,
        fontSize,
        fontWeight: 600,
        textAlign: "center",
      }}
    >
      <svg width={fontSize * 1.8} height={fontSize * 1.8} viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="9" cy="10" r="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="m4 18 5.5-5 3.5 3 2.5-2 4.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      Drop image here
    </div>
  );
}

/** Neutral page skeleton for gallery previews. */
function PlaceholderGray() {
  const bar = (width: string, height: string, color = "#d3d6dd") => (
    <div style={{ width, height, borderRadius: 6, background: color }} />
  );
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#eceef2",
        padding: "7%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "6%",
        overflow: "hidden",
      }}
    >
      {bar("45%", "9%", "#c4c8d1")}
      {bar("80%", "5%")}
      {bar("65%", "5%")}
      <div style={{ display: "flex", gap: "5%", flex: 1 }}>
        {bar("100%", "100%", "#dcdfe5")}
        {bar("100%", "100%", "#dcdfe5")}
      </div>
    </div>
  );
}

/** One template slot: perspective wrapper (with drop-shadow) → rotated plane → frame → image. */
export function SlotRenderer({ slot, canvas, image, placeholder, browserUrl }: SlotRendererProps) {
  if (!image && placeholder === "none") return null;
  const box = slotBox(slot, canvas);

  const screen = image ? (
    <img
      src={image.url}
      alt=""
      draggable={false}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: slot.fit,
        objectPosition: `50% ${slotScroll(slot)}%`,
      }}
    />
  ) : placeholder === "label" ? (
    <PlaceholderLabel size={Math.min(box.width, box.height)} />
  ) : (
    <PlaceholderGray />
  );

  return (
    <div
      style={{
        position: "absolute",
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
        zIndex: slot.transform.zIndex,
        perspective: box.perspective,
        filter: slotShadowFilter(slot.shadow, canvas),
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: box.transform,
          transformStyle: "preserve-3d",
        }}
      >
        <FrameWrapper
          frame={slot.frame}
          screen={screen}
          width={box.width}
          height={box.height}
          radius={slot.radius}
          browserUrl={browserUrl}
        />
      </div>
    </div>
  );
}
