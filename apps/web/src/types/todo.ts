export type Todo = {
    id: number;
    title: string;
    description: string;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
    completedAt: string | null;
    deletedAt: string | null;
};

export type TodoFormValues = {
    title: string;
    description: string;
    dueDate: string;
};

export type TodoFilter = 'all' | 'active' | 'completed';

export type ApiErrorResponse = { errors?: Record<string, string> };
