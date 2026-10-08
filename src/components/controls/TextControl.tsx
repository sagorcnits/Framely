import { useId } from "react";
import { AlignCenter, AlignLeft, AlignRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEditorStore } from "@/store/useEditorStore";
import type { TextLayer } from "@/types";
import { ColorPicker } from "./ColorPicker";
import { Segmented } from "./Segmented";
import { SliderRow } from "./SliderRow";

const WEIGHTS = [
  { value: 300, label: "Light" },
  { value: 400, label: "Regular" },
  { value: 500, label: "Medium" },
  { value: 600, label: "Semibold" },
  { value: 700, label: "Bold" },
  { value: 800, label: "Extra bold" },
  { value: 900, label: "Black" },
] as const;

/** Settings for the selected text layer. */
export function TextControl({ layer }: { layer: TextLayer }) {
  const updateText = useEditorStore((s) => s.updateText);
  const deleteText = useEditorStore((s) => s.deleteText);
  const textId = useId();
  const weightId = useId();
  const patch = (value: Partial<TextLayer>) => updateText(layer.id, value);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor={textId}>Text</Label>
        <textarea
          id={textId}
          value={layer.text}
          rows={3}
          maxLength={500}
          onChange={(event) => patch({ text: event.target.value })}
          className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p className="text-[11px] text-muted-foreground">Tip: double-click the text on the canvas to edit it in place.</p>
      </div>

      <Segmented
        label="Font"
        value={layer.fontFamily}
        options={[
          { value: "sans", label: "Sans" },
          { value: "serif", label: "Serif" },
          { value: "mono", label: "Mono" },
        ]}
        onChange={(fontFamily) => patch({ fontFamily })}
      />

      <SliderRow label="Size" value={layer.fontSize} min={12} max={240} unit="px" onChange={(fontSize) => patch({ fontSize })} />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label id={weightId}>Weight</Label>
          <Select value={String(layer.fontWeight)} onValueChange={(v) => patch({ fontWeight: Number(v) })}>
            <SelectTrigger aria-labelledby={weightId} className="h-9 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WEIGHTS.map((w) => (
                <SelectItem key={w.value} value={String(w.value)}>
                  {w.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Color</Label>
          <ColorPicker label="Text color" value={layer.color} onChange={(color) => patch({ color })} />
        </div>
      </div>

      <Segmented
        label="Alignment"
        value={layer.align}
        options={[
          { value: "left", label: "Align left", icon: <AlignLeft aria-hidden /> },
          { value: "center", label: "Align center", icon: <AlignCenter aria-hidden /> },
          { value: "right", label: "Align right", icon: <AlignRight aria-hidden /> },
        ]}
        onChange={(align) => patch({ align })}
      />

      <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive" onClick={() => deleteText(layer.id)}>
        <Trash2 aria-hidden />
        Delete text
      </Button>
    </div>
  );
}
