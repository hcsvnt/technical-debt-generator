User: Please outline a plan to build a todo app which allows adding, editing and deleting todos. A todo consists of title, description, due date (just day, no time), date created (date, time), date last edited (date, time).
The main view is a grid of notes, a clicked note opens an edit modal.
The app will also need some add todo button which triggers an add todo modal, some deletion confirmation popup etc.
I don't need users, just one list for the whole app, so that whoever visits can add to the same list.
For storage please use a SQLite db.
This project uses bun, react, tailwind and shadcn.
Please refer to their documentation if you need more info, e.g. https://bun.com/docs is for bun.
Make good use of shacn components.



GitHub Copilot: Enable GPT-5.2-Codex for all clients
[object Object]

User: @agent Enable: "Enable GPT-5.2-Codex for all clients"

GitHub Copilot: Gather todo app context

Searched codebase for "todo app structure App.tsx frontend.tsx index.ts APITester.tsx components ui patterns routing api server db", 24 results

## Plan: SQLite-backed Todo App

Define the todo model and API, add SQLite persistence on the Bun server, then build a React UI with Shadcn-driven grid, modals, and confirmations. Wire the UI to the API with create/edit/delete flows and ensure the modal states map to the selected todo. This fits the existing Bun server and React app entry points.

### Steps 1. Add a todo schema and data access layer in build.ts using `Bun.sqlite` (table creation, CRUD, timestamps).
2. Expose REST endpoints in build.ts for list, create, update, delete with JSON payloads and validation.
3. Build the main grid UI in App.tsx using Shadcn `Card`, `Button`, and `Input` from ui.
4. Implement Add/Edit modals and Delete confirmation using Shadcn `Dialog` patterns (new components as needed under ui).
5. Wire client fetch logic and optimistic refresh in App.tsx, handling due-date formatting and updated timestamps.

### Further Considerations 1. Should due dates display as locale date or fixed format (e.g., YYYY-MM-DD)?
2. Do you want soft-delete (archived) or hard-delete from SQLite?
3. Prefer a single modal reused for add/edit, or separate components for clarity?

User: 1. yy-mm-dd
2. soft delete
3. I think the outer layer of the modal can most likely be reused and take appropriate forms as children

GitHub Copilot: Confirm workspace context

Searched codebase for "App.tsx build.ts modal reuse soft delete due date format planning integration points", 24 results

## Plan: SQLite Todo App Updates

Update the plan to reflect the chosen date format, soft-delete behavior, and a reusable modal shell. This will keep server storage consistent (with a `deletedAt` field), unify modal UX across add/edit flows, and ensure due dates stay in `YYYY-MM-DD` throughout input and display.

### Steps 1. Add `deletedAt` to the SQLite schema and CRUD in build.ts, filtering it out by default.
2. Define `YYYY-MM-DD` formatting helpers in utils.ts and use them in UI render and form defaults.
3. Create a reusable modal shell in ui and compose add/edit forms as children.
4. Update grid and modals in App.tsx to use the shared modal and soft-delete actions.
5. Add optional “Restore” action and visual state for soft-deleted items in App.tsx.

### Further Considerations 1. Should soft-deleted items be hidden entirely, or shown in a separate “Trash” section?
2. Do you want an “Undo delete” toast after soft delete?
3. Should due date display always as `YYYY-MM-DD`, or in a more human-friendly format while keeping input as `YYYY-MM-DD`?

User: 1. hidden
2. no undo
3. always

GitHub Copilot: Confirm context for final plan

Searched codebase for "PLAN.md plan TODO roadmap", 24 results

## Plan: Todo App with Hidden Soft-Delete

Implement SQLite-backed todos with `deletedAt` soft delete (hidden by default), a reusable modal shell for add/edit forms, and consistent `YYYY-MM-DD` due dates across input and display. This integrates with the existing Bun server and React app, while using Shadcn components for cards, dialogs, and buttons.

### Steps 1. Add `deletedAt` to the SQLite schema and CRUD in build.ts, filtering it out in list/read endpoints.
2. Define `YYYY-MM-DD` date helpers in utils.ts and use them for due date input/output.
3. Create a reusable modal shell component in ui and compose add/edit forms as children.
4. Build the grid UI in App.tsx with Shadcn cards and wire add/edit/delete modals.
5. Ensure delete is soft and hidden (no undo, no trash view) in App.tsx.

### Further Considerations 1. Do you want server-side validation errors surfaced inline on the form?
2. Should the modal close on successful save or remain open for quick edits?

User: summarise this conversation into a single comprehensive plan for implementing the app

GitHub Copilot: ## Plan: End-to-End Todo App Implementation

Build a Bun + SQLite backend for persistent todos, then implement a React/Tailwind/Shadcn UI with a grid of notes and reusable modal shell for add/edit/delete flows. Todos store `title`, `description`, `dueDate` (`YYYY-MM-DD`), `createdAt`, `updatedAt`, and `deletedAt` for soft delete (hidden from views). The UI always displays due dates as `YYYY-MM-DD`, and deletions are final (no undo, no trash view).

### Steps 1. Add SQLite schema and CRUD layer in build.ts with `deletedAt` soft delete and timestamp management.
2. Expose REST endpoints in build.ts for list/create/update/delete, filtering out `deletedAt` records.
3. Add date helpers in utils.ts to enforce `YYYY-MM-DD` input/output.
4. Create a reusable modal shell in ui, then compose add/edit forms as children.
5. Build the grid UI and wire API calls in App.tsx using Shadcn cards, buttons, inputs, and dialogs, including delete confirmation.

### Further Considerations 1. Should validation errors display inline or as a top-level alert?
2. Should modals auto-close on successful save?

User: 1. inline
2. auto

GitHub Copilot: ## Plan: End-to-End Todo App Implementation

Implement a Bun + SQLite backend for persistent todos and a React/Tailwind/Shadcn UI that presents a grid of notes. Todos store `title`, `description`, `dueDate` (`YYYY-MM-DD`), `createdAt`, `updatedAt`, and `deletedAt` for soft delete (hidden from views). The UI always shows due dates as `YYYY-MM-DD`, uses a reusable modal shell for add/edit, includes a delete confirmation popup, shows validation errors inline, and auto-closes modals on successful save.

### Steps 1. Add SQLite schema and CRUD in build.ts with `deletedAt` soft delete and timestamp handling.
2. Expose REST endpoints in build.ts for list/create/update/delete, filtering out `deletedAt` items.
3. Add date helpers in utils.ts to enforce `YYYY-MM-DD` input/output.
4. Create a reusable modal shell in ui and compose add/edit forms as children.
5. Build the grid UI and wire API calls in App.tsx using Shadcn components, inline validation, and auto-close on save.

### Further Considerations 1. Should title or due date be required, or allow empty values?
2. Do you want pagination or infinite scroll for large lists?

User: 1. every field is required
2. no pagination, no infinte scroll, I want all the items in one view

GitHub Copilot: ## Plan: End-to-End Todo App Implementation

Implement a Bun + SQLite backend and a React/Tailwind/Shadcn UI with a grid of notes. Todos store `title`, `description`, `dueDate` (`YYYY-MM-DD`), `createdAt`, `updatedAt`, and `deletedAt` for hidden soft delete. All fields are required. The UI uses a reusable modal shell for add/edit, inline validation errors, delete confirmation, auto-close on save, and displays all items in one view (no pagination).

### Steps 1. Add SQLite schema and CRUD in build.ts with required fields, `deletedAt`, and timestamps.
2. Expose REST endpoints in build.ts for list/create/update/delete, filtering out `deletedAt` items.
3. Add `YYYY-MM-DD` helpers in utils.ts and enforce required fields server-side.
4. Create a reusable modal shell in ui and compose required-field add/edit forms.
5. Build the grid UI and wire API calls in App.tsx using Shadcn components, inline validation, auto-close on save, and full-list rendering.

### Further Considerations 1. Should the delete confirmation require typing the title to confirm?
2. Do you want sorting (e.g., by due date or last edited) in the single view?

User: 1. no
2. by due date

GitHub Copilot: ## Plan: End-to-End Todo App Implementation

Implement a Bun + SQLite backend and a React/Tailwind/Shadcn UI with a grid of notes. Todos store `title`, `description`, `dueDate` (`YYYY-MM-DD`), `createdAt`, `updatedAt`, and `deletedAt` for hidden soft delete. All fields are required. The UI uses a reusable modal shell for add/edit, inline validation errors, delete confirmation (no typed confirmation), auto-close on save, and displays all items sorted by due date.

### Steps 1. Add SQLite schema and CRUD in build.ts with required fields, `deletedAt`, and timestamps.
2. Expose REST endpoints in build.ts for list/create/update/delete, filtering out `deletedAt` items and sorting by `dueDate`.
3. Add `YYYY-MM-DD` helpers in utils.ts and enforce required fields server-side.
4. Create a reusable modal shell in ui and compose required-field add/edit forms.
5. Build the grid UI and wire API calls in App.tsx using Shadcn components, inline validation, auto-close on save, and due-date ordering.

### Further Considerations 1. Should items with the same due date be sorted by `updatedAt` or `createdAt`?

User: 1. created

GitHub Copilot: ## Plan: End-to-End Todo App Implementation

Implement a Bun + SQLite backend and a React/Tailwind/Shadcn UI with a grid of notes. Todos store `title`, `description`, `dueDate` (`YYYY-MM-DD`), `createdAt`, `updatedAt`, and `deletedAt` for hidden soft delete. All fields are required. The UI uses a reusable modal shell for add/edit, inline validation errors, delete confirmation (no typed confirmation), auto-close on save, and displays all items sorted by due date then `createdAt`.

### Steps 1. Add SQLite schema and CRUD in build.ts with required fields, `deletedAt`, and timestamps.
2. Expose REST endpoints in build.ts for list/create/update/delete, filtering out `deletedAt` items and sorting by `dueDate`, then `createdAt`.
3. Add `YYYY-MM-DD` helpers in utils.ts and enforce required fields server-side.
4. Create a reusable modal shell in ui and compose required-field add/edit forms.
5. Build the grid UI and wire API calls in App.tsx using Shadcn components, inline validation, auto-close on save, and due-date ordering.

### Further Considerations 1. Do you want a “completed” status, or only active todos?

User: oh yeah, user should be able to complete a todo, then it should be moved to the bottom of the list.
also please add a filtering option in the view

GitHub Copilot: Update plan context

Searched codebase for "filtering filter complete completion autocomplete search results list query input select options debounce", 24 results

## Plan: Todo App with Completion + Filtering

Extend the Bun + SQLite backend and React/Shadcn UI to support a completion state, keep completed todos at the bottom, and add a filtering control. Todos store `title`, `description`, `dueDate` (`YYYY-MM-DD`), `createdAt`, `updatedAt`, `completedAt`, and `deletedAt` for hidden soft delete. All fields are required. The UI uses a reusable modal shell for add/edit, inline validation errors, delete confirmation, auto-close on save, and a filter dropdown. Sorting is by due date then `createdAt`, with incomplete items first.

### Steps 1. Update SQLite schema and CRUD in build.ts to add `completedAt` and required-field validation.
2. Adjust list query in build.ts to sort incomplete first, then by `dueDate`, then `createdAt`.
3. Add a filter state and control using `Select` in App.tsx (All / Active / Completed).
4. Add complete/uncomplete actions in App.tsx that toggle `completedAt` and refresh the list.
5. Keep the reusable modal shell in ui, and ensure edit/add forms enforce required fields.

### Further Considerations 1. Should completed items be visually muted or collapsed to a smaller card style?
2. Should filtering be client-side or server-side for scalability?

User: 1. muted
2. server side

GitHub Copilot: Reconfirm context

Read changed files in the active git repository

## Plan: Todo App with Completion + Server-Side Filtering

Extend the Bun + SQLite backend and React/Shadcn UI to support completion state, server-side filtering, and muted styling for completed items. Todos store `title`, `description`, `dueDate` (`YYYY-MM-DD`), `createdAt`, `updatedAt`, `completedAt`, and `deletedAt` for hidden soft delete. All fields are required. The UI uses a reusable modal shell for add/edit, inline validation errors, delete confirmation, auto-close on save, and a server-backed filter dropdown. Sorting is incomplete first, then by due date and `createdAt`, with completed todos muted at the bottom.

### Steps 1. Update SQLite schema and CRUD in build.ts to add `completedAt`, required-field validation, and soft delete.
2. Implement list endpoint in build.ts with server-side filtering (All/Active/Completed) and sorting: incomplete first, then `dueDate`, then `createdAt`.
3. Add filter state and `Select` control in App.tsx that passes filter to the API.
4. Add complete/uncomplete actions in App.tsx that toggle `completedAt`, refresh, and apply muted styling.
5. Keep reusable modal shell and required-field forms in ui, with inline validation and auto-close on save.

### Further Considerations 1. Should completed items show a check icon or badge for clarity?
2. Should filter choice persist across refresh (e.g., query param or local storage)?

User: 1. yes 2. query param

GitHub Copilot: Confirm context

Read changed files in the active git repository

## Plan: Todo App with Completion + Server-Side Filtering

Implement a Bun + SQLite backend and a React/Shadcn UI with a grid of notes. Todos store `title`, `description`, `dueDate` (`YYYY-MM-DD`), `createdAt`, `updatedAt`, `completedAt`, and `deletedAt` for hidden soft delete. All fields are required. The UI uses a reusable modal shell for add/edit, inline validation errors, delete confirmation, auto-close on save, server-side filtering, muted styling for completed items, and a completion badge/icon. Filtering persists via query param.

### Steps 1. Update SQLite schema and CRUD in build.ts to add `completedAt`, required-field validation, and soft delete.
2. Implement list endpoint in build.ts with server-side filtering (All/Active/Completed) and sorting: incomplete first, then `dueDate`, then `createdAt`.
3. Add filter state tied to query params in App.tsx, and pass filter to the API.
4. Add complete/uncomplete actions in App.tsx that toggle `completedAt`, refresh, and apply muted styling plus a completion badge/icon.
5. Keep reusable modal shell and required-field forms in ui, with inline validation and auto-close on save.

### Further Considerations 1. Should query param changes update the browser history or replace the current state?
2. Do you want a default filter (e.g., Active) on first load?

User: 1. update
2. no

GitHub Copilot: ## Plan: Todo App with Completion + Server-Side Filtering

Implement a Bun + SQLite backend and a React/Shadcn UI with a grid of notes. Todos store `title`, `description`, `dueDate` (`YYYY-MM-DD`), `createdAt`, `updatedAt`, `completedAt`, and `deletedAt` for hidden soft delete. All fields are required. The UI uses a reusable modal shell for add/edit, inline validation errors, delete confirmation, auto-close on save, server-side filtering, muted styling for completed items, and a completion badge/icon. Filtering persists via query param and updates browser history.

### Steps 1. Update SQLite schema and CRUD in build.ts to add `completedAt`, required-field validation, and soft delete.
2. Implement list endpoint in build.ts with server-side filtering (All/Active/Completed) and sorting: incomplete first, then `dueDate`, then `createdAt`.
3. Add filter state tied to query params in App.tsx, updating browser history and passing filter to the API.
4. Add complete/uncomplete actions in App.tsx that toggle `completedAt`, refresh, and apply muted styling plus a completion badge/icon.
5. Keep reusable modal shell and required-field forms in ui, with inline validation and auto-close on save.

### Further Considerations 1. Should the completion badge/icon be shown on the card or in the modal header?

User: 1. card

GitHub Copilot: ## Plan: Todo App with Completion + Server-Side Filtering

Implement a Bun + SQLite backend and a React/Shadcn UI with a grid of notes. Todos store `title`, `description`, `dueDate` (`YYYY-MM-DD`), `createdAt`, `updatedAt`, `completedAt`, and `deletedAt` for hidden soft delete. All fields are required. The UI uses a reusable modal shell for add/edit, inline validation errors, delete confirmation, auto-close on save, server-side filtering, muted styling for completed items, and a completion badge/icon on the card. Filtering persists via query param and updates browser history.

### Steps 1. Update SQLite schema and CRUD in build.ts to add `completedAt`, required-field validation, and soft delete.
2. Implement list endpoint in build.ts with server-side filtering (All/Active/Completed) and sorting: incomplete first, then `dueDate`, then `createdAt`.
3. Add filter state tied to query params in App.tsx, updating browser history and passing filter to the API.
4. Add complete/uncomplete actions in App.tsx that toggle `completedAt`, refresh, and apply muted styling plus a completion badge/icon on the card.
5. Keep reusable modal shell and required-field forms in ui, with inline validation and auto-close on save.

### Further Considerations 1. Should the completion badge/icon also appear in the grid header legend for clarity?

User: 1. no, make it nice and green and say comleted, it's self explanatory

GitHub Copilot: ## Plan: Todo App with Completion + Server-Side Filtering

Implement a Bun + SQLite backend and a React/Shadcn UI with a grid of notes. Todos store `title`, `description`, `dueDate` (`YYYY-MM-DD`), `createdAt`, `updatedAt`, `completedAt`, and `deletedAt` for hidden soft delete. All fields are required. The UI uses a reusable modal shell for add/edit, inline validation errors, delete confirmation, auto-close on save, server-side filtering, muted styling for completed items, and a green “Completed” badge on the card. Filtering persists via query param and updates browser history.

### Steps 1. Update SQLite schema and CRUD in build.ts to add `completedAt`, required-field validation, and soft delete.
2. Implement list endpoint in build.ts with server-side filtering (All/Active/Completed) and sorting: incomplete first, then `dueDate`, then `createdAt`.
3. Add filter state tied to query params in App.tsx, updating browser history and passing filter to the API.
4. Add complete/uncomplete actions in App.tsx that toggle `completedAt`, refresh, and apply muted styling plus a green “Completed” badge on the card.
5. Keep reusable modal shell and required-field forms in ui, with inline validation and auto-close on save.

### Further Considerations 1. Should the “Completed” badge be text-only or include an icon?

User: both

GitHub Copilot: ## Plan: Todo App with Completion + Server-Side Filtering

Implement a Bun + SQLite backend and a React/Shadcn UI with a grid of notes. Todos store `title`, `description`, `dueDate` (`YYYY-MM-DD`), `createdAt`, `updatedAt`, `completedAt`, and `deletedAt` for hidden soft delete. All fields are required. The UI uses a reusable modal shell for add/edit, inline validation errors, delete confirmation, auto-close on save, server-side filtering, muted styling for completed items, and a green “Completed” badge with an icon on the card. Filtering persists via query param and updates browser history.

### Steps 1. Update SQLite schema and CRUD in build.ts to add `completedAt`, required-field validation, and soft delete.
2. Implement list endpoint in build.ts with server-side filtering (All/Active/Completed) and sorting: incomplete first, then `dueDate`, then `createdAt`.
3. Add filter state tied to query params in App.tsx, updating browser history and passing filter to the API.
4. Add complete/uncomplete actions in App.tsx that toggle `completedAt`, refresh, and apply muted styling plus a green “Completed” badge with icon on the card.
5. Keep reusable modal shell and required-field forms in ui, with inline validation and auto-close on save.

### Further Considerations 1. Should the “Completed” badge use a Shadcn `Badge` component or a custom-styled `span`?

User: shadcn badge, these questions start getting too specific and not too important, you can make your own choices

GitHub Copilot: ## Plan: Todo App with Completion + Server-Side Filtering

Implement a Bun + SQLite backend and a React/Shadcn UI with a grid of notes. Todos store `title`, `description`, `dueDate` (`YYYY-MM-DD`), `createdAt`, `updatedAt`, `completedAt`, and `deletedAt` for hidden soft delete. All fields are required. The UI uses a reusable modal shell for add/edit, inline validation errors, delete confirmation, auto-close on save, server-side filtering, muted styling for completed items, and a green Shadcn `Badge` with icon labeled “Completed” on the card. Filtering persists via query param and updates browser history.

### Steps 1. Update SQLite schema and CRUD in build.ts to add `completedAt`, required-field validation, and soft delete.
2. Implement list endpoint in build.ts with server-side filtering (All/Active/Completed) and sorting: incomplete first, then `dueDate`, then `createdAt`.
3. Add filter state tied to query params in App.tsx, updating browser history and passing filter to the API.
4. Add complete/uncomplete actions in App.tsx that toggle `completedAt`, refresh, and apply muted styling plus a green Shadcn `Badge` with icon on the card.
5. Keep reusable modal shell and required-field forms in ui, with inline validation and auto-close on save.

### Further Considerations 1. Ensure consistent error handling between server validation and inline UI messages.

User: summarise this conversation into a single comprehensive plan for implementing the app

GitHub Copilot: ## Plan: Complete Todo App Implementation

Build a Bun + SQLite backend and a React/Tailwind/Shadcn UI with a grid of notes. Todos require `title`, `description`, `dueDate` (`YYYY-MM-DD`), `createdAt`, `updatedAt`, `completedAt`, and `deletedAt` (soft delete, hidden). The UI uses a reusable modal shell for add/edit, inline validation errors, delete confirmation, auto-close on save, server-side filtering, muted styling for completed items, and a green Shadcn `Badge` with an icon labeled “Completed” on each completed card. Filtering persists via query param and updates browser history. Sorting is incomplete first, then by `dueDate`, then `createdAt`.

### Steps 1. Add SQLite schema and CRUD in build.ts with required fields, `completedAt`, `deletedAt`, and timestamps.
2. Expose REST endpoints in build.ts for list/create/update/delete, filtering out soft-deleted items and supporting server-side filters.
3. Implement list sorting in build.ts: incomplete first, then `dueDate`, then `createdAt`.
4. Add date helpers in utils.ts to enforce `YYYY-MM-DD` input/output and required-field validation.
5. Create a reusable modal shell in ui and compose required-field add/edit forms.
6. Build the grid UI in App.tsx with Shadcn cards/buttons/inputs, inline errors, auto-close on save, and delete confirmation.
7. Add completion toggles and UI state in App.tsx, including muted styling and a green Shadcn `Badge` with icon labeled “Completed.”
8. Add a Shadcn `Select` filter in App.tsx tied to query params, passing filter values to the API and updating history.

### Further Considerations 1. Ensure server validation errors map cleanly to inline UI error messages.

User: ok

GitHub Copilot: ## Plan: Complete Todo App Implementation

Build a Bun + SQLite backend and a React/Tailwind/Shadcn UI with a grid of notes. Todos require `title`, `description`, `dueDate` (`YYYY-MM-DD`), `createdAt`, `updatedAt`, `completedAt`, and `deletedAt` (soft delete, hidden). The UI uses a reusable modal shell for add/edit, inline validation errors, delete confirmation, auto-close on save, server-side filtering, muted styling for completed items, and a green Shadcn `Badge` with an icon labeled “Completed” on each completed card. Filtering persists via query param and updates browser history. Sorting is incomplete first, then by `dueDate`, then `createdAt`.

### Steps 1. Add SQLite schema and CRUD in build.ts with required fields, `completedAt`, `deletedAt`, and timestamps.
2. Expose REST endpoints in build.ts for list/create/update/delete, filtering out soft-deleted items and supporting server-side filters.
3. Implement list sorting in build.ts: incomplete first, then `dueDate`, then `createdAt`.
4. Add date helpers in utils.ts to enforce `YYYY-MM-DD` input/output and required-field validation.
5. Create a reusable modal shell in ui and compose required-field add/edit forms.
6. Build the grid UI in App.tsx with Shadcn cards/buttons/inputs, inline errors, auto-close on save, and delete confirmation.
7. Add completion toggles and UI state in App.tsx, including muted styling and a green Shadcn `Badge` with icon labeled “Completed.”
8. Add a Shadcn `Select` filter in App.tsx tied to query params, passing filter values to the API and updating history.

### Further Considerations 1. Ensure server validation errors map cleanly to inline UI error messages.

User: ok save this plan to #file:PLAN.md

GitHub Copilot: I can’t edit files with the current tools. If you enable editing, I’ll save it to PLAN.md. For now, here’s the exact plan content to paste into PLAN.md:

## Plan: Complete Todo App Implementation

Build a Bun + SQLite backend and a React/Tailwind/Shadcn UI with a grid of notes. Todos require `title`, `description`, `dueDate` (`YYYY-MM-DD`), `createdAt`, `updatedAt`, `completedAt`, and `deletedAt` (soft delete, hidden). The UI uses a reusable modal shell for add/edit, inline validation errors, delete confirmation, auto-close on save, server-side filtering, muted styling for completed items, and a green Shadcn `Badge` with an icon labeled “Completed” on each completed card. Filtering persists via query param and updates browser history. Sorting is incomplete first, then by `dueDate`, then `createdAt`.

### Steps 1. Add SQLite schema and CRUD in build.ts with required fields, `completedAt`, `deletedAt`, and timestamps.
2. Expose REST endpoints in build.ts for list/create/update/delete, filtering out soft-deleted items and supporting server-side filters.
3. Implement list sorting in build.ts: incomplete first, then `dueDate`, then `createdAt`.
4. Add date helpers in utils.ts to enforce `YYYY-MM-DD` input/output and required-field validation.
5. Create a reusable modal shell in ui and compose required-field add/edit forms.
6. Build the grid UI in App.tsx with Shadcn cards/buttons/inputs, inline errors, auto-close on save, and delete confirmation.
7. Add completion toggles and UI state in App.tsx, including muted styling and a green Shadcn `Badge` with icon labeled “Completed.”
8. Add a Shadcn `Select` filter in App.tsx tied to query params, passing filter values to the API and updating history.

### Further Considerations 1. Ensure server validation errors map cleanly to inline UI error messages.
