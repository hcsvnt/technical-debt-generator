import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import type { TodoFormValues } from '@/types/todo';
import type { TodoFieldErrors } from '@/lib/utils';

type TodoModalProps = {
    open: boolean;
    isEditing: boolean;
    isSaving: boolean;
    formValues: TodoFormValues;
    formErrors: TodoFieldErrors;
    onClose: () => void;
    onSave: () => void;
    onChange: (field: keyof TodoFormValues, value: string) => void;
};

export function TodoModal({
    open,
    isEditing,
    isSaving,
    formValues,
    formErrors,
    onClose,
    onSave,
    onChange,
}: TodoModalProps) {
    return (
        <Modal
            open={open}
            title={isEditing ? 'Edit todo' : 'New todo'}
            description="All fields are required."
            onClose={onClose}
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={onSave} disabled={isSaving}>
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
                        onChange={(event) => onChange('title', event.target.value)}
                        aria-invalid={Boolean(formErrors.title)}
                    />
                    {formErrors.title ? <p className="text-xs text-destructive">{formErrors.title}</p> : null}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={formValues.description}
                        onChange={(event) => onChange('description', event.target.value)}
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
                        onChange={(event) => onChange('dueDate', event.target.value)}
                        aria-invalid={Boolean(formErrors.dueDate)}
                    />
                    {formErrors.dueDate ? <p className="text-xs text-destructive">{formErrors.dueDate}</p> : null}
                </div>
            </div>
        </Modal>
    );
}
