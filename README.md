# Framely

Framely is a browser-based screenshot mockup editor. You upload a screenshot, place it on a styled background with an optional frame, and export a sharp, high-resolution PNG.

Everything runs client-side. There is no backend, no account, and no upload: your image never leaves the browser.

## Setup

Requires Node.js 18+.

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build      # type-check (tsc --noEmit) + production build to dist/
npm run typecheck  # type-check only
npm run preview    # serve the production build locally
```

## Features

**Image input**
- Click to upload, drag-and-drop anywhere on the page, or paste anywhere with Ctrl/Cmd+V
- Accepts PNG, JPG, and WebP. Other types are rejected with a toast.
- The image is kept as an object URL, and the old URL is revoked when you replace or remove it.
- Images larger than 8000px are downscaled to 6000px so editing and export stay smooth. Very small images trigger a warning.

**Canvas size:** Auto (the image plus padding), 16:9 (1920×1080), 1:1 (1080×1080), 4:5 (1080×1350), 9:16 (1080×1920), 4:3 (1600×1200). The screenshot is always centered and fitted inside the padding.

**Free positioning**
- Drag the screenshot (with its frame) anywhere using a mouse, trackpad, or touch. It can hang off the edges for a cropped look, but at least 10% of it always stays visible.
- It snaps to the canvas centers and padding edges within 8px, with accent guide lines shown in the preview only. Hold **Shift** to turn snapping off, or **Alt/Option** to lock movement to one axis.
- Click the image to select it. Arrow keys then nudge it 1px (Shift: 10px), and Escape deselects it.
- The Position section has X/Y inputs (pixels from the center), a 3×3 alignment grid that respects the padding, and a Center button.

**Templates**
- Click **Templates** in the top bar to open the gallery (full-screen on mobile). It has category filters (Device, 3D Perspective, Isometric, Stack, Multi-screen, With text) and a search box that matches names and tags. Every card is a live render of the template, and premium templates show a crown. The flag is reserved for a future paid tier; premium templates are fully usable today.
- 13 built-in templates, all original CSS/SVG artwork: Twin Tablets, Perspective Cascade, Isometric Stack, Dark Floating Pages, Layered Cards with Headline, Single Tablet Tilt, Phone Trio, Laptop Hero, Browser + Phone, Fan Spread, Hero Tilt, Grid Showcase, and Headline Hero.
- Filling slots:
  - Click an empty slot to choose a file.
  - Drop a file onto a slot. Drop several files to fill the empty slots in order.
  - Paste to fill the selected slot, or the next empty one.
  - Turn on "Use one image for all slots" to put the same screenshot in every slot.
- Slot settings: frame, corner radius, shadow (including "floating"), cover or contain fit, top or center image position, a scroll slider for tall pages, rotate X/Y/Z, perspective, and size. You can also duplicate or delete a slot, change its layer order, and drag it on the canvas.
- Text layers: drag to move, double-click to edit in place, and set the font, size, weight, color, and alignment. Use **+ Add text** to create one.
- **Reset template** restores the original layout and keeps your images. Switching templates also keeps your images, filling the new slots in order. **Simple mode** returns to the single-image editor.
- Empty slots and selection outlines appear only in the editor. They are never exported.

**Background**
- 18 original gradient presets, plus a custom gradient with two color pickers and an angle slider (0–360°)
- 12 solid color presets plus a custom color picker
- Transparent: exports a PNG with an alpha channel. The checkerboard appears in the preview only.

**Styling:** padding (0–200px), scale (50–100%), corner radius (0–40px), shadow presets (None/S/M/L/XL) with opacity, rotation (−15° to 15°), and an optional border (color, 1–8px).

**Frames:** all drawn with CSS/SVG, no image assets.
- Browser, in light and dark versions. It has traffic-light dots and an editable URL bar; leave the URL empty to hide the bar.
- Minimal window (dots only)
- Generic phone with a notch. The screenshot fills the screen with `object-fit: cover`.
- Generic tablet (even bezel and front camera) and laptop (thin lid bezel on a slim aluminium base).
- Every frame uses the corner radius, shadow, and border settings.

**Export**
- Download as `framely-YYYYMMDD-HHmmss.png` at 1x, 2x, or 3x of the true canvas size
- Copy to the clipboard as a PNG (ClipboardItem API). If the browser doesn't support it or blocks access, you get a clear message instead.
- The export renders a hidden, unscaled copy of the canvas, never the scaled-down preview.
- Very large exports are capped to stay within browser canvas limits, and a toast tells you when that happens.

**Extras**
- Randomize style (random gradient, padding, and shadow) and Reset to defaults
- Style settings persist in localStorage. The image is not persisted.
- Keyboard shortcuts:

| Shortcut | Action |
| --- | --- |
| Ctrl/Cmd + V | Paste a screenshot |
| Ctrl/Cmd + S | Download PNG |
| Ctrl/Cmd + Shift + C | Copy PNG |

> In Chrome, Ctrl+Shift+C may be captured by DevTools while DevTools is open.

## Tech stack

Vite, React 18, TypeScript (strict), Tailwind CSS, shadcn/ui (Radix primitives with Sonner for toasts), Zustand, react-colorful, modern-screenshot, and lucide-react.

## Project structure

```
src/
  App.tsx                 app shell, global drop/paste/shortcuts, hidden export renderer
  components/
    layout/               TopBar, Sidebar (desktop), MobileControls (<768px)
    canvas/               CanvasRenderer (true size), CanvasPreview (scaled), Dropzone
    frames/               FrameWrapper + Browser/Window/Phone frames
    controls/             sidebar control groups
    ui/                   shadcn/ui components
  components/templates/   TemplateGallery + TemplateCard (live thumbnails)
  templates/              one file per built-in template + index.ts
  store/useEditorStore.ts Zustand store (persisted style + template settings)
  lib/                    presets, layout math, image loading, export
  hooks/                  paste, dropzone, shortcuts, fit-scale, export, file picker
```

## Deploying to Vercel

Framely is a static site, so no configuration file is needed.

**From the dashboard**
1. Push the project to a GitHub, GitLab, or Bitbucket repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Vercel detects **Vite** automatically. Confirm these settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
4. Click **Deploy**.

**From the CLI**

```bash
npm i -g vercel
vercel          # first deploy creates a preview deployment and links the project
vercel --prod   # deploy to production
```

Clipboard copy requires a secure context (HTTPS or localhost). Vercel serves over HTTPS by default.
