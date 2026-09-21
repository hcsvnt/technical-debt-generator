import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Todo, TodoFilter, TodoFormValues } from '@/types/todo';
import type { TodoFieldErrors } from '@/lib/utils';
import { useTodoData } from '@/hooks/useTodoData';
import { useTodoFilter } from '@/hooks/useTodoFilter';
import { useTodoForm } from '@/hooks/useTodoForm';

export type UseTodosResult = {
    todos: Todo[];
    filter: TodoFilter;
    loading: boolean;
    error: string | null;
    isModalOpen: boolean;
    isSaving: boolean;
    isEditing: boolean;
    editingTodo: Todo | null;
    formValues: TodoFormValues;
    formErrors: TodoFieldErrors;
    emptyState: string | null;
    openCreateModal: () => void;
    openEditModal: (todo: Todo) => void;
    closeModal: () => void;
    updateFilter: (value: TodoFilter) => Promise<void>;
    handleFormChange: (field: keyof TodoFormValues, value: string) => void;
    handleSave: () => Promise<void>;
    handleToggleComplete: (todo: Todo) => Promise<void>;
    handleDelete: (todo: Todo) => Promise<void>;
};

export function useTodos(): UseTodosResult {
    const [isSaving, setIsSaving] = useState(false);
    const { filter, updateFilter } = useTodoFilter();
    const { todos, loading, error, loadTodos, handleToggleComplete, handleDelete } = useTodoData();
    const {
        isModalOpen,
        isEditing,
        editingTodo,
        formValues,
        formErrors,
        openCreateModal,
        openEditModal,
        closeModal,
        handleFormChange,
        getValidatedPayload,
        setFormErrors,
    } = useTodoForm();

    useEffect(() => {
        void loadTodos(filter);
    }, [filter, loadTodos]);

    const updateFilterAndReload = useCallback(
        async (value: TodoFilter) => {
            updateFilter(value);
            await loadTodos(value);
        },
        [loadTodos, updateFilter]
    );

    const handleSave = useCallback(async () => {
        const payload = getValidatedPayload();
        if (!payload) return;

        setIsSaving(true);
        try {
            const res = await fetch(editingTodo ? `/api/todos/${editingTodo.id}` : '/api/todos', {
                method: editingTodo ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = (await res.json()) as { data?: Todo } & { errors?: Record<string, string> };
            if (!res.ok) {
                setFormErrors(data.errors ?? { title: 'Unable to save.' });
                return;
            }

            closeModal();
            await loadTodos(filter);
        } catch {
            setFormErrors({ title: 'Unable to save your changes.' });
        } finally {
            setIsSaving(false);
        }
    }, [closeModal, editingTodo, filter, getValidatedPayload, loadTodos, setFormErrors]);

    const emptyState = useMemo(() => {
        if (loading) return 'Loading todos...';
        if (error) return error;
        if (!todos.length) return 'No todos yet. Create your first one.';
        return null;
    }, [loading, error, todos.length]);

    return {
        todos,
        filter,
        loading,
        error,
        isModalOpen,
        isSaving,
        isEditing,
        editingTodo,
        formValues,
        formErrors,
        emptyState,
        openCreateModal,
        openEditModal,
        closeModal,
        updateFilter: updateFilterAndReload,
        handleFormChange,
        handleSave,
        handleToggleComplete,
        handleDelete,
    };
}
