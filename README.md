# Todo Notes

A single-user todo app. Bun server, SQLite via Drizzle, React 19 front end —
all served from one process.

```bash
bun install
bun run dev     # http://localhost:3000
```

| | |
|---|---|
| Technical documentation | [`docs/`](docs/) |
| Product requirements | [`PRD.md`](PRD.md) |
| Scripts, migrations, tests | [`docs/development.md`](docs/development.md) |

```
apps/server/     Bun.serve routes, Drizzle, migrations
apps/web/        React, TanStack Query, react-hook-form, shadcn
packages/shared/ Zod schemas shared by both
```
