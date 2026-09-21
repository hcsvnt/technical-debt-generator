import type { Todo } from '@/types/todo';
import { TodoCard } from '@/components/todo/TodoCard';

type TodoListProps = {
    todos: Todo[];
    onEdit: (todo: Todo) => void;
    onToggleComplete: (todo: Todo) => void;
    onDelete: (todo: Todo) => void;
};

export function TodoList({ todos, onEdit, onToggleComplete, onDelete }: TodoListProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {todos.map((todo) => (
                <TodoCard
                    key={todo.id}
                    todo={todo}
                    onEdit={onEdit}
                    onToggleComplete={onToggleComplete}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
