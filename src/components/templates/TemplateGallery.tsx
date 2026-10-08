import { useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TEMPLATE_CATEGORIES } from "@/lib/presets";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/useEditorStore";
import { TEMPLATES } from "@/templates";
import type { Template, TemplateCategory } from "@/types";
import { TemplateCard } from "./TemplateCard";

type CategoryFilter = TemplateCategory | "all";

function matches(template: Template, category: CategoryFilter, query: string): boolean {
  const inCategory =
    category === "all" || template.category === category || (category === "text" && template.texts.length > 0);
  if (!inCategory) return false;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return template.name.toLowerCase().includes(q) || template.tags.some((tag) => tag.toLowerCase().includes(q));
}

/** Full-screen on mobile, a large modal on desktop. */
export function TemplateGallery() {
  const open = useEditorStore((s) => s.isGalleryOpen);
  const setOpen = useEditorStore((s) => s.setGalleryOpen);
  const mode = useEditorStore((s) => s.mode);
  const activeTemplateId = useEditorStore((s) => s.activeTemplateId);
  const applyTemplate = useEditorStore((s) => s.applyTemplate);
  const exitTemplateMode = useEditorStore((s) => s.exitTemplateMode);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => TEMPLATES.filter((t) => matches(t, category, query)), [category, query]);

  const onSelect = (template: Template) => {
    applyTemplate(template);
    setOpen(false);
    const state = useEditorStore.getState();
    const empty = state.slots.filter((slot) => !state.slotImages[slot.id]).length;
    if (empty > 0) {
      toast.info(`${template.name} loaded. Click a slot, drop a file on it, or paste to add screenshots.`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="flex h-dvh max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-[86vh] sm:w-[min(1120px,94vw)] sm:rounded-xl"
        aria-describedby="template-gallery-description"
        onOpenAutoFocus={(event) => {
          // Focus the dialog itself rather than the search box, so phones don't pop up the keyboard.
          event.preventDefault();
          (event.currentTarget as HTMLElement | null)?.focus();
        }}
      >
        <div className="space-y-3 border-b px-4 pb-3 pt-4 sm:px-6 sm:pt-5">
          <div className="pr-10">
            <DialogTitle>Templates</DialogTitle>
            <DialogDescription id="template-gallery-description">
              Pick a layout, then fill its slots with your screenshots.
            </DialogDescription>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search templates"
                aria-label="Search templates by name or tag"
                className="pl-8"
              />
            </div>
            <div
              role="group"
              aria-label="Template categories"
              className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0"
            >
              {TEMPLATE_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={category === c.id}
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    category === c.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
          {visible.length ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4">
              {visible.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  active={mode === "template" && activeTemplateId === template.id}
                  onSelect={onSelect}
                />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-muted-foreground">No templates match “{query}”.</p>
          )}
        </div>

        {mode === "template" ? (
          <div className="flex justify-end border-t px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                exitTemplateMode();
                setOpen(false);
              }}
            >
              <ArrowLeft aria-hidden />
              Back to simple mode
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
