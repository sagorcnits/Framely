import { useEffect, useRef } from "react";

type ShortcutHandlers = {
  onDownload: () => void;
  onCopy: () => void;
};

/** Ctrl/Cmd+S downloads, Ctrl/Cmd+Shift+C copies. (Ctrl/Cmd+V is handled by usePaste.) */
export function useShortcuts(handlers: ShortcutHandlers): void {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.repeat) return;
      if (event.code === "KeyS" && !event.shiftKey) {
        event.preventDefault();
        handlersRef.current.onDownload();
      } else if (event.code === "KeyC" && event.shiftKey) {
        event.preventDefault();
        handlersRef.current.onCopy();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
