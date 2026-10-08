import type { ComponentProps } from "react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = ComponentProps<typeof Sonner>;

/** shadcn/ui toast (Sonner), themed for the dark UI. */
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="bottom-center"
      closeButton
      toastOptions={{
        classNames: {
          toast: "!bg-popover !text-popover-foreground !border-border !shadow-lg",
          description: "!text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}
