import type { ReactNode } from "react";
import { AspectRatioControl } from "@/components/controls/AspectRatioControl";
import { BackgroundControl } from "@/components/controls/BackgroundControl";
import { FrameControl } from "@/components/controls/FrameControl";
import { ImageControl } from "@/components/controls/ImageControl";
import { PositionControl } from "@/components/controls/PositionControl";
import { QuickActions } from "@/components/controls/QuickActions";
import { StyleControl } from "@/components/controls/StyleControl";
import { SelectionControl, TemplateControl } from "@/components/controls/TemplateControl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEditorStore } from "@/store/useEditorStore";

type Panel = { value: string; label: string; content: ReactNode };

const SIMPLE_PANELS: readonly Panel[] = [
  { value: "image", label: "Image", content: <ImageControl /> },
  { value: "size", label: "Size", content: <AspectRatioControl /> },
  { value: "position", label: "Move", content: <PositionControl /> },
  { value: "background", label: "Fill", content: <BackgroundControl /> },
  { value: "style", label: "Style", content: <StyleControl /> },
  { value: "frame", label: "Frame", content: <FrameControl /> },
];

const TEMPLATE_PANELS: readonly Panel[] = [
  { value: "template", label: "Template", content: <TemplateControl /> },
  { value: "edit", label: "Edit", content: <SelectionControl /> },
  { value: "background", label: "Fill", content: <BackgroundControl /> },
];

/** Mobile controls (<768px): a tabbed panel below the canvas. */
export function MobileControls() {
  const mode = useEditorStore((s) => s.mode);
  const hasSelection = useEditorStore((s) => s.selectedId !== null);
  const panels = mode === "template" ? TEMPLATE_PANELS : SIMPLE_PANELS;

  return (
    <section
      aria-label="Editor controls"
      className="flex h-[48dvh] min-h-0 shrink-0 flex-col border-t bg-card md:hidden"
    >
      <Tabs
        // Remount per mode; in template mode, jump to "Edit" when something gets selected.
        key={`${mode}-${mode === "template" && hasSelection ? "edit" : "base"}`}
        defaultValue={mode === "template" ? (hasSelection ? "edit" : "template") : "background"}
        className="flex min-h-0 flex-1 flex-col"
      >
        <TabsList
          className="mx-3 mt-3 grid shrink-0"
          style={{ gridTemplateColumns: `repeat(${panels.length}, minmax(0, 1fr))` }}
        >
          {panels.map((panel) => (
            <TabsTrigger key={panel.value} value={panel.value} className="px-1">
              {panel.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
          {panels.map((panel) => (
            <TabsContent key={panel.value} value={panel.value} className="mt-4">
              {panel.content}
            </TabsContent>
          ))}
        </div>
      </Tabs>
      {mode === "simple" ? (
        <div className="shrink-0 border-t p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <QuickActions />
        </div>
      ) : null}
    </section>
  );
}
