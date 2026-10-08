import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type ColorSwatchProps = {
  /** Accessible name, e.g. the preset's name. */
  label: string;
  /** Any CSS background value (a color or a gradient). */
  background: string;
  selected: boolean;
  onClick: () => void;
};

/** Selectable preset swatch. */
export function ColorSwatch({ label, background, selected, onClick }: ColorSwatchProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      style={{ background }}
      className={cn(
        "relative grid aspect-square w-full place-items-center rounded-md ring-1 ring-inset ring-white/10 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
    >
      {selected ? (
        <span className="grid size-4 place-items-center rounded-full bg-black/45 text-white">
          <Check className="size-3" strokeWidth={3} aria-hidden />
        </span>
      ) : null}
    </button>
  );
}
