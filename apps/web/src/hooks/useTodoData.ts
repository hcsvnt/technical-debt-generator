import { useCallback, useState } from 'react';

import type { ApiErrorResponse, Todo, TodoFilter } from '@/types/todo';

export type UseTodoDataResult = {
    todos: Todo[];
    loading: boolean;
    error: string | null;
    loadTodos: (filter: TodoFilter) => Promise<void>;
    handleToggleComplete: (todo: Todo) => Promise<void>;
    handleDelete: (todo: Todo) => Promise<void>;
};

export function useTodoData(): UseTodoDataResult {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadTodos = useCallback(async (filter: TodoFilter) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filter && filter !== 'all') {
                params.set('filter', filter);
            }
            const query = params.toString();
            const res = await fetch(`/api/todos${query ? `?${query}` : ''}`);
            const payload = (await res.json()) as { data: Todo[] } & ApiErrorResponse;

            if (!res.ok) {
                throw new Error(payload.errors?.form ?? 'Failed to load todos.');
            }

            setTodos(payload.data ?? []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load todos.');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleToggleComplete = useCallback(async (todo: Todo) => {
        const nextCompleted = !todo.completedAt;
        setTodos((current) =>
            current.map((item) =>
                item.id === todo.id ? { ...item, completedAt: nextCompleted ? new Date().toISOString() : null } : item
            )
        );

        try {
            const res = await fetch(`/api/todos/${todo.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: todo.title,
                    description: todo.description,
                    dueDate: todo.dueDate,
                    completed: nextCompleted,
                }),
            });

            const data = (await res.json()) as { data?: Todo } & ApiErrorResponse;
            if (!res.ok) {
                throw new Error(data.errors?.form ?? 'Unable to update todo.');
            }

            setTodos((current) => current.map((item) => (item.id === todo.id ? (data.data ?? item) : item)));
        } catch (err) {
            setTodos((current) => current.map((item) => (item.id === todo.id ? todo : item)));
            setError(err instanceof Error ? err.message : 'Unable to update todo.');
        }
    }, []);

    const handleDelete = useCallback(async (todo: Todo) => {
        const confirmed = window.confirm(`Delete "${todo.title}"? This cannot be undone.`);
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/todos/${todo.id}`, { method: 'DELETE' });
            const data = (await res.json()) as ApiErrorResponse & { ok?: boolean };
            if (!res.ok) {
                throw new Error(data.errors?.form ?? 'Unable to delete todo.');
            }
            setTodos((current) => current.filter((item) => item.id !== todo.id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to delete todo.');
        }
    }, []);

    return { todos, loading, error, loadTodos, handleToggleComplete, handleDelete };
}
