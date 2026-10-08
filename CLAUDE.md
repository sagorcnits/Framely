# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev`: start the Vite dev server on http://localhost:5173
- `npm run build`: run `tsc --noEmit`, then `vite build` to `dist/`
- `npm run typecheck`: type-check only
- `npm run preview`: serve the production build

There is no test runner or linter configured. `npm run build` is the correctness gate.

## Architecture

Framely is a client-only screenshot mockup editor (Vite + React 18 + TS strict + Tailwind + shadcn/ui + Zustand). There is no backend.

**One renderer, rendered twice.** `CanvasRenderer` draws the composition at its true pixel size using inline styles only (no Tailwind classes, so modern-screenshot captures it faithfully).
- `CanvasPreview` wraps one instance in a `transform: scale()` box sized by `useFitScale` (ResizeObserver).
- `App.tsx` mounts a second, unscaled instance off-screen (`left: -100000px`). `useExport` passes that node to `lib/export.ts`, which calls `domToBlob`.
- Never export the preview node. Anything added to the composition must go inside `CanvasRenderer`/`FrameWrapper` so both instances stay identical.
- Preview-only decoration (the checkerboard for transparent backgrounds, the dropzone, rings) lives in `CanvasPreview`, outside the renderer.
- The same applies to interaction. Dragging goes through a transparent `[data-drag-handle]` overlay inside the preview's scaled layer, which also draws the selection outline. `SnapGuides` draws the guides there too.
  - The overlay mirrors the frame box using the shared `frameTransform()`.
  - `useDraggable` divides screen deltas by the preview scale and batches store writes with rAF.

**Two modes.** `mode` is either `"simple"` (one image, the `computeLayout` path) or `"template"`.

In template mode:
- `CanvasRenderer` delegates to `TemplateScene`, a pure, prop-driven scene that is also used for the gallery thumbnails in `TemplateCard`.
- `useCanvasLayout` returns the fixed `templateCanvas`.
- `placeholder` controls empty slots: `"label"` in the editor, `"gray"` in thumbnails, `"none"` in the export.

**Templates.**
- Templates are data only: one file per template in `src/templates/`, built with `slot()`/`text()` from `helpers.ts`, and registered in `templates/index.ts`. Don't hard-code layouts in components.
- Slot geometry (center x/y and width as canvas fractions, aspect, rotateX/Y/Z, perspective) is turned into pixels by `slotBox()` in `lib/templateLayout.ts`. Both `SlotRenderer` and the editor handles in `TemplateOverlay` use it, so outlines line up.
- Slot shadows are `filter: drop-shadow()` on the perspective wrapper, applied in screen space so they follow the tilted silhouette. modern-screenshot renders `perspective` and `preserve-3d` correctly; this was verified against the DOM at 1x, 2x and 3x.
- Text layers sit above slots (`TEXT_Z_INDEX`).

**Images and URLs.**
- Image object URLs can be shared between the simple `image` and several `slotImages`. Store actions that change images go through the internal `update()`, which revokes only the URLs nothing references anymore. Never call `URL.revokeObjectURL` directly in actions.
- All image intake goes through `importImageFile(file, { slotId })`, which resolves the target slot via `resolveTargetSlot`. `useDropzone` reads `data-slot-id` from the drop target.

**Dragging.** `useDraggable` is generic, configured with `getStart`, `resolve`, `commit`, `onPress` and `onTap`.
- `resolve` is `resolveSimpleDrag` for the simple-mode screenshot and `resolvePointDrag` for slot centers and text anchors.
- A press that never moves past 3px is treated as a tap (empty slot → file picker; second tap on text → inline edit).

**Free positioning.**
- `position` is an offset from the canvas center, in canvas px. `computeLayout` clamps it into `layout.offset` (≥10% of the frame area stays visible), and renderers always use `layout.offset`, never the raw store value.
- An effect in `App` writes the clamped value back after the canvas size or style changes.
- `clampPosition`, `snapPosition` and `alignedPosition` in `lib/layout.ts` ignore rotation and work on the unrotated frame box.

**Layout math lives in `lib/layout.ts`.**
- `computeLayout` derives the canvas size and frame box from the image, aspect ratio, frame, padding, and scale.
- All frame chrome (browser bar, window bar, phone bezel) is a fixed fraction of frame width. That makes `frameAspect()` a constant per frame and fitting a closed form.
- If you change a frame's chrome proportions, update the ratio constants there and use them in the frame component.
- Auto canvases clamp the image's longest side to 480–2400px. The phone frame uses a fixed 900px width.

**State.** `store/useEditorStore.ts` uses Zustand `persist` with:
- a try/catch-wrapped localStorage
- `partialize` to persist style settings only, never the image
- `merge` with `sanitizeSettings` that validates each persisted field

When adding a setting:
1. Add it to `StyleSettings` in `src/types.ts`.
2. Add its default to `DEFAULT_SETTINGS` in `lib/presets.ts`.
3. Add it to `pickSettings`.
4. Add a validation branch to `sanitizeSettings`.

Numeric ranges live in `LIMITS` (presets.ts) and are reused by sliders, setters, and sanitizing.

**Image intake.**
- Picker, drop, and paste all funnel into `lib/importImage.ts → importImageFile`, which validates the file, loads it, and calls `setImage`.
- `setImage`/`removeImage` revoke the previous object URL.
- Sources over 8000px are downscaled to 6000px in `lib/image.ts`.
- Global listeners live in `hooks/useDropzone.ts`, `usePaste.ts`, and `useShortcuts.ts`, all mounted once in `App`.

**Export limits.** `resolveExportScale` caps the scale so the output stays within 16384px per side, with a stricter area cap on Safari. `copyPng` passes a Promise to `ClipboardItem` so `clipboard.write` runs synchronously inside the user gesture (required by Safari).

**Responsive.** `Sidebar` shows at `md` and up. `MobileControls` (tabbed panel) shows below `md`. Both render the same `controls/*` components.

Path alias: `@/` maps to `src/`.
