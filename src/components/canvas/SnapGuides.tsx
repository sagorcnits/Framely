import type { CanvasLayout, SnapGuides as Guides } from "@/lib/layout";

type SnapGuidesProps = {
  guides: Guides;
  layout: Pick<CanvasLayout, "width" | "height">;
  /** Preview scale, used to keep lines ~1 screen pixel thick. */
  previewScale: number;
};

/** Accent guide lines drawn in canvas coordinates. Preview only — never part of the export. */
export function SnapGuides({ guides, layout, previewScale }: SnapGuidesProps) {
  if (guides.x === null && guides.y === null) return null;
  const thickness = 1 / Math.max(previewScale, 0.01);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0" data-snap-guides>
      {guides.x !== null ? (
        <div
          className="absolute top-0 bg-primary"
          style={{ left: guides.x - thickness / 2, width: thickness, height: layout.height }}
        />
      ) : null}
      {guides.y !== null ? (
        <div
          className="absolute left-0 bg-primary"
          style={{ top: guides.y - thickness / 2, height: thickness, width: layout.width }}
        />
      ) : null}
    </div>
  );
}
