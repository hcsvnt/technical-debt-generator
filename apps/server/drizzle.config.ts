import { defineConfig } from "drizzle-kit";

// `driver` is deliberately unset: drizzle-kit has no bun-sqlite driver, and we
// only ever run `generate`, which is static analysis of the schema and needs
// no database connection.
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: "./data/todos.sqlite" },
  strict: true,
  verbose: true,
});
