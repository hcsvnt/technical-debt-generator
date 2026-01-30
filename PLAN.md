## Plan: Complete Todo App Implementation

Build a Bun + SQLite backend and a React/Tailwind/Shadcn UI with a grid of notes. Todos require `title`, `description`, `dueDate` (`YYYY-MM-DD`), `createdAt`, `updatedAt`, `completedAt`, and `deletedAt` (soft delete, hidden). The UI uses a reusable modal shell for add/edit, inline validation errors, delete confirmation, auto-close on save, server-side filtering, muted styling for completed items, and a green Shadcn `Badge` with an icon labeled “Completed” on each completed card. Filtering persists via query param and updates browser history. Sorting is incomplete first, then by `dueDate`, then `createdAt`.

### Steps

1. Add SQLite schema and migrations in build.ts with required fields, `completedAt`, `deletedAt`, and timestamps.
2. Add backend validation utilities for required fields and `YYYY-MM-DD` dates; ensure errors are structured for UI mapping.
3. Expose REST endpoints in build.ts for list/create/update/delete, filtering out soft-deleted items and supporting server-side filters.
4. Implement list sorting in build.ts: incomplete first, then `dueDate`, then `createdAt`.
5. Add date helpers in [src/lib/utils.ts](src/lib/utils.ts) to enforce `YYYY-MM-DD` input/output and required-field validation.
6. Create a reusable modal shell in [src/components/ui](src/components/ui) and compose required-field add/edit forms.
7. Build the grid UI in [src/App.tsx](src/App.tsx) with Shadcn cards/buttons/inputs, inline errors, auto-close on save, and delete confirmation.
8. Add completion toggles and UI state in [src/App.tsx](src/App.tsx), including muted styling and a green Shadcn `Badge` with icon labeled “Completed.”
9. Add a Shadcn `Select` filter in [src/App.tsx](src/App.tsx) tied to query params, passing filter values to the API and updating history.
10. Add empty/loading/error states for list fetches and an optimistic UI for completion toggles (with rollback on failure).

### Further Considerations
1. Ensure server validation errors map cleanly to inline UI error messages.
2. Add basic API error logging and safe defaults for missing query params.
