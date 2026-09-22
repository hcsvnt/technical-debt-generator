import type { Todo } from "@todo/shared";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { useReturnFocus } from "@/hooks/useReturnFocus";

type DeleteTodoDialogProps = {
  /** The todo awaiting confirmation, or null when the dialog is closed. */
  todo: Todo | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (todo: Todo) => void;
};

/** Replaces window.confirm, which sat inside the data layer and could not be styled or tested. */
export function DeleteTodoDialog({ todo, onOpenChange, onConfirm }: DeleteTodoDialogProps) {
  const onCloseAutoFocus = useReturnFocus(todo !== null);

  return (
    <AlertDialog open={todo !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent onCloseAutoFocus={onCloseAutoFocus}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{todo?.title}”?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            onClick={() => todo && onConfirm(todo)}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
