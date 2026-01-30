import { useCallback, useState } from 'react';

import type { TodoFilter } from '@/types/todo';

const DEFAULT_FILTER: TodoFilter = 'all';
const allowedFilters = new Set<TodoFilter>(['all', 'active', 'completed']);

const getFilterFromUrl = (): TodoFilter => {
    if (typeof window === 'undefined') return DEFAULT_FILTER;
    const params = new URLSearchParams(window.location.search);
    const paramFilter = params.get('filter');
    if (paramFilter && allowedFilters.has(paramFilter as TodoFilter)) {
        return paramFilter as TodoFilter;
    }
    return DEFAULT_FILTER;
};

export function useTodoFilter() {
    const [filter, setFilter] = useState<TodoFilter>(() => getFilterFromUrl());

    const updateFilter = useCallback((value: TodoFilter) => {
        setFilter(value);
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        if (value === 'all') {
            params.delete('filter');
        } else {
            params.set('filter', value);
        }
        const newUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
        window.history.pushState({}, '', newUrl);
    }, []);

    return { filter, updateFilter };
}
