import { useRef } from "react";
import { Crown } from "lucide-react";
import { TemplateScene } from "@/components/canvas/TemplateScene";
import { useFitScale } from "@/hooks/useFitScale";
import { cn } from "@/lib/utils";
import type { Template } from "@/types";

const NO_IMAGES = {};

/** Live, scaled-down render of a template with gray placeholder content. */
function TemplateThumb({ template }: { template: Template }) {
  const ref = useRef<HTMLDivElement>(null);
  const { width, height } = template.canvas;
  const scale = useFitScale(ref, width, height, 0);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width,
          height,
          transform: `translate(-50%, -50%) scale(${scale})`,
          visibility: scale ? "visible" : "hidden",
        }}
      >
        <TemplateScene
          canvas={template.canvas}
          background={template.background}
          slots={template.slots}
          texts={template.texts}
          images={NO_IMAGES}
          placeholder="gray"
          browserUrl="example.com"
        />
      </div>
    </div>
  );
}

type TemplateCardProps = {
  template: Template;
  active: boolean;
  onSelect: (template: Template) => void;
};

export function TemplateCard({ template, active, onSelect }: TemplateCardProps) {
  const slotCount = template.slots.length;
  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      aria-label={`${template.name} template, ${slotCount} image ${slotCount === 1 ? "slot" : "slots"}${template.premium ? ", premium" : ""}`}
      aria-current={active ? "true" : undefined}
      className="group flex flex-col gap-2 rounded-xl text-left focus-visible:outline-none"
    >
      <span
        className={cn(
          "relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-secondary ring-1 ring-white/10 transition duration-200 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-black/40 group-focus-visible:ring-2 group-focus-visible:ring-ring",
          active && "ring-2 ring-primary",
        )}
      >
        <TemplateThumb template={template} />
        {template.premium ? (
          <span
            className="absolute bottom-2 left-2 grid size-6 place-items-center rounded-full bg-black/65 text-amber-300 shadow"
            title="Premium"
          >
            <Crown className="size-3.5" aria-hidden />
          </span>
        ) : null}
        <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white/85">
          {slotCount} {slotCount === 1 ? "image" : "images"}
        </span>
      </span>
      <span className="px-0.5 text-sm font-medium leading-tight">{template.name}</span>
    </button>
  );
}
