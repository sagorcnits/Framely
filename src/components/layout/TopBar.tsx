import { Copy, Download, LayoutTemplate, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ExportKind } from "@/hooks/useExport";
import { EXPORT_SCALES } from "@/lib/presets";
import { MOD_KEY } from "@/lib/utils";
import { selectHasContent, useEditorStore } from "@/store/useEditorStore";
import { Logo } from "./Logo";

type TopBarProps = {
  busy: ExportKind | null;
  canvasSize: { width: number; height: number };
  onDownload: () => void;
  onCopy: () => void;
};

export function TopBar({ busy, canvasSize, onDownload, onCopy }: TopBarProps) {
  const hasContent = useEditorStore(selectHasContent);
  const exportScale = useEditorStore((s) => s.exportScale);
  const setExportScale = useEditorStore((s) => s.setExportScale);
  const setGalleryOpen = useEditorStore((s) => s.setGalleryOpen);
  const mode = useEditorStore((s) => s.mode);
  const disabled = !hasContent || busy !== null;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background px-3 md:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Logo />
        <span className="text-[15px] font-semibold tracking-tight">Framely</span>
        <span className="hidden text-xs text-muted-foreground lg:inline">Screenshot mockups in your browser</span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button
          variant={mode === "template" ? "secondary" : "outline"}
          onClick={() => setGalleryOpen(true)}
          aria-label="Open templates"
          aria-haspopup="dialog"
          className="px-2.5 sm:px-3"
        >
          <LayoutTemplate aria-hidden />
          <span className="hidden sm:inline">Templates</span>
        </Button>
        <Select
          value={String(exportScale)}
          onValueChange={(value) => {
            const next = EXPORT_SCALES.find((s) => String(s) === value);
            if (next) setExportScale(next);
          }}
        >
          <SelectTrigger aria-label="Export scale" className="h-9 w-[68px] px-2.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {EXPORT_SCALES.map((scale) => (
              <SelectItem
                key={scale}
                value={String(scale)}
                description={`${canvasSize.width * scale}×${canvasSize.height * scale}`}
              >
                {scale}x
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" onClick={onCopy} disabled={disabled} aria-label="Copy PNG to clipboard" className="px-2.5 sm:px-4">
              {busy === "copy" ? <Loader2 className="animate-spin" aria-hidden /> : <Copy aria-hidden />}
              <span className="hidden sm:inline">{busy === "copy" ? "Copying…" : "Copy"}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy PNG · {MOD_KEY}+Shift+C</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onDownload} disabled={disabled} aria-label="Download PNG" className="px-2.5 sm:px-4">
              {busy === "download" ? <Loader2 className="animate-spin" aria-hidden /> : <Download aria-hidden />}
              <span className="hidden sm:inline">{busy === "download" ? "Exporting…" : "Download"}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Download PNG · {MOD_KEY}+S</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
