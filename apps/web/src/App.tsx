import './index.css';

import { useState } from 'react';

import type { Todo, TodoInput } from '@todo/shared';

import { DeleteTodoDialog } from '@/components/todo/DeleteTodoDialog';
import { TodoEmptyState } from '@/components/todo/TodoEmptyState';
import { TodoFormDialog } from '@/components/todo/TodoFormDialog';
import { TodoHeader } from '@/components/todo/TodoHeader';
import { TodoList } from '@/components/todo/TodoList';
import { toListView } from '@/components/todo/TodoListView';
import { Toaster } from '@/components/ui/sonner';
import { useTodoFilter } from '@/hooks/useTodoFilter';
import {
    useCreateTodo,
    useDeleteTodo,
    useTodosQuery,
    useToggleTodo,
    useUpdateTodo,
} from '@/queries/todos';

export function App() {
    const { filter, setFilter } = useTodoFilter();
    const { data, isPending, error } = useTodosQuery(filter);

    const createTodo = useCreateTodo();
    const updateTodo = useUpdateTodo();
    const toggleTodo = useToggleTodo();
    const deleteTodo = useDeleteTodo();

    const [editing, setEditing] = useState<Todo | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<Todo | null>(null);

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };

    const openEdit = (todo: Todo) => {
        setEditing(todo);
        setFormOpen(true);
    };

    // Rejects so the dialog can map field errors back onto its inputs and stay open.
    const submitTodo = (input: TodoInput) =>
        editing
            ? updateTodo.mutateAsync({ id: editing.id, input })
            : createTodo.mutateAsync(input);

    const view = toListView({ isPending, error, todos: data });

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
                <TodoHeader filter={filter} onFilterChange={setFilter} onNewTodo={openCreate} />

                {view.status === 'loading' ? (
                    <TodoEmptyState title="Loading" message="Loading todos..." />
                ) : view.status === 'failed' ? (
                    <TodoEmptyState title="Error" message={view.message} tone="destructive" />
                ) : view.status === 'empty' ? (
                    <TodoEmptyState title="Nothing here" message="No todos yet. Create your first one." />
                ) : (
                    <TodoList
                        todos={view.todos}
                        onEdit={openEdit}
                        onToggleComplete={(todo) =>
                            toggleTodo.mutate({ todo, completed: !todo.completedAt })
                        }
                        onDelete={setPendingDelete}
                    />
                )}
            </div>

            <TodoFormDialog
                open={formOpen}
                todo={editing}
                onOpenChange={setFormOpen}
                onSubmit={submitTodo}
            />

            <DeleteTodoDialog
                todo={pendingDelete}
                onOpenChange={(open) => !open && setPendingDelete(null)}
                onConfirm={(todo) => {
                    deleteTodo.mutate(todo);
                    setPendingDelete(null);
                }}
            />

            <Toaster richColors position="bottom-right" />
        </div>
    );
}

export default App;
