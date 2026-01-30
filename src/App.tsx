import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';

import './index.css';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatDateForInput, validateTodoFields, type TodoFieldErrors } from '@/lib/utils';

type Todo = {
    id: number;
    title: string;
    description: string;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
    completedAt: string | null;
    deletedAt: string | null;
};

type ApiErrorResponse = { errors?: Record<string, string> };

const formatDisplayDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export function App() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
    const [formValues, setFormValues] = useState({
        title: '',
        description: '',
        dueDate: '',
    });
    const [formErrors, setFormErrors] = useState<TodoFieldErrors>({});

    const isEditing = Boolean(editingTodo);

    const loadTodos = async (nextFilter = filter) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (nextFilter && nextFilter !== 'all') {
                params.set('filter', nextFilter);
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
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const paramFilter = params.get('filter');
        if (paramFilter && ['all', 'active', 'completed'].includes(paramFilter)) {
            setFilter(paramFilter);
            loadTodos(paramFilter);
            return;
        }
        loadTodos('all');
    }, []);

    const updateFilter = async (value: string) => {
        setFilter(value);
        const params = new URLSearchParams(location.search);
        if (value === 'all') {
            params.delete('filter');
        } else {
            params.set('filter', value);
        }
        const newUrl = `${location.pathname}${params.toString() ? `?${params}` : ''}`;
        history.pushState({}, '', newUrl);
        await loadTodos(value);
    };

    const resetForm = (todo?: Todo | null) => {
        setFormErrors({});
        setFormValues({
            title: todo?.title ?? '',
            description: todo?.description ?? '',
            dueDate: formatDateForInput(todo?.dueDate ?? ''),
        });
    };

    const openCreateModal = () => {
        setEditingTodo(null);
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (todo: Todo) => {
        setEditingTodo(todo);
        resetForm(todo);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTodo(null);
    };

    const handleFormChange = (field: keyof typeof formValues, value: string) => {
        setFormValues((current) => ({ ...current, [field]: value }));
        setFormErrors((current) => ({ ...current, [field]: undefined }));
    };

    const handleSave = async () => {
        const errors = validateTodoFields(formValues);
        if (Object.keys(errors).length) {
            setFormErrors(errors);
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                title: formValues.title.trim(),
                description: formValues.description.trim(),
                dueDate: formValues.dueDate.trim(),
            };
            const res = await fetch(editingTodo ? `/api/todos/${editingTodo.id}` : '/api/todos', {
                method: editingTodo ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = (await res.json()) as { data?: Todo } & ApiErrorResponse;
            if (!res.ok) {
                setFormErrors(data.errors ?? { title: 'Unable to save.' });
                return;
            }

            setIsModalOpen(false);
            setEditingTodo(null);
            await loadTodos();
        } catch (err) {
            setFormErrors({ title: 'Unable to save your changes.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleComplete = async (todo: Todo) => {
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
    };

    const handleDelete = async (todo: Todo) => {
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
    };

    const emptyState = useMemo(() => {
        if (loading) return 'Loading todos...';
        if (error) return error;
        if (!todos.length) return 'No todos yet. Create your first one.';
        return null;
    }, [loading, error, todos.length]);

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
                <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Todo Notes
                        </p>
                        <h1 className="text-3xl font-bold text-foreground">Stay on track</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Capture work, track deadlines, and finish fast.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Select value={filter} onValueChange={updateFilter}>
                            <SelectTrigger className="min-w-40" aria-label="Filter todos">
                                <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent align="end">
                                <SelectItem value="all">All todos</SelectItem>
                                <SelectItem value="active">Active only</SelectItem>
                                <SelectItem value="completed">Completed only</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={openCreateModal} className="gap-2">
                            <PlusIcon className="size-4" />
                            New todo
                        </Button>
                    </div>
                </header>

                {emptyState ? (
                    <Card className={cn('border-dashed', error ? 'border-destructive' : '')}>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {loading ? 'Loading' : error ? 'Error' : 'Nothing here'}
                            </CardTitle>
                            <CardDescription>{emptyState}</CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {todos.map((todo) => (
                            <Card key={todo.id} className={cn(todo.completedAt ? 'opacity-70' : '')}>
                                <CardHeader className="gap-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <CardTitle className="text-lg">{todo.title}</CardTitle>
                                            <CardDescription>Due {formatDisplayDate(todo.dueDate)}</CardDescription>
                                        </div>
                                        {todo.completedAt ? (
                                            <Badge variant="success">
                                                <CheckCircle2 className="size-3.5" />
                                                Completed
                                            </Badge>
                                        ) : null}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                                        {todo.description}
                                    </p>
                                </CardContent>
                                <CardFooter className="flex flex-wrap items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => openEditModal(todo)}
                                    >
                                        <PencilIcon className="size-4" />
                                        Edit
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={() => handleToggleComplete(todo)}>
                                        {todo.completedAt ? 'Mark active' : 'Mark completed'}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => handleDelete(todo)}
                                    >
                                        <Trash2Icon className="size-4" />
                                        Delete
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Modal
                open={isModalOpen}
                title={isEditing ? 'Edit todo' : 'New todo'}
                description="All fields are required."
                onClose={closeModal}
                footer={
                    <>
                        <Button type="button" variant="ghost" onClick={closeModal} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : isEditing ? 'Save changes' : 'Create todo'}
                        </Button>
                    </>
                }
            >
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={formValues.title}
                            onChange={(event) => handleFormChange('title', event.target.value)}
                            aria-invalid={Boolean(formErrors.title)}
                        />
                        {formErrors.title ? <p className="text-xs text-destructive">{formErrors.title}</p> : null}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formValues.description}
                            onChange={(event) => handleFormChange('description', event.target.value)}
                            aria-invalid={Boolean(formErrors.description)}
                            className="min-h-30"
                        />
                        {formErrors.description ? (
                            <p className="text-xs text-destructive">{formErrors.description}</p>
                        ) : null}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="dueDate">Due date</Label>
                        <Input
                            id="dueDate"
                            type="date"
                            value={formValues.dueDate}
                            onChange={(event) => handleFormChange('dueDate', event.target.value)}
                            aria-invalid={Boolean(formErrors.dueDate)}
                        />
                        {formErrors.dueDate ? <p className="text-xs text-destructive">{formErrors.dueDate}</p> : null}
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default App;
