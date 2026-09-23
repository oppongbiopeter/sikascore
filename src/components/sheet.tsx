import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
};

export function Sheet({ open, onOpenChange, title, children }: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-bg/70 data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-bg pb-[env(safe-area-inset-bottom)] shadow-[var(--shadow-border)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
          )}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between bg-bg px-5 pt-4 pb-3">
            <Dialog.Title className="text-lg font-semibold tracking-tight text-fg">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="flex size-11 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-fg"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </Dialog.Close>
          </div>
          <div className="px-5 pb-8">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
