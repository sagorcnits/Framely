import { useEffect, useRef } from "react";
import { ImagePlus } from "lucide-react";
import { CanvasPreview } from "@/components/canvas/CanvasPreview";
import { CanvasRenderer } from "@/components/canvas/CanvasRenderer";
import { MobileControls } from "@/components/layout/MobileControls";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { TemplateGallery } from "@/components/templates/TemplateGallery";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useCanvasLayout } from "@/hooks/useCanvasLayout";
import { useDropzone } from "@/hooks/useDropzone";
import { useExport } from "@/hooks/useExport";
import { useNudgeKeys } from "@/hooks/useNudgeKeys";
import { usePaste } from "@/hooks/usePaste";
import { useShortcuts } from "@/hooks/useShortcuts";
import { samePosition } from "@/lib/layout";
import { selectHasContent, useEditorStore } from "@/store/useEditorStore";

function DragOverlay({ templateMode }: { templateMode: boolean }) {
  if (templateMode) {
    // Keep the slots visible so the user can aim at one.
    return (
      <div className="pointer-events-none fixed inset-x-0 top-16 z-50 flex justify-center px-4">
        <p className="flex items-center gap-2 rounded-full border border-primary bg-background/90 px-4 py-2 text-sm font-medium shadow-lg backdrop-blur">
          <ImagePlus className="size-4 text-primary" aria-hidden />
          Drop onto a slot — or anywhere to fill the next empty slot
        </p>
      </div>
    );
  }
  return (
    <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center bg-background/70 p-6 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-primary px-10 py-12 text-center">
        <ImagePlus className="size-8 text-primary" aria-hidden />
        <p className="text-lg font-medium">Drop your screenshot</p>
        <p className="text-xs text-muted-foreground">PNG, JPG or WebP</p>
      </div>
    </div>
  );
}

export default function App() {
  const layout = useCanvasLayout();
  const hasContent = useEditorStore(selectHasContent);
  const mode = useEditorStore((s) => s.mode);
  const exportRef = useRef<HTMLDivElement>(null);
  const { busy, run } = useExport(exportRef, { width: layout.width, height: layout.height });

  // The layout always renders a clamped position; write it back so the store,
  // inputs and persisted value agree after canvas size or style changes.
  const offset = layout.offset;
  useEffect(() => {
    const { mode: currentMode, image, position, setPosition } = useEditorStore.getState();
    if (currentMode === "simple" && image && !samePosition(position, offset)) setPosition(offset);
  }, [offset]);

  useNudgeKeys(layout);
  const isDragging = useDropzone();
  usePaste();
  useShortcuts({
    onDownload: () => void run("download"),
    onCopy: () => void run("copy"),
  });

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-dvh flex-col overflow-hidden">
        <TopBar
          busy={busy}
          canvasSize={{ width: layout.width, height: layout.height }}
          onDownload={() => void run("download")}
          onCopy={() => void run("copy")}
        />
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <main className="relative min-h-0 min-w-0 flex-1">
            <CanvasPreview layout={layout} />
          </main>
          <Sidebar />
          <MobileControls />
        </div>
      </div>

      {/* Full-size, unscaled copy of the canvas used only for export. */}
      {hasContent ? (
        <div aria-hidden className="pointer-events-none fixed top-0" style={{ left: -100_000 }}>
          <CanvasRenderer ref={exportRef} layout={layout} />
        </div>
      ) : null}

      <TemplateGallery />
      {isDragging ? <DragOverlay templateMode={mode === "template"} /> : null}
      <Toaster />
    </TooltipProvider>
  );
}
