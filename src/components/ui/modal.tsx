import * as React from "react";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

function Modal({ open, title, description, onClose, footer, children, className }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={cn("bg-card text-card-foreground w-full max-w-lg rounded-xl border shadow-lg", className)}
        onClick={event => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description ? <p className="text-muted-foreground mt-1 text-sm">{description}</p> : null}
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <XIcon className="size-4" />
          </Button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer ? <div className="flex items-center justify-end gap-2 border-t px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}

export { Modal };
