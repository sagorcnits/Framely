import { useId, type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  /** Rendered instead of the label (the label stays as the accessible name). */
  icon?: ReactNode;
};

type SegmentedProps<T extends string> = {
  label: string;
  value: T;
  options: readonly SegmentedOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
};

/** Labelled row of mutually exclusive toggle buttons. */
export function Segmented<T extends string>({ label, value, options, onChange, disabled }: SegmentedProps<T>) {
  const labelId = useId();
  return (
    <div className="space-y-2">
      <Label id={labelId}>{label}</Label>
      <div
        role="group"
        aria-labelledby={labelId}
        className="grid gap-1 rounded-lg bg-secondary p-1"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              aria-label={option.icon ? option.label : undefined}
              title={option.label}
              onClick={() => onChange(option.value)}
              className={cn(
                "grid h-7 place-items-center truncate rounded-md px-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 [&_svg]:size-4",
                selected ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.icon ?? option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
