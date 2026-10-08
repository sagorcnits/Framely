import { HexColorInput, HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type ColorPickerProps = {
  label: string;
  value: string;
  onChange: (color: string) => void;
  className?: string;
};

/** Swatch button that opens a color picker with a hex input. */
export function ColorPicker({ label, value, onChange, className }: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${label}: ${value}`}
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-md border border-input px-2 text-left text-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
        >
          <span className="size-5 shrink-0 rounded ring-1 ring-inset ring-white/15" style={{ background: value }} />
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] uppercase leading-tight text-muted-foreground">{label}</span>
            <span className="block truncate font-mono uppercase leading-tight">{value}</span>
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="color-picker w-60 space-y-3" align="start">
        <HexColorPicker color={value} onChange={onChange} />
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Hex
          <HexColorInput
            color={value}
            onChange={onChange}
            prefixed
            aria-label={`${label} hex value`}
            className="h-8 w-full rounded-md border border-input bg-transparent px-2 font-mono text-xs uppercase text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      </PopoverContent>
    </Popover>
  );
}
