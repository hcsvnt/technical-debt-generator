import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { todoInputSchema, type Todo, type TodoErrors, type TodoInput } from "@todo/shared";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useReturnFocus } from "@/hooks/useReturnFocus";
import { ApiError } from "@/api/todos";

const EMPTY: TodoInput = { title: "", description: "", dueDate: "" };

type TodoFormDialogProps = {
  open: boolean;
  /** The todo being edited, or null when creating. */
  todo: Todo | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: TodoInput) => Promise<unknown>;
};

export function TodoFormDialog({ open, todo, onOpenChange, onSubmit }: TodoFormDialogProps) {
  const isEditing = todo !== null;
  const onCloseAutoFocus = useReturnFocus(open);

  const form = useForm<TodoInput>({
    // The same schema the server validates with.
    resolver: zodResolver(todoInputSchema),
    defaultValues: EMPTY,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (!open) return;
    reset(
      todo
        ? { title: todo.title, description: todo.description, dueDate: todo.dueDate }
        : EMPTY,
    );
  }, [open, todo, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      // Map the server's field errors back onto the inputs that caused them.
      const fields: TodoErrors = error instanceof ApiError ? error.errors : {};
      const entries = Object.entries(fields) as [keyof TodoErrors, string][];

      if (entries.length === 0) {
        setError("root", { message: "Unable to save your changes." });
        return;
      }

      for (const [field, message] of entries) {
        if (field === "form") {
          setError("root", { message });
        } else {
          setError(field, { message });
        }
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" onCloseAutoFocus={onCloseAutoFocus}>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit todo" : "New todo"}</DialogTitle>
          <DialogDescription>All fields are required.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate className="grid gap-4">
          <Field id="title" label="Title" error={errors.title?.message}>
            {(aria) => <Input id="title" autoFocus {...aria} {...register("title")} />}
          </Field>

          <Field id="description" label="Description" error={errors.description?.message}>
            {(aria) => (
              <Textarea id="description" className="min-h-30" {...aria} {...register("description")} />
            )}
          </Field>

          <Field id="dueDate" label="Due date" error={errors.dueDate?.message}>
            {(aria) => <Input id="dueDate" type="date" {...aria} {...register("dueDate")} />}
          </Field>

          {errors.root ? (
            <p role="alert" className="text-destructive text-sm">
              {errors.root.message}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Create todo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type FieldAria = { "aria-describedby"?: string; "aria-invalid": boolean };

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  /** Receives the aria wiring so it lands on the control, not a wrapper. */
  children: (aria: FieldAria) => React.ReactNode;
};

function Field({ id, label, error, children }: FieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children({
        "aria-describedby": error ? errorId : undefined,
        "aria-invalid": Boolean(error),
      })}
      {error ? (
        <p id={errorId} className="text-destructive text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}
