import { useCallback, useEffect, useRef, type ChangeEvent } from "react";
import { ACCEPT_ATTR } from "@/lib/image";
import { importImageFile } from "@/lib/importImage";

/**
 * Hidden file input wiring. Spread `inputProps` on an <input> and call `open()` from a button.
 * Pass a slot id to send the chosen image to that template slot.
 */
export function useFilePicker(slotId?: string) {
  const inputRef = useRef<HTMLInputElement>(null);
  const slotRef = useRef(slotId);
  useEffect(() => {
    slotRef.current = slotId;
  });

  const open = useCallback(() => inputRef.current?.click(), []);

  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset so choosing the same file again still fires a change event.
    event.target.value = "";
    if (file) void importImageFile(file, { slotId: slotRef.current });
  }, []);

  return {
    open,
    inputProps: {
      ref: inputRef,
      type: "file" as const,
      accept: ACCEPT_ATTR,
      onChange,
      className: "hidden",
      tabIndex: -1,
      "aria-hidden": true,
    },
  };
}
