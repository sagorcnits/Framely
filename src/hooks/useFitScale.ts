import { useLayoutEffect, useState, type RefObject } from "react";

/**
 * Scale factor that fits a `width`×`height` box inside the observed element,
 * keeping a gutter around it. Never scales up. Returns 0 until measured.
 */
export function useFitScale(
  containerRef: RefObject<HTMLElement | null>,
  width: number,
  height: number,
  gutter = 32,
): number {
  const [box, setBox] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) setBox({ width: rect.width, height: rect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [containerRef]);

  if (!box.width || !box.height || !width || !height) return 0;
  const g = box.width < 500 ? Math.min(12, gutter) : gutter;
  return Math.max(0.01, Math.min((box.width - g * 2) / width, (box.height - g * 2) / height, 1));
}
