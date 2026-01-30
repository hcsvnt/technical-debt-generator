import { useCallback, useState } from 'react';

import { formatDateForInput, validateTodoFields, type TodoFieldErrors } from '@/lib/utils';
import type { Todo, TodoFormValues } from '@/types/todo';

export type UseTodoFormResult = {
    isModalOpen: boolean;
    isEditing: boolean;
    editingTodo: Todo | null;
    formValues: TodoFormValues;
    formErrors: TodoFieldErrors;
    openCreateModal: () => void;
    openEditModal: (todo: Todo) => void;
    closeModal: () => void;
    handleFormChange: (field: keyof TodoFormValues, value: string) => void;
    getValidatedPayload: () => TodoFormValues | null;
    setFormErrors: (errors: TodoFieldErrors) => void;
};

export function useTodoForm(): UseTodoFormResult {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
    const [formValues, setFormValues] = useState<TodoFormValues>({
        title: '',
        description: '',
        dueDate: '',
    });
    const [formErrors, setFormErrors] = useState<TodoFieldErrors>({});

    const isEditing = Boolean(editingTodo);

    const resetForm = useCallback((todo?: Todo | null) => {
        setFormErrors({});
        setFormValues({
            title: todo?.title ?? '',
            description: todo?.description ?? '',
            dueDate: formatDateForInput(todo?.dueDate ?? ''),
        });
    }, []);

    const openCreateModal = useCallback(() => {
        setEditingTodo(null);
        resetForm();
        setIsModalOpen(true);
    }, [resetForm]);

    const openEditModal = useCallback(
        (todo: Todo) => {
            setEditingTodo(todo);
            resetForm(todo);
            setIsModalOpen(true);
        },
        [resetForm]
    );

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingTodo(null);
    }, []);

    const handleFormChange = useCallback((field: keyof TodoFormValues, value: string) => {
        setFormValues((current) => ({ ...current, [field]: value }));
        setFormErrors((current) => ({ ...current, [field]: undefined }));
    }, []);

    const getValidatedPayload = useCallback((): TodoFormValues | null => {
        const errors = validateTodoFields(formValues);
        if (Object.keys(errors).length) {
            setFormErrors(errors);
            return null;
        }

        return {
            title: formValues.title.trim(),
            description: formValues.description.trim(),
            dueDate: formValues.dueDate.trim(),
        };
    }, [formValues]);

    return {
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
    };
}
