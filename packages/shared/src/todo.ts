import { z } from "zod";

/**
 * The single definition of what a Todo is and when one is valid.
 *
 * Both sides import this: the server validates request bodies with it, and the
 * form drives react-hook-form from the same schemas. Before this module the
 * rule lived twice — once in the server and once in the web utils — with the
 * error strings copied by hand between them.
 */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * True only for a real calendar date in `YYYY-MM-DD`.
 *
 * `z.iso.date()` is regex-based, so it accepts `2026-02-31`. The round-trip
 * through `Date.UTC` is what rejects days that the month does not have.
 */
export function isCalendarDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number) as [number, number, number];
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const requiredText = (field: string) =>
  z
    .string({ error: `${field} is required.` })
    .transform((value) => value.trim())
    .refine((value) => value.length > 0, { error: `${field} is required.` });

/** What a client may send when creating or editing a todo. */
export const todoInputSchema = z.object({
  title: requiredText("Title"),
  description: requiredText("Description"),
  dueDate: z
    .string({ error: "Due date is required." })
    .transform((value) => value.trim())
    .refine((value) => value.length > 0, { error: "Due date is required." })
    .refine(isCalendarDate, { error: "Use YYYY-MM-DD." }),
});

export type TodoInput = z.infer<typeof todoInputSchema>;

/** The extra field an update may carry to move completion state. */
export const todoUpdateSchema = todoInputSchema.extend({
  completed: z.boolean().optional(),
});

export type TodoUpdate = z.infer<typeof todoUpdateSchema>;

/** A persisted todo, as the API returns it. */
export const todoSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string(),
  dueDate: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().nullable(),
  deletedAt: z.string().nullable(),
});

export type Todo = z.infer<typeof todoSchema>;

export const TODO_FILTERS = ["all", "active", "completed"] as const;
export const todoFilterSchema = z.enum(TODO_FILTERS).catch("all");
export type TodoFilter = (typeof TODO_FILTERS)[number];

/**
 * Field-keyed errors. Keys are input names so the form can map them straight
 * onto inputs; `form` carries anything not attributable to one field.
 */
export type TodoErrors = Partial<Record<keyof TodoInput | "form", string>>;

/** Response envelopes. The API only ever returns one of these two shapes. */
export const todoListResponseSchema = z.object({ data: z.array(todoSchema) });
export const todoResponseSchema = z.object({ data: todoSchema });
export const errorResponseSchema = z.object({
  errors: z.record(z.string(), z.string()),
});

/**
 * Collapse a ZodError into the flat, field-keyed shape the API and the form
 * both speak. First error per field wins, matching the previous behaviour.
 */
export function toTodoErrors(error: z.ZodError): TodoErrors {
  const errors: TodoErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    const key = typeof field === "string" ? field : "form";
    if (!(key in errors)) {
      errors[key as keyof TodoErrors] = issue.message;
    }
  }
  return errors;
}
