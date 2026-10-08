import { useEffect } from "react";
import { firstFile } from "@/lib/image";
import { importImageFile } from "@/lib/importImage";

/** Imports an image pasted anywhere on the page (Ctrl/Cmd+V). Text pastes pass through. */
export function usePaste(): void {
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const file = firstFile(event.clipboardData);
      if (!file) return;
      event.preventDefault();
      void importImageFile(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);
}
