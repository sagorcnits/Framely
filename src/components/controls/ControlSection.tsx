import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type ControlSectionProps = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

/** Collapsible group of controls in the desktop sidebar. */
export function ControlSection({ title, defaultOpen = true, children }: ControlSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section className="border-b">
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-[13px] font-semibold tracking-tight transition-colors hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          {title}
          <ChevronDown
            aria-hidden
            className={cn("size-4 text-muted-foreground transition-transform", open ? "rotate-0" : "-rotate-90")}
          />
        </button>
      </h2>
      <div id={contentId} hidden={!open} className="px-4 pb-5 pt-1">
        {children}
      </div>
    </section>
  );
}
