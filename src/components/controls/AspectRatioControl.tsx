import { ASPECT_RATIOS, type AspectRatioPreset } from "@/lib/presets";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/useEditorStore";

function RatioIcon({ size }: { size: AspectRatioPreset["size"] }) {
  if (!size) {
    return <span aria-hidden className="block size-5 rounded-[3px] border-[1.5px] border-dashed border-current" />;
  }
  const max = 22;
  const w = size.width >= size.height ? max : (max * size.width) / size.height;
  const h = size.height >= size.width ? max : (max * size.height) / size.width;
  return <span aria-hidden className="block rounded-[3px] border-[1.5px] border-current" style={{ width: w, height: h }} />;
}

export function AspectRatioControl() {
  const aspectRatio = useEditorStore((s) => s.aspectRatio);
  const setAspectRatio = useEditorStore((s) => s.setAspectRatio);

  return (
    <div role="group" aria-label="Canvas size" className="grid grid-cols-3 gap-2">
      {ASPECT_RATIOS.map((ratio) => {
        const selected = ratio.id === aspectRatio;
        return (
          <button
            key={ratio.id}
            type="button"
            aria-pressed={selected}
            aria-label={ratio.size ? `${ratio.label}, ${ratio.size.width} by ${ratio.size.height}` : "Auto, fit image plus padding"}
            onClick={() => setAspectRatio(ratio.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-md border px-1 py-2 text-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected ? "border-primary bg-primary/10 text-foreground" : "border-input text-muted-foreground",
            )}
          >
            <span className="grid h-6 place-items-center">
              <RatioIcon size={ratio.size} />
            </span>
            <span className="font-medium text-foreground">{ratio.label}</span>
            <span className="text-[10px] tabular-nums leading-none">
              {ratio.size ? `${ratio.size.width}×${ratio.size.height}` : "Fit image"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
