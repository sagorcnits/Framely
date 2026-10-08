import { useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DEFAULT_SETTINGS,
  GRADIENT_PRESETS,
  LIMITS,
  SOLID_PRESETS,
  gradientFromPreset,
  linearGradientCss,
} from "@/lib/presets";
import { useEditorStore } from "@/store/useEditorStore";
import type { GradientBackground, SolidBackground } from "@/types";
import { ColorPicker } from "./ColorPicker";
import { ColorSwatch } from "./ColorSwatch";
import { SliderRow } from "./SliderRow";

const DEFAULT_GRADIENT: GradientBackground =
  DEFAULT_SETTINGS.background.type === "gradient"
    ? DEFAULT_SETTINGS.background
    : { type: "gradient", from: "#00c6ff", to: "#0072ff", angle: 135 };

const DEFAULT_SOLID: SolidBackground = { type: "solid", color: SOLID_PRESETS[0]?.color ?? "#ffffff" };

function sameColor(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

export function BackgroundControl() {
  const background = useEditorStore((s) => s.background);
  const setBackground = useEditorStore((s) => s.setBackground);

  // Remember the last gradient/solid so switching tabs back restores it.
  const lastGradient = useRef<GradientBackground>(background.type === "gradient" ? background : DEFAULT_GRADIENT);
  const lastSolid = useRef<SolidBackground>(background.type === "solid" ? background : DEFAULT_SOLID);
  useEffect(() => {
    if (background.type === "gradient") lastGradient.current = background;
    if (background.type === "solid") lastSolid.current = background;
  }, [background]);

  const onTabChange = (value: string) => {
    if (value === "gradient") setBackground(lastGradient.current);
    else if (value === "solid") setBackground(lastSolid.current);
    else if (value === "transparent") setBackground({ type: "transparent" });
  };

  return (
    <Tabs value={background.type} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-3" aria-label="Background type">
        <TabsTrigger value="gradient">Gradient</TabsTrigger>
        <TabsTrigger value="solid">Solid</TabsTrigger>
        <TabsTrigger value="transparent">Transparent</TabsTrigger>
      </TabsList>

      <TabsContent value="gradient" className="space-y-4">
        {background.type === "gradient" ? (
          <>
            <div role="group" aria-label="Gradient presets" className="grid grid-cols-6 gap-2">
              {GRADIENT_PRESETS.map((preset) => (
                <ColorSwatch
                  key={preset.id}
                  label={preset.name}
                  background={linearGradientCss(preset.from, preset.to, preset.angle)}
                  selected={
                    sameColor(preset.from, background.from) &&
                    sameColor(preset.to, background.to) &&
                    preset.angle === background.angle
                  }
                  onClick={() => setBackground(gradientFromPreset(preset))}
                />
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Custom gradient</p>
              <div className="grid grid-cols-2 gap-2">
                <ColorPicker
                  label="From"
                  value={background.from}
                  onChange={(from) => setBackground({ ...background, from })}
                />
                <ColorPicker label="To" value={background.to} onChange={(to) => setBackground({ ...background, to })} />
              </div>
              <SliderRow
                label="Angle"
                value={background.angle}
                min={LIMITS.angle.min}
                max={LIMITS.angle.max}
                unit="°"
                onChange={(angle) => setBackground({ ...background, angle })}
              />
            </div>
          </>
        ) : null}
      </TabsContent>

      <TabsContent value="solid" className="space-y-4">
        {background.type === "solid" ? (
          <>
            <div role="group" aria-label="Solid color presets" className="grid grid-cols-6 gap-2">
              {SOLID_PRESETS.map((preset) => (
                <ColorSwatch
                  key={preset.color}
                  label={preset.name}
                  background={preset.color}
                  selected={sameColor(preset.color, background.color)}
                  onClick={() => setBackground({ type: "solid", color: preset.color })}
                />
              ))}
            </div>
            <ColorPicker
              label="Custom color"
              value={background.color}
              onChange={(color) => setBackground({ type: "solid", color })}
            />
          </>
        ) : null}
      </TabsContent>

      <TabsContent value="transparent">
        <div className="flex items-start gap-3 rounded-md border border-dashed p-3">
          <span aria-hidden className="checkerboard size-8 shrink-0 rounded" />
          <p className="text-xs text-muted-foreground">
            Exports a PNG with a transparent background. The checkered pattern appears in the preview only.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
