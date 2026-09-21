import type { Todo } from "@todo/shared";

/**
 * What the list area is showing, as one value.
 *
 * Previously these states were flattened into a nullable string and then
 * re-derived downstream, which is how a failed write ended up blanking the
 * whole grid.
 */
export type TodoListView =
  | { status: "loading" }
  | { status: "failed"; message: string }
  | { status: "empty" }
  | { status: "ready"; todos: Todo[] };

export function toListView(input: {
  isPending: boolean;
  error: unknown;
  todos: Todo[] | undefined;
}): TodoListView {
  // Data wins. A write failure invalidates the list, and that refetch fails
  // too while the server is unreachable — but we still hold the todos we
  // already loaded, and throwing the user's list away to show an error card
  // is the exact defect this type exists to prevent. The toast carries the
  // error instead. Only a load with nothing to show may replace the grid.
  if (input.todos?.length) return { status: "ready", todos: input.todos };

  if (input.isPending) return { status: "loading" };

  if (input.error) {
    return {
      status: "failed",
      message: input.error instanceof Error ? input.error.message : "Failed to load todos.",
    };
  }

  return { status: "empty" };
}
