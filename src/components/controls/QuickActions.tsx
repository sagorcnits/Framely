import { RotateCcw, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store/useEditorStore";

export function QuickActions() {
  const randomize = useEditorStore((s) => s.randomize);
  const reset = useEditorStore((s) => s.reset);

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button variant="secondary" size="sm" onClick={randomize}>
        <Shuffle aria-hidden />
        Randomize style
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          reset();
          toast.success("Style reset to defaults");
        }}
      >
        <RotateCcw aria-hidden />
        Reset to defaults
      </Button>
    </div>
  );
}
