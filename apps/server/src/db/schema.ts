import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Mirrors the table the app has always had.
 *
 * Timestamps are ISO-8601 strings and `dueDate` is a bare `YYYY-MM-DD` date;
 * both are stored as TEXT so SQLite's lexicographic ordering is also
 * chronological ordering, which is what the list sort relies on.
 *
 * Completion and deletion are recorded as nullable timestamps rather than
 * booleans: a non-null `completedAt` means done, a non-null `deletedAt` means
 * soft-deleted and hidden from every read.
 */
export const todos = sqliteTable(
  "todos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    dueDate: text("dueDate").notNull(),
    createdAt: text("createdAt").notNull(),
    updatedAt: text("updatedAt").notNull(),
    completedAt: text("completedAt"),
    deletedAt: text("deletedAt"),
  },
  (table) => [
    index("idx_todos_deletedAt").on(table.deletedAt),
    index("idx_todos_completedAt").on(table.completedAt),
    index("idx_todos_dueDate").on(table.dueDate),
  ],
);

export type TodoRow = typeof todos.$inferSelect;
