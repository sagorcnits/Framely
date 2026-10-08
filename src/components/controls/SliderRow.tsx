import { useId } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type SliderRowProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Suffix shown after the value, e.g. "px", "%", "°". */
  unit?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
};

/** Labelled slider with its current value. Updates live while dragging. */
export function SliderRow({ label, value, min, max, step = 1, unit = "", disabled, onChange }: SliderRowProps) {
  const labelId = useId();
  const display = `${value}${unit}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label id={labelId}>{label}</Label>
        <span aria-hidden className="text-xs tabular-nums text-muted-foreground">
          {display}
        </span>
      </div>
      <Slider
        aria-labelledby={labelId}
        thumbLabel={label}
        thumbValueText={display}
        value={[value]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={([next]) => {
          if (next !== undefined) onChange(next);
        }}
      />
    </div>
  );
}
