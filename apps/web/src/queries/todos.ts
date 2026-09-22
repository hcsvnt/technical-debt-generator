import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { toast } from "sonner";

import type { Todo, TodoFilter, TodoInput } from "@todo/shared";

import { ApiError, createTodo, deleteTodo, fetchTodos, setTodoCompleted, updateTodo } from "@/api/todos";

export const todoKeys = {
  all: ["todos"] as const,
  list: (filter: TodoFilter) => ["todos", filter] as const,
};

export function useTodosQuery(filter: TodoFilter) {
  return useQuery({
    queryKey: todoKeys.list(filter),
    queryFn: () => fetchTodos(filter),
  });
}

/** Write failures surface as a toast; they must never replace the list. */
const notifyFailure = (fallback: string) => (error: unknown) => {
  toast.error(error instanceof ApiError ? error.message : fallback);
};

function useInvalidateTodos() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: todoKeys.all });
}

export function useCreateTodo(): UseMutationResult<Todo, unknown, TodoInput> {
  const invalidate = useInvalidateTodos();
  return useMutation({
    mutationFn: createTodo,
    onSuccess: invalidate,
  });
}

export function useUpdateTodo(): UseMutationResult<Todo, unknown, { id: number; input: TodoInput }> {
  const invalidate = useInvalidateTodos();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: TodoInput }) => updateTodo(id, input),
    onSuccess: invalidate,
  });
}

/**
 * Optimistic toggle. Patches every cached list, rolls the snapshot back on
 * failure, and invalidates on settle so the server re-sorts — completing a
 * todo has to move it, and only the server knows the order.
 */
export function useToggleTodo() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ todo, completed }: { todo: Todo; completed: boolean }) =>
      setTodoCompleted(todo, completed),

    async onMutate({ todo, completed }) {
      await client.cancelQueries({ queryKey: todoKeys.all });
      const snapshot = client.getQueriesData<Todo[]>({ queryKey: todoKeys.all });

      const completedAt = completed ? new Date().toISOString() : null;
      client.setQueriesData<Todo[]>({ queryKey: todoKeys.all }, (current) =>
        current?.map((item) => (item.id === todo.id ? { ...item, completedAt } : item)),
      );

      return { snapshot };
    },

    onError(error, _variables, context) {
      for (const [key, data] of context?.snapshot ?? []) {
        client.setQueryData(key, data);
      }
      notifyFailure("Unable to update todo.")(error);
    },

    onSettled: () => client.invalidateQueries({ queryKey: todoKeys.all }),
  });
}

export function useDeleteTodo() {
  const invalidate = useInvalidateTodos();
  return useMutation({
    mutationFn: (todo: Todo) => deleteTodo(todo.id),
    onSuccess: invalidate,
    onError: notifyFailure("Unable to delete todo."),
  });
}
