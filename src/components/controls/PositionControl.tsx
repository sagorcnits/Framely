import { useId, useState } from "react";
import { Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCanvasLayout } from "@/hooks/useCanvasLayout";
import { alignedPosition, clampPosition, samePosition, type Alignment } from "@/lib/layout";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/useEditorStore";

const ROWS: readonly { id: Alignment; label: string }[] = [
  { id: "start", label: "top" },
  { id: "center", label: "middle" },
  { id: "end", label: "bottom" },
];
const COLUMNS: readonly { id: Alignment; label: string }[] = [
  { id: "start", label: "left" },
  { id: "center", label: "center" },
  { id: "end", label: "right" },
];

function AxisInput({ axis, value, disabled, onCommit }: {
  axis: "X" | "Y";
  value: number;
  disabled: boolean;
  onCommit: (value: number) => void;
}) {
  const id = useId();
  // Local draft while focused so intermediate text like "-" isn't overwritten.
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor={id} className="w-3 text-muted-foreground">
        {axis}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        step={1}
        disabled={disabled}
        value={draft ?? String(Math.round(value))}
        aria-describedby={`${id}-hint`}
        onFocus={(event) => setDraft(event.target.value)}
        onBlur={() => setDraft(null)}
        onChange={(event) => {
          setDraft(event.target.value);
          const next = event.target.valueAsNumber;
          if (Number.isFinite(next)) onCommit(next);
        }}
        onKeyDown={(event) => {
          // Arrow keys step the number; show the clamped result immediately.
          if (event.key === "ArrowUp" || event.key === "ArrowDown") setDraft(null);
          if (event.key === "Enter") {
            setDraft(null);
            event.currentTarget.blur();
          }
        }}
        className="h-8 tabular-nums"
      />
      <span id={`${id}-hint`} className="sr-only">
        Canvas pixels from the center
      </span>
    </div>
  );
}

export function PositionControl() {
  const layout = useCanvasLayout();
  const hasImage = useEditorStore((s) => s.image !== null);
  const setPosition = useEditorStore((s) => s.setPosition);
  const resetPosition = useEditorStore((s) => s.resetPosition);
  const offset = layout.offset;
  const disabled = !hasImage;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <AxisInput
          axis="X"
          value={offset.x}
          disabled={disabled}
          onCommit={(x) => setPosition(clampPosition({ x, y: offset.y }, layout))}
        />
        <AxisInput
          axis="Y"
          value={offset.y}
          disabled={disabled}
          onCommit={(y) => setPosition(clampPosition({ x: offset.x, y }, layout))}
        />
      </div>

      <div className="flex items-center gap-3">
        <div role="group" aria-label="Align screenshot" className="grid w-[104px] shrink-0 grid-cols-3 gap-1 rounded-lg bg-secondary p-1.5">
          {ROWS.map((row) =>
            COLUMNS.map((col) => {
              const target = alignedPosition(col.id, row.id, layout);
              const active = hasImage && samePosition(target, offset);
              const name = row.id === "center" && col.id === "center" ? "center" : `${row.label} ${col.label}`;
              return (
                <button
                  key={`${row.id}-${col.id}`}
                  type="button"
                  disabled={disabled}
                  aria-label={`Align ${name}`}
                  aria-pressed={active}
                  title={`Align ${name}`}
                  onClick={() => setPosition(target)}
                  className={cn(
                    "grid aspect-square place-items-center rounded-md transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40",
                    active && "bg-background",
                  )}
                >
                  <span className={cn("block size-1.5 rounded-full", active ? "bg-primary" : "bg-muted-foreground/70")} />
                </button>
              );
            }),
          )}
        </div>
        <div className="space-y-2">
          <Button variant="secondary" size="sm" disabled={disabled} onClick={resetPosition}>
            <Crosshair aria-hidden />
            Center
          </Button>
          <p className="text-[11px] leading-snug text-muted-foreground">
            Drag the screenshot on the canvas. Shift turns off snapping. Alt locks to one axis.
          </p>
        </div>
      </div>
    </div>
  );
}
