# Architecture

## Summary
The app uses a Bun server with SQLite for persistence and a React/Tailwind/Shadcn frontend. The backend exposes REST endpoints with validation and sorting; the frontend fetches data, manages modals, and reflects validation inline.

## System Diagram (Text)
- Client (React UI)
  - Fetches todos via REST
  - Manages filters via URL query params
  - Renders grid of cards and modals
- Server (Bun)
  - REST endpoints for list/create/update/delete
  - Validates input
  - Applies sorting and filtering
  - Uses SQLite for storage
- Database (SQLite)
  - `todos` table with timestamps and soft-delete fields

## Backend
- Entry point: build.ts
- Responsibilities:
  - Initialize SQLite schema/migrations
  - Expose REST endpoints
  - Validate input
  - Apply sorting/filtering
  - Soft delete and completion timestamps

## Frontend
- Entry point: [src/App.tsx](src/App.tsx)
- Responsibilities:
  - Fetch and render todos
  - Modal workflows for add/edit
  - Inline validation errors
  - URL-based filtering
  - Completion toggles with optimistic UI

## Data Model
- `Todo`
  - `id`: number
  - `title`: string
  - `description`: string
  - `dueDate`: string (`YYYY-MM-DD`)
  - `createdAt`: string (ISO)
  - `updatedAt`: string (ISO)
  - `completedAt`: string | null
  - `deletedAt`: string | null

## API Endpoints
- `GET /api/todos?filter=all|active|completed`
- `POST /api/todos`
- `PUT /api/todos/:id`
- `DELETE /api/todos/:id`

## Validation Strategy
- Server-side validation for required fields and date format.
- Structured error payloads to map to UI fields.
- Frontend validates required fields before submit; server remains source of truth.

## Sorting and Filtering
- Sort: incomplete first, then `dueDate`, then `createdAt`.
- Filter: exclude `deletedAt` records; optional completion state filter.

## Error Handling
- Backend returns 4xx with field-level error payload.
- UI displays inline errors and global message on network failure.

## Security/Privacy
- Single-user, no authentication.
- No PII beyond todo text.

## Deployment
- Local Bun process serving API and static frontend assets.
`
