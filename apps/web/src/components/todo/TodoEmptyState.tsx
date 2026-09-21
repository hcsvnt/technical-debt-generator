import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type TodoEmptyStateProps = {
    loading: boolean;
    error: string | null;
    message: string;
};

export function TodoEmptyState({ loading, error, message }: TodoEmptyStateProps) {
    return (
        <Card className={cn('border-dashed', error ? 'border-destructive' : '')}>
            <CardHeader>
                <CardTitle className="text-lg">{loading ? 'Loading' : error ? 'Error' : 'Nothing here'}</CardTitle>
                <CardDescription>{message}</CardDescription>
            </CardHeader>
        </Card>
    );
}
