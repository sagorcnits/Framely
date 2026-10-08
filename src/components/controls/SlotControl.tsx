import { ArrowDown, ArrowUp, Copy, ImagePlus, ImageUp, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFilePicker } from "@/hooks/useFilePicker";
import { FRAME_OPTIONS, SLOT_SHADOW_OPTIONS } from "@/lib/presets";
import { slotScroll } from "@/lib/templateLayout";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/useEditorStore";
import type { Slot } from "@/types";
import { FrameThumb } from "./FrameControl";
import { Segmented } from "./Segmented";
import { SliderRow } from "./SliderRow";

/** Settings for the selected template slot. */
export function SlotControl({ slot }: { slot: Slot }) {
  const image = useEditorStore((s) => s.slotImages[slot.id] ?? null);
  const updateSlot = useEditorStore((s) => s.updateSlot);
  const removeSlotImage = useEditorStore((s) => s.removeSlotImage);
  const duplicateSlot = useEditorStore((s) => s.duplicateSlot);
  const deleteSlot = useEditorStore((s) => s.deleteSlot);
  const moveSlotLayer = useEditorStore((s) => s.moveSlotLayer);
  const picker = useFilePicker(slot.id);
  const t = slot.transform;
  const setTransform = (patch: Partial<Slot["transform"]>) => updateSlot(slot.id, { transform: patch });

  return (
    <div className="space-y-5">
      <input {...picker.inputProps} />

      <div className="flex items-center gap-3">
        {image ? (
          <img src={image.url} alt="Slot image" className="h-12 w-16 shrink-0 rounded-md bg-secondary object-cover ring-1 ring-white/10" />
        ) : (
          <span className="grid h-12 w-16 shrink-0 place-items-center rounded-md border border-dashed text-muted-foreground">
            <ImagePlus className="size-4" aria-hidden />
          </span>
        )}
        <div className="grid flex-1 grid-cols-2 gap-2">
          <Button variant="secondary" size="sm" onClick={picker.open}>
            <ImageUp aria-hidden />
            {image ? "Replace" : "Add image"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => removeSlotImage(slot.id)} disabled={!image}>
            <X aria-hidden />
            Remove
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-foreground/90" id={`frame-${slot.id}`}>
          Frame
        </p>
        <div role="group" aria-labelledby={`frame-${slot.id}`} className="grid grid-cols-4 gap-1.5">
          {FRAME_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={slot.frame === option.id}
              title={option.label}
              aria-label={`${option.label} frame`}
              onClick={() => updateSlot(slot.id, { frame: option.id })}
              className={cn(
                "grid h-11 place-items-center rounded-md border transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                slot.frame === option.id ? "border-primary bg-primary/10" : "border-input",
              )}
            >
              <FrameThumb frame={option.id} />
            </button>
          ))}
        </div>
      </div>

      <SliderRow label="Corner radius" value={slot.radius} min={0} max={60} unit="px" onChange={(radius) => updateSlot(slot.id, { radius })} />

      <Segmented
        label="Shadow"
        value={slot.shadow}
        options={SLOT_SHADOW_OPTIONS.map((o) => ({ value: o.id, label: o.short }))}
        onChange={(shadow) => updateSlot(slot.id, { shadow })}
      />

      <div className="grid grid-cols-2 gap-3">
        <Segmented
          label="Fit"
          value={slot.fit}
          options={[
            { value: "cover", label: "Cover" },
            { value: "contain", label: "Contain" },
          ]}
          onChange={(fit) => updateSlot(slot.id, { fit })}
        />
        <Segmented
          label="Image position"
          value={slot.objectPosition}
          options={[
            { value: "top", label: "Top" },
            { value: "center", label: "Center" },
          ]}
          onChange={(objectPosition) => updateSlot(slot.id, { objectPosition, scroll: null })}
        />
      </div>

      <SliderRow
        label="Scroll position"
        value={Math.round(slotScroll(slot))}
        min={0}
        max={100}
        unit="%"
        disabled={slot.fit === "contain"}
        onChange={(scroll) => updateSlot(slot.id, { scroll })}
      />

      <SliderRow label="Size" value={Math.round(t.width * 100)} min={5} max={150} unit="%" onChange={(v) => setTransform({ width: v / 100 })} />
      <SliderRow label="Rotate X" value={t.rotateX} min={-80} max={80} unit="°" onChange={(rotateX) => setTransform({ rotateX })} />
      <SliderRow label="Rotate Y" value={t.rotateY} min={-80} max={80} unit="°" onChange={(rotateY) => setTransform({ rotateY })} />
      <SliderRow label="Rotate Z" value={t.rotateZ} min={-180} max={180} unit="°" onChange={(rotateZ) => setTransform({ rotateZ })} />
      <SliderRow
        label="Perspective"
        value={t.perspective}
        min={0}
        max={4000}
        step={50}
        unit={t.perspective === 0 ? " (flat)" : "px"}
        onChange={(perspective) => setTransform({ perspective })}
      />

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" size="sm" onClick={() => moveSlotLayer(slot.id, 1)}>
          <ArrowUp aria-hidden />
          Bring forward
        </Button>
        <Button variant="secondary" size="sm" onClick={() => moveSlotLayer(slot.id, -1)}>
          <ArrowDown aria-hidden />
          Send backward
        </Button>
        <Button variant="secondary" size="sm" onClick={() => duplicateSlot(slot.id)}>
          <Copy aria-hidden />
          Duplicate slot
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => deleteSlot(slot.id)}>
          <Trash2 aria-hidden />
          Delete slot
        </Button>
      </div>
    </div>
  );
}
