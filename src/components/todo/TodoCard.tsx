import { CheckCircle2, PencilIcon, Trash2Icon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Todo } from '@/types/todo';

const formatDisplayDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

type TodoCardProps = {
    todo: Todo;
    onEdit: (todo: Todo) => void;
    onToggleComplete: (todo: Todo) => void;
    onDelete: (todo: Todo) => void;
};

export function TodoCard({ todo, onEdit, onToggleComplete, onDelete }: TodoCardProps) {
    return (
        <Card className={cn(todo.completedAt ? 'opacity-70' : '')}>
            <CardHeader className="gap-2">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <CardTitle className="text-lg">{todo.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">Due {formatDisplayDate(todo.dueDate)}</p>
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
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{todo.description}</p>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => onEdit(todo)}>
                <PencilIcon className="size-4" />
                    Edit
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onToggleComplete(todo)}>
                    {todo.completedAt ? 'Mark active' : 'Mark completed'}
                </Button>
                <Button variant="destructive" size="sm" className="gap-2" onClick={() => onDelete(todo)}>
                    <Trash2Icon className="size-4" />
                    Delete
                </Button>
            </CardFooter>
        </Card>
    );
}
