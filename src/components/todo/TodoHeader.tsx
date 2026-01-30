import { PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TodoFilter } from '@/types/todo';

type TodoHeaderProps = {
    filter: TodoFilter;
    onFilterChange: (value: TodoFilter) => void;
    onNewTodo: () => void;
};

export function TodoHeader({ filter, onFilterChange, onNewTodo }: TodoHeaderProps) {
    return (
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Todo Notes</p>
                <h1 className="text-3xl font-bold text-foreground">Stay on track</h1>
                <p className="text-muted-foreground mt-1 text-sm">Capture work, track deadlines, and finish fast.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <Select value={filter} onValueChange={(value) => onFilterChange(value as TodoFilter)}>
                    <SelectTrigger className="min-w-40" aria-label="Filter todos">
                        <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent align="end">
                        <SelectItem value="all">All todos</SelectItem>
                        <SelectItem value="active">Active only</SelectItem>
                        <SelectItem value="completed">Completed only</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={onNewTodo} className="gap-2">
                    <PlusIcon className="size-4" />
                    New todo
                </Button>
            </div>
        </header>
    );
}
