# PRD: Todo Notes App

## Overview
A lightweight notes-style todo app with Bun + SQLite backend and a React/Tailwind/Shadcn UI. Users can create, update, complete, filter, and soft-delete todos. The UI emphasizes clarity, speed, and consistent validation feedback.

## Goals
- Provide a fast CRUD workflow for todos.
- Ensure consistent validation and error feedback.
- Allow filtering and sorting with predictable behavior.
- Keep completed items visible but visually muted.

## Non-Goals
- User authentication or multi-user access.
- Collaboration or real-time updates.
- Recurring tasks or reminders.

## Users
- Single-user local workflow.

## Functional Requirements
- Create a todo with required `title`, `description`, and `dueDate` in `YYYY-MM-DD`.
- Edit any todo fields.
- Mark todos complete/incomplete via toggle.
- Soft delete todos; deleted items are excluded from lists.
- List sorting: incomplete first, then by `dueDate`, then `createdAt`.
- Filter by completion state (all, active, completed) via query param.
- Validation errors are returned by the API and shown inline in the UI.
- Add/edit modal auto-closes after a successful save.
- Delete requires confirmation.

## UX Requirements
- Grid of cards for todos.
- Muted styling for completed items.
- Green Shadcn `Badge` with icon and label “Completed” on completed cards.
- Form inputs show inline validation errors.
- Filter selection persists in the URL and updates browser history.

## Data Requirements
- Fields: `id`, `title`, `description`, `dueDate`, `createdAt`, `updatedAt`, `completedAt`, `deletedAt`.
- `completedAt` and `deletedAt` are nullable.
- `createdAt` and `updatedAt` are set server-side.

## API Requirements
- List: supports filters and sorting, excludes soft-deleted.
- Create: validates required fields and date format.
- Update: validates updated fields and toggles `completedAt`.
- Delete: sets `deletedAt` (soft delete).
- Errors: structured for direct inline field mapping.

## Success Metrics
- CRUD actions complete without validation surprises.
- Filter state persists across refresh and navigation.
- Sorting matches the defined order consistently.

## Risks
- Inconsistent date handling between UI and backend.
- UI and API error mapping drift.

## Open Questions
- None.
