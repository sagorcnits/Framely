import { ImageUp, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFilePicker } from "@/hooks/useFilePicker";
import { MOD_KEY } from "@/lib/utils";
import { useEditorStore } from "@/store/useEditorStore";

export function ImageControl() {
  const image = useEditorStore((s) => s.image);
  const removeImage = useEditorStore((s) => s.removeImage);
  const picker = useFilePicker();

  return (
    <div className="space-y-3">
      <input {...picker.inputProps} />
      {image ? (
        <>
          <div className="flex items-center gap-3">
            <img
              src={image.url}
              alt="Current screenshot"
              className="h-12 w-16 shrink-0 rounded-md bg-secondary object-cover ring-1 ring-white/10"
            />
            <div className="min-w-0 text-xs">
              <p className="font-medium">Screenshot</p>
              <p className="tabular-nums text-muted-foreground">
                {image.width} × {image.height}px
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" onClick={picker.open}>
              <ImageUp aria-hidden />
              Replace image
            </Button>
            <Button variant="ghost" size="sm" onClick={removeImage}>
              <Trash2 aria-hidden />
              Remove
            </Button>
          </div>
        </>
      ) : (
        <>
          <Button variant="secondary" className="w-full" onClick={picker.open}>
            <Upload aria-hidden />
            Upload screenshot
          </Button>
          <p className="text-xs text-muted-foreground">
            PNG, JPG or WebP. You can also drop a file anywhere or paste with {MOD_KEY}+V.
          </p>
        </>
      )}
    </div>
  );
}
