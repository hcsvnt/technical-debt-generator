import { and, asc, eq, isNotNull, isNull, sql } from "drizzle-orm";

import {
  todoFilterSchema,
  todoUpdateSchema,
  toTodoErrors,
  type TodoErrors,
  type TodoFilter,
} from "@todo/shared";

import type { Db } from "../db/client";
import { todos } from "../db/schema";

const json = (data: unknown, status = 200) => Response.json(data, { status });
const fail = (errors: TodoErrors, status: number) => json({ errors }, status);
const nowIso = () => new Date().toISOString();

/**
 * Incomplete first, then by due date, then by insertion order.
 *
 * `completedAt IS NOT NULL` sorts false (0) before true (1), which is what
 * puts outstanding work at the top.
 */
const LIST_ORDER = [
  sql`${todos.completedAt} IS NOT NULL`,
  asc(todos.dueDate),
  asc(todos.createdAt),
];

const visible = isNull(todos.deletedAt);

const filterClause = (filter: TodoFilter) => {
  if (filter === "active") return and(visible, isNull(todos.completedAt));
  if (filter === "completed") return and(visible, isNotNull(todos.completedAt));
  return visible;
};

async function readJson(req: Request): Promise<unknown | undefined> {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}

/** Parses `:id`. Rejects floats and empty strings, which Number.isFinite let through. */
function parseId(raw: string | undefined): number | undefined {
  const id = Number(raw);
  return raw !== undefined && raw !== "" && Number.isInteger(id) && id > 0 ? id : undefined;
}

export function createTodoRoutes(db: Db) {
  const findVisible = (id: number) =>
    db.select().from(todos).where(and(eq(todos.id, id), visible)).get();

  return {
    list(req: Request) {
      const url = new URL(req.url);
      // `.catch("all")` on the schema means a junk filter degrades rather than 400s.
      const filter = todoFilterSchema.parse(url.searchParams.get("filter") ?? "all");
      const data = db.select().from(todos).where(filterClause(filter)).orderBy(...LIST_ORDER).all();
      return json({ data });
    },

    async create(req: Request) {
      const payload = await readJson(req);
      if (payload === undefined) return fail({ form: "Invalid JSON payload." }, 400);

      const parsed = todoUpdateSchema.safeParse(payload);
      if (!parsed.success) return fail(toTodoErrors(parsed.error), 400);

      const timestamp = nowIso();
      const data = db
        .insert(todos)
        .values({
          title: parsed.data.title,
          description: parsed.data.description,
          dueDate: parsed.data.dueDate,
          createdAt: timestamp,
          updatedAt: timestamp,
          completedAt: parsed.data.completed ? timestamp : null,
          deletedAt: null,
        })
        .returning()
        .get();

      return json({ data }, 201);
    },

    async update(req: Request & { params: { id: string } }) {
      const id = parseId(req.params.id);
      if (id === undefined) return fail({ form: "Invalid todo id." }, 400);

      const payload = await readJson(req);
      if (payload === undefined) return fail({ form: "Invalid JSON payload." }, 400);

      const parsed = todoUpdateSchema.safeParse(payload);
      if (!parsed.success) return fail(toTodoErrors(parsed.error), 400);

      // Read and write together so a concurrent delete cannot slip between them.
      const data = db.transaction((tx) => {
        const existing = tx.select().from(todos).where(and(eq(todos.id, id), visible)).get();
        if (!existing) return undefined;

        const completedAt =
          parsed.data.completed === undefined
            ? existing.completedAt
            : parsed.data.completed
              ? (existing.completedAt ?? nowIso())
              : null;

        return tx
          .update(todos)
          .set({
            title: parsed.data.title,
            description: parsed.data.description,
            dueDate: parsed.data.dueDate,
            completedAt,
            updatedAt: nowIso(),
          })
          .where(eq(todos.id, id))
          .returning()
          .get();
      });

      if (!data) return fail({ form: "Todo not found." }, 404);
      return json({ data });
    },

    remove(req: Request & { params: { id: string } }) {
      const id = parseId(req.params.id);
      if (id === undefined) return fail({ form: "Invalid todo id." }, 400);

      const deleted = db.transaction((tx) => {
        const existing = tx.select().from(todos).where(and(eq(todos.id, id), visible)).get();
        if (!existing) return false;

        const timestamp = nowIso();
        tx.update(todos)
          .set({ deletedAt: timestamp, updatedAt: timestamp })
          .where(eq(todos.id, id))
          .run();
        return true;
      });

      if (!deleted) return fail({ form: "Todo not found." }, 404);
      return json({ ok: true });
    },

    findVisible,
  };
}

export type TodoRoutes = ReturnType<typeof createTodoRoutes>;
