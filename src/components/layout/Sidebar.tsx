import { AspectRatioControl } from "@/components/controls/AspectRatioControl";
import { BackgroundControl } from "@/components/controls/BackgroundControl";
import { ControlSection } from "@/components/controls/ControlSection";
import { FrameControl } from "@/components/controls/FrameControl";
import { ImageControl } from "@/components/controls/ImageControl";
import { PositionControl } from "@/components/controls/PositionControl";
import { QuickActions } from "@/components/controls/QuickActions";
import { StyleControl } from "@/components/controls/StyleControl";
import { SelectionControl, TemplateControl, selectionTitle } from "@/components/controls/TemplateControl";
import { useEditorStore } from "@/store/useEditorStore";

function useSelectionKind(): "slot" | "text" | null {
  return useEditorStore((s) => {
    if (!s.selectedId) return null;
    if (s.slots.some((x) => x.id === s.selectedId)) return "slot";
    if (s.texts.some((x) => x.id === s.selectedId)) return "text";
    return null;
  });
}

/** Desktop controls (≥768px). */
export function Sidebar() {
  const mode = useEditorStore((s) => s.mode);
  const selectionKind = useSelectionKind();

  return (
    <aside aria-label="Editor controls" className="hidden w-80 shrink-0 flex-col border-l bg-card md:flex">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {mode === "template" ? (
          <>
            <ControlSection title="Template">
              <TemplateControl />
            </ControlSection>
            <ControlSection title={selectionTitle(selectionKind)}>
              <SelectionControl />
            </ControlSection>
            <ControlSection title="Background">
              <BackgroundControl />
            </ControlSection>
          </>
        ) : (
          <>
            <ControlSection title="Image">
              <ImageControl />
            </ControlSection>
            <ControlSection title="Canvas size">
              <AspectRatioControl />
            </ControlSection>
            <ControlSection title="Position">
              <PositionControl />
            </ControlSection>
            <ControlSection title="Background">
              <BackgroundControl />
            </ControlSection>
            <ControlSection title="Style">
              <StyleControl />
            </ControlSection>
            <ControlSection title="Frame">
              <FrameControl />
            </ControlSection>
          </>
        )}
      </div>
      {mode === "simple" ? (
        <div className="border-t p-3">
          <QuickActions />
        </div>
      ) : null}
    </aside>
  );
}
