import { ImagePlus } from "lucide-react";
import { useFilePicker } from "@/hooks/useFilePicker";
import { MOD_KEY, cn } from "@/lib/utils";

type DropzoneProps = { className?: string };

/** Empty-state upload target shown on the canvas until an image is added. */
export function Dropzone({ className }: DropzoneProps) {
  const picker = useFilePicker();

  return (
    <div className={cn("flex p-3 sm:p-6", className)}>
      <input {...picker.inputProps} />
      <button
        type="button"
        onClick={picker.open}
        className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/45 bg-black/30 px-4 text-center text-white backdrop-blur-sm transition-colors hover:border-white/80 hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:gap-3"
      >
        <span className="grid size-10 place-items-center rounded-full bg-white/15 sm:size-12">
          <ImagePlus className="size-5 sm:size-6" aria-hidden />
        </span>
        <span className="text-sm font-medium sm:text-base">Drop, paste, or click to upload a screenshot</span>
        <span className="text-xs text-white/70">PNG, JPG or WebP · {MOD_KEY}+V to paste</span>
      </button>
    </div>
  );
}
