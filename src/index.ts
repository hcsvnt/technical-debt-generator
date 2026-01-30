import { serve } from "bun";
import { Database } from "bun:sqlite";
import { mkdirSync } from "fs";
import path from "path";
import index from "./index.html";

type TodoRow = {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  deletedAt: string | null;
};

const dataDir = path.join(process.cwd(), "data");
mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "todos.sqlite");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    dueDate TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    completedAt TEXT,
    deletedAt TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_todos_deletedAt ON todos (deletedAt);
  CREATE INDEX IF NOT EXISTS idx_todos_completedAt ON todos (completedAt);
  CREATE INDEX IF NOT EXISTS idx_todos_dueDate ON todos (dueDate);
`);

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const isValidDateString = (value: string) => {
  if (!datePattern.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const json = (data: unknown, status = 200) => Response.json(data, { status });
const nowIso = () => new Date().toISOString();

const validateTodoPayload = (payload: Record<string, unknown>) => {
  const errors: Record<string, string> = {};
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const description = typeof payload.description === "string" ? payload.description.trim() : "";
  const dueDate = typeof payload.dueDate === "string" ? payload.dueDate.trim() : "";

  if (!title) {
    errors.title = "Title is required.";
  }

  if (!description) {
    errors.description = "Description is required.";
  }

  if (!dueDate) {
    errors.dueDate = "Due date is required.";
  } else if (!isValidDateString(dueDate)) {
    errors.dueDate = "Use YYYY-MM-DD.";
  }

  return { errors, title, description, dueDate };
};

const listTodos = (filter: string | null) => {
  const whereParts = ["deletedAt IS NULL"];
  if (filter === "active") whereParts.push("completedAt IS NULL");
  if (filter === "completed") whereParts.push("completedAt IS NOT NULL");
  const whereClause = whereParts.join(" AND ");
  const stmt = db.query(
    `SELECT * FROM todos WHERE ${whereClause} ORDER BY completedAt IS NOT NULL, dueDate ASC, createdAt ASC`,
  );
  return stmt.all() as TodoRow[];
};

const server = serve({
  routes: {
    "/api/todos": {
      async GET(req) {
        const url = new URL(req.url);
        const filter = url.searchParams.get("filter") ?? "all";
        const safeFilter = ["all", "active", "completed"].includes(filter) ? filter : "all";
        const todos = listTodos(safeFilter);
        return json({ data: todos });
      },
      async POST(req) {
        let payload: Record<string, unknown>;

        try {
          payload = (await req.json()) as Record<string, unknown>;
        } catch (error) {
          return json({ errors: { form: "Invalid JSON payload." } }, 400);
        }

        const { errors, title, description, dueDate } = validateTodoPayload(payload);
        if (Object.keys(errors).length) {
          return json({ errors }, 400);
        }

        const timestamp = nowIso();
        const stmt = db.query(
          `INSERT INTO todos (title, description, dueDate, createdAt, updatedAt, completedAt, deletedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`,
        );
        const todo = stmt.get(title, description, dueDate, timestamp, timestamp, null, null) as TodoRow;
        return json({ data: todo }, 201);
      },
    },

    "/api/todos/:id": {
      async PUT(req) {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
          return json({ errors: { form: "Invalid todo id." } }, 400);
        }

        let payload: Record<string, unknown>;
        try {
          payload = (await req.json()) as Record<string, unknown>;
        } catch (error) {
          return json({ errors: { form: "Invalid JSON payload." } }, 400);
        }

        const existing = db.query("SELECT * FROM todos WHERE id = ? AND deletedAt IS NULL").get(id) as
          | TodoRow
          | undefined;
        if (!existing) {
          return json({ errors: { form: "Todo not found." } }, 404);
        }

        const { errors, title, description, dueDate } = validateTodoPayload(payload);
        if (Object.keys(errors).length) {
          return json({ errors }, 400);
        }

        let completedAt = existing.completedAt;
        if (typeof payload.completed === "boolean") {
          completedAt = payload.completed ? nowIso() : null;
        } else if (payload.completedAt === null) {
          completedAt = null;
        }

        const updatedAt = nowIso();
        const stmt = db.query(
          `UPDATE todos
           SET title = ?, description = ?, dueDate = ?, completedAt = ?, updatedAt = ?
           WHERE id = ?
           RETURNING *`,
        );
        const todo = stmt.get(title, description, dueDate, completedAt, updatedAt, id) as TodoRow;
        return json({ data: todo });
      },
      async DELETE(req) {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
          return json({ errors: { form: "Invalid todo id." } }, 400);
        }

        const existing = db.query("SELECT * FROM todos WHERE id = ? AND deletedAt IS NULL").get(id) as
          | TodoRow
          | undefined;
        if (!existing) {
          return json({ errors: { form: "Todo not found." } }, 404);
        }

        db.query("UPDATE todos SET deletedAt = ?, updatedAt = ? WHERE id = ?").run(nowIso(), nowIso(), id);
        return json({ ok: true });
      },
    },

    // Serve index.html for all unmatched routes.
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
