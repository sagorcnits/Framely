import { useId } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LIMITS, SHADOW_OPTIONS } from "@/lib/presets";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/useEditorStore";
import { ColorPicker } from "./ColorPicker";
import { SliderRow } from "./SliderRow";

function ShadowPicker() {
  const shadow = useEditorStore((s) => s.shadow);
  const setShadow = useEditorStore((s) => s.setShadow);
  const labelId = useId();

  return (
    <div className="space-y-2">
      <Label id={labelId}>Shadow</Label>
      <div role="group" aria-labelledby={labelId} className="grid grid-cols-5 gap-1 rounded-lg bg-secondary p-1">
        {SHADOW_OPTIONS.map((option) => {
          const selected = option.id === shadow;
          return (
            <button
              key={option.id}
              type="button"
              title={option.label}
              aria-label={`${option.label} shadow`}
              aria-pressed={selected}
              onClick={() => setShadow(option.id)}
              className={cn(
                "h-7 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BorderControl() {
  const border = useEditorStore((s) => s.border);
  const setBorder = useEditorStore((s) => s.setBorder);
  const switchId = useId();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={switchId}>Border</Label>
        <Switch id={switchId} checked={border.enabled} onCheckedChange={(enabled) => setBorder({ enabled })} />
      </div>
      {border.enabled ? (
        <div className="space-y-3">
          <ColorPicker label="Border color" value={border.color} onChange={(color) => setBorder({ color })} />
          <SliderRow
            label="Border width"
            value={border.width}
            min={LIMITS.borderWidth.min}
            max={LIMITS.borderWidth.max}
            unit="px"
            onChange={(width) => setBorder({ width })}
          />
        </div>
      ) : null}
    </div>
  );
}

export function StyleControl() {
  const padding = useEditorStore((s) => s.padding);
  const scale = useEditorStore((s) => s.scale);
  const radius = useEditorStore((s) => s.radius);
  const rotation = useEditorStore((s) => s.rotation);
  const shadow = useEditorStore((s) => s.shadow);
  const shadowOpacity = useEditorStore((s) => s.shadowOpacity);
  const setPadding = useEditorStore((s) => s.setPadding);
  const setScale = useEditorStore((s) => s.setScale);
  const setRadius = useEditorStore((s) => s.setRadius);
  const setRotation = useEditorStore((s) => s.setRotation);
  const setShadowOpacity = useEditorStore((s) => s.setShadowOpacity);

  return (
    <div className="space-y-5">
      <SliderRow label="Padding" value={padding} {...LIMITS.padding} unit="px" onChange={setPadding} />
      <SliderRow label="Scale" value={scale} {...LIMITS.scale} unit="%" onChange={setScale} />
      <SliderRow label="Corner radius" value={radius} {...LIMITS.radius} unit="px" onChange={setRadius} />
      <ShadowPicker />
      <SliderRow
        label="Shadow opacity"
        value={shadowOpacity}
        {...LIMITS.shadowOpacity}
        unit="%"
        disabled={shadow === "none"}
        onChange={setShadowOpacity}
      />
      <SliderRow label="Rotation" value={rotation} {...LIMITS.rotation} step={0.5} unit="°" onChange={setRotation} />
      <BorderControl />
    </div>
  );
}
