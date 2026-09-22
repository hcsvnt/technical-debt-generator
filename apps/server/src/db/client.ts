import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

import * as schema from "./schema";

/**
 * Anchored to this module, not to `process.cwd()`. The database used to land
 * wherever the process happened to be launched from.
 */
const DEFAULT_DB_PATH = join(import.meta.dir, "../../data/todos.sqlite");
const MIGRATIONS_DIR = join(import.meta.dir, "../../drizzle");

export type Db = ReturnType<typeof createDb>["db"];

export function createDb(path: string = process.env.DATABASE_PATH ?? DEFAULT_DB_PATH) {
  if (path !== ":memory:") {
    mkdirSync(dirname(path), { recursive: true });
  }

  const sqlite = new Database(path, { create: true });
  sqlite.exec("PRAGMA journal_mode = WAL;");
  sqlite.exec("PRAGMA foreign_keys = ON;");

  const db = drizzle(sqlite, { schema });

  // Synchronous for bun-sqlite, and the folder must be absolute because the
  // migrator reads it relative to cwd otherwise.
  migrate(db, { migrationsFolder: MIGRATIONS_DIR });

  return { db, sqlite };
}
