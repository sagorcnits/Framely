import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FRAME_OPTIONS } from "@/lib/presets";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/useEditorStore";
import type { FrameType } from "@/types";

/** Tiny CSS sketch of each frame for the picker. */
export function FrameThumb({ frame }: { frame: FrameType }) {
  const dots = (
    <span className="flex gap-[2px]">
      <span className="size-[3px] rounded-full bg-[#ff6159]" />
      <span className="size-[3px] rounded-full bg-[#ffbd2e]" />
      <span className="size-[3px] rounded-full bg-[#29c946]" />
    </span>
  );

  switch (frame) {
    case "none":
      return <span className="block h-7 w-10 rounded-[3px] bg-gradient-to-br from-sky-400 to-indigo-500" />;
    case "browser-light":
    case "browser-dark": {
      const dark = frame === "browser-dark";
      return (
        <span className={cn("flex h-7 w-10 flex-col overflow-hidden rounded-[3px]", dark ? "bg-[#222227]" : "bg-[#f0f0f3]")}>
          <span className="flex h-2 items-center gap-1 px-[3px]">
            {dots}
            <span className={cn("h-[3px] flex-1 rounded-full", dark ? "bg-[#141418]" : "bg-white")} />
          </span>
          <span className="flex-1 bg-gradient-to-br from-sky-400 to-indigo-500" />
        </span>
      );
    }
    case "window":
      return (
        <span className="flex h-7 w-10 flex-col overflow-hidden rounded-[3px] bg-[#f7f7f9]">
          <span className="flex h-[7px] items-center px-[3px]">{dots}</span>
          <span className="flex-1 bg-gradient-to-br from-sky-400 to-indigo-500" />
        </span>
      );
    case "phone":
      return (
        <span className="relative block h-7 w-[15px] rounded-[4px] bg-[#18181c] p-[1.5px] ring-1 ring-white/20">
          <span className="block h-full w-full rounded-[3px] bg-gradient-to-b from-sky-400 to-indigo-500" />
          <span className="absolute left-1/2 top-[1.5px] h-[2px] w-[6px] -translate-x-1/2 rounded-b-sm bg-[#18181c]" />
        </span>
      );
    case "tablet":
      return (
        <span className="block h-7 w-10 rounded-[4px] bg-[#1a1a1f] p-[2px] ring-1 ring-white/20">
          <span className="block h-full w-full rounded-[2px] bg-gradient-to-br from-sky-400 to-indigo-500" />
        </span>
      );
    case "laptop":
      return (
        <span className="flex w-11 flex-col items-center">
          <span className="block h-6 w-9 rounded-t-[3px] bg-[#1a1a1f] px-[2px] pb-[2px] pt-[2px] ring-1 ring-white/20">
            <span className="block h-full w-full bg-gradient-to-br from-sky-400 to-indigo-500" />
          </span>
          <span className="block h-[3px] w-11 rounded-b-[2px] bg-[#c3c6cc]" />
        </span>
      );
  }
}

export function FrameControl() {
  const frame = useEditorStore((s) => s.frame);
  const setFrame = useEditorStore((s) => s.setFrame);
  const browserUrl = useEditorStore((s) => s.browserUrl);
  const setBrowserUrl = useEditorStore((s) => s.setBrowserUrl);
  const urlInputId = useId();
  const isBrowser = frame === "browser-light" || frame === "browser-dark";

  return (
    <div className="space-y-4">
      <div role="group" aria-label="Frame" className="grid grid-cols-3 gap-2">
        {FRAME_OPTIONS.map((option) => {
          const selected = option.id === frame;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setFrame(option.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-md border px-1 py-2 text-[11px] transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected ? "border-primary bg-primary/10 text-foreground" : "border-input text-muted-foreground",
              )}
            >
              <span aria-hidden className="grid h-8 place-items-center">
                <FrameThumb frame={option.id} />
              </span>
              {option.label}
            </button>
          );
        })}
      </div>
      {isBrowser ? (
        <div className="space-y-2">
          <Label htmlFor={urlInputId}>URL bar text</Label>
          <Input
            id={urlInputId}
            value={browserUrl}
            maxLength={200}
            placeholder="Leave empty to hide the URL bar"
            spellCheck={false}
            onChange={(event) => setBrowserUrl(event.target.value)}
          />
        </div>
      ) : null}
      <p className="text-xs text-muted-foreground">Frames use your corner radius and shadow settings.</p>
    </div>
  );
}
