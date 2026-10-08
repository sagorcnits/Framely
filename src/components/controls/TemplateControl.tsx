import { useId } from "react";
import { ArrowLeft, ImageIcon, LayoutTemplate, Plus, RotateCcw, Type } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/useEditorStore";
import { getTemplate } from "@/templates";
import { SlotControl } from "./SlotControl";
import { TextControl } from "./TextControl";

/** Template-wide actions plus a layer list for picking slots and text layers. */
export function TemplateControl() {
  const s = useEditorStore(
    useShallow((state) => ({
      activeTemplateId: state.activeTemplateId,
      slots: state.slots,
      slotImages: state.slotImages,
      texts: state.texts,
      selectedId: state.selectedId,
      useOneImage: state.useOneImage,
      select: state.select,
      addText: state.addText,
      resetTemplate: state.resetTemplate,
      exitTemplateMode: state.exitTemplateMode,
      setUseOneImage: state.setUseOneImage,
      setGalleryOpen: state.setGalleryOpen,
    })),
  );
  const switchId = useId();
  const template = getTemplate(s.activeTemplateId);
  const filled = s.slots.filter((slot) => s.slotImages[slot.id]).length;
  const layers = [...s.slots].sort((a, b) => b.transform.zIndex - a.transform.zIndex);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{template?.name ?? "Custom layout"}</p>
          <p className="text-xs text-muted-foreground">
            {filled} of {s.slots.length} {s.slots.length === 1 ? "slot" : "slots"} filled
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => s.setGalleryOpen(true)}>
          <LayoutTemplate aria-hidden />
          Change
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor={switchId}>Use one image for all slots</Label>
        <Switch id={switchId} checked={s.useOneImage} onCheckedChange={s.setUseOneImage} />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-foreground/90">Layers</p>
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={s.addText}>
            <Plus aria-hidden />
            Add text
          </Button>
        </div>
        <ul className="space-y-1" aria-label="Layers">
          {s.texts.map((layer) => (
            <li key={layer.id}>
              <button
                type="button"
                aria-pressed={s.selectedId === layer.id}
                onClick={() => s.select(layer.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  s.selectedId === layer.id && "bg-accent",
                )}
              >
                <Type className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <span className="truncate">{layer.text.replace(/\n/g, " ") || "Empty text"}</span>
              </button>
            </li>
          ))}
          {layers.map((slot) => {
            const img = s.slotImages[slot.id];
            const index = s.slots.indexOf(slot) + 1;
            return (
              <li key={slot.id}>
                <button
                  type="button"
                  aria-pressed={s.selectedId === slot.id}
                  onClick={() => s.select(slot.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    s.selectedId === slot.id && "bg-accent",
                  )}
                >
                  {img ? (
                    <img src={img.url} alt="" className="size-5 shrink-0 rounded object-cover ring-1 ring-white/10" />
                  ) : (
                    <ImageIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  )}
                  <span className="truncate">Image slot {index}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground">{img ? "" : "Empty"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" size="sm" onClick={s.resetTemplate} disabled={!template}>
          <RotateCcw aria-hidden />
          Reset template
        </Button>
        <Button variant="ghost" size="sm" onClick={s.exitTemplateMode}>
          <ArrowLeft aria-hidden />
          Simple mode
        </Button>
      </div>
    </div>
  );
}

/** Settings for whatever is selected on the template canvas. */
export function SelectionControl() {
  const selectedId = useEditorStore((s) => s.selectedId);
  const slot = useEditorStore((s) => s.slots.find((x) => x.id === selectedId));
  const text = useEditorStore((s) => s.texts.find((x) => x.id === selectedId));

  if (slot) return <SlotControl key={slot.id} slot={slot} />;
  if (text) return <TextControl key={text.id} layer={text} />;
  return (
    <p className="text-xs text-muted-foreground">
      Click an image slot or text on the canvas to edit it. Empty slots open a file picker; you can also drop or paste
      images.
    </p>
  );
}

export function selectionTitle(kind: "slot" | "text" | null): string {
  if (kind === "slot") return "Selected slot";
  if (kind === "text") return "Selected text";
  return "Selection";
}
