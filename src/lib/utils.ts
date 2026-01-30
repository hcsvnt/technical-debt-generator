import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateString(value: string): boolean {
  if (!datePattern.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function formatDateForInput(value?: string | null): string {
  if (!value) return "";
  if (datePattern.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export type TodoFieldErrors = Partial<Record<"title" | "description" | "dueDate", string>>;

export function validateTodoFields(input: {
  title?: string;
  description?: string;
  dueDate?: string;
}): TodoFieldErrors {
  const errors: TodoFieldErrors = {};

  if (!input.title?.trim()) {
    errors.title = "Title is required.";
  }

  if (!input.description?.trim()) {
    errors.description = "Description is required.";
  }

  if (!input.dueDate?.trim()) {
    errors.dueDate = "Due date is required.";
  } else if (!isValidDateString(input.dueDate)) {
    errors.dueDate = "Use YYYY-MM-DD.";
  }

  return errors;
}
