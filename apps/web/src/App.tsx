import './index.css';
import { TodoEmptyState } from '@/components/todo/TodoEmptyState';
import { TodoHeader } from '@/components/todo/TodoHeader';
import { TodoList } from '@/components/todo/TodoList';
import { TodoModal } from '@/components/todo/TodoModal';
import { useTodos } from '@/hooks/useTodos';

export function App() {
    const {
        todos,
        filter,
        loading,
        error,
        isModalOpen,
        isSaving,
        isEditing,
        formValues,
        formErrors,
        emptyState,
        openCreateModal,
        openEditModal,
        closeModal,
        updateFilter,
        handleFormChange,
        handleSave,
        handleToggleComplete,
        handleDelete,
    } = useTodos();

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
                <TodoHeader filter={filter} onFilterChange={updateFilter} onNewTodo={openCreateModal} />

                {emptyState ? (
                    <TodoEmptyState loading={loading} error={error} message={emptyState} />
                ) : (
                    <TodoList
                        todos={todos}
                        onEdit={openEditModal}
                        onToggleComplete={handleToggleComplete}
                        onDelete={handleDelete}
                    />
                )}
            </div>
            <TodoModal
                open={isModalOpen}
                isEditing={isEditing}
                isSaving={isSaving}
                formValues={formValues}
                formErrors={formErrors}
                onClose={closeModal}
                onSave={handleSave}
                onChange={handleFormChange}
            />
        </div>
    );
}

export default App;
