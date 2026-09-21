import { beforeEach, describe, expect, test } from "bun:test";

import { createDb } from "../db/client";
import { todos as todosTable } from "../db/schema";
import { createTodoRoutes } from "./todos";

type Routes = ReturnType<typeof createTodoRoutes>;

let db: ReturnType<typeof createDb>["db"];
let routes: Routes;

const valid = { title: "Ship it", description: "All of it", dueDate: "2026-09-30" };

const get = (query = "") =>
  routes.list(new Request(`http://localhost/api/todos${query}`));

const post = (body: unknown) =>
  routes.create(
    new Request("http://localhost/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

const put = (id: string, body: unknown) =>
  routes.update(
    Object.assign(
      new Request(`http://localhost/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: typeof body === "string" ? body : JSON.stringify(body),
      }),
      { params: { id } },
    ) as Request & { params: { id: string } },
  );

const del = (id: string) =>
  routes.remove(
    Object.assign(new Request(`http://localhost/api/todos/${id}`, { method: "DELETE" }), {
      params: { id },
    }) as Request & { params: { id: string } },
  );

/** Insert directly so tests can control timestamps the API sets itself. */
function seed(row: Partial<typeof todosTable.$inferInsert> & { title: string }) {
  return db
    .insert(todosTable)
    .values({
      description: "seeded",
      dueDate: "2026-06-01",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      completedAt: null,
      deletedAt: null,
      ...row,
    })
    .returning()
    .get();
}

beforeEach(() => {
  ({ db } = createDb(":memory:"));
  routes = createTodoRoutes(db);
});

describe("GET /api/todos", () => {
  test("returns an empty list when there is nothing", async () => {
    expect(await (await get()).json()).toEqual({ data: [] });
  });

  test("excludes soft-deleted todos", async () => {
    seed({ title: "visible" });
    seed({ title: "gone", deletedAt: "2026-02-01T00:00:00.000Z" });

    const { data } = await (await get()).json();
    expect(data.map((t: { title: string }) => t.title)).toEqual(["visible"]);
  });

  test("filter=active hides completed todos", async () => {
    seed({ title: "open" });
    seed({ title: "done", completedAt: "2026-02-01T00:00:00.000Z" });

    const { data } = await (await get("?filter=active")).json();
    expect(data.map((t: { title: string }) => t.title)).toEqual(["open"]);
  });

  test("filter=completed hides active todos", async () => {
    seed({ title: "open" });
    seed({ title: "done", completedAt: "2026-02-01T00:00:00.000Z" });

    const { data } = await (await get("?filter=completed")).json();
    expect(data.map((t: { title: string }) => t.title)).toEqual(["done"]);
  });

  test("filter=all returns both", async () => {
    seed({ title: "open" });
    seed({ title: "done", completedAt: "2026-02-01T00:00:00.000Z" });

    const { data } = await (await get("?filter=all")).json();
    expect(data).toHaveLength(2);
  });

  test("a soft-deleted todo stays hidden under every filter", async () => {
    seed({ title: "gone", completedAt: "2026-02-01T00:00:00.000Z", deletedAt: "2026-02-02T00:00:00.000Z" });

    for (const filter of ["all", "active", "completed"]) {
      const { data } = await (await get(`?filter=${filter}`)).json();
      expect(data).toEqual([]);
    }
  });

  test("an unknown filter falls back to all rather than erroring", async () => {
    seed({ title: "open" });
    seed({ title: "done", completedAt: "2026-02-01T00:00:00.000Z" });

    const res = await get("?filter=nonsense");
    expect(res.status).toBe(200);
    expect((await res.json()).data).toHaveLength(2);
  });

  test("a missing filter param behaves as all", async () => {
    seed({ title: "open" });
    expect((await (await get()).json()).data).toHaveLength(1);
  });

  test("sorts incomplete first, then dueDate, then createdAt", async () => {
    seed({ title: "done-early", dueDate: "2026-01-01", completedAt: "2026-05-01T00:00:00.000Z" });
    seed({ title: "late", dueDate: "2026-12-01" });
    seed({ title: "early-b", dueDate: "2026-03-01", createdAt: "2026-01-02T00:00:00.000Z" });
    seed({ title: "early-a", dueDate: "2026-03-01", createdAt: "2026-01-01T00:00:00.000Z" });

    const { data } = await (await get()).json();
    expect(data.map((t: { title: string }) => t.title)).toEqual([
      "early-a",
      "early-b",
      "late",
      "done-early",
    ]);
  });
});

describe("POST /api/todos", () => {
  test("creates a todo and returns 201", async () => {
    const res = await post(valid);
    expect(res.status).toBe(201);

    const { data } = await res.json();
    expect(data).toMatchObject({ ...valid, completedAt: null, deletedAt: null });
    expect(data.createdAt).toBe(data.updatedAt);
  });

  test("trims whitespace before storing", async () => {
    const { data } = await (await post({ ...valid, title: "  padded  " })).json();
    expect(data.title).toBe("padded");
  });

  test.each([
    ["a blank title", { ...valid, title: "" }, "title"],
    ["a blank description", { ...valid, description: "" }, "description"],
    ["a missing due date", { ...valid, dueDate: "" }, "dueDate"],
    ["an impossible date", { ...valid, dueDate: "2026-02-31" }, "dueDate"],
    ["a malformed date", { ...valid, dueDate: "30-09-2026" }, "dueDate"],
  ])("rejects %s with a field error", async (_label, body, field) => {
    const res = await post(body);
    expect(res.status).toBe(400);
    expect((await res.json()).errors).toHaveProperty(field);
  });

  test("rejects malformed JSON with a form error", async () => {
    const res = await post("{not json");
    expect(res.status).toBe(400);
    expect((await res.json()).errors.form).toBe("Invalid JSON payload.");
  });

  test("does not persist a rejected todo", async () => {
    await post({ ...valid, title: "" });
    expect((await (await get()).json()).data).toEqual([]);
  });
});

describe("PUT /api/todos/:id", () => {
  test("updates the editable fields", async () => {
    const created = seed({ title: "before" });
    const res = await put(String(created.id), { ...valid, title: "after" });

    expect(res.status).toBe(200);
    const { data } = await res.json();
    expect(data.title).toBe("after");
    expect(data.updatedAt).not.toBe(created.updatedAt);
  });

  test("completed:true stamps completedAt", async () => {
    const created = seed({ title: "open" });
    const { data } = await (await put(String(created.id), { ...valid, completed: true })).json();
    expect(data.completedAt).not.toBeNull();
  });

  test("completed:false clears completedAt", async () => {
    const created = seed({ title: "done", completedAt: "2026-02-01T00:00:00.000Z" });
    const { data } = await (await put(String(created.id), { ...valid, completed: false })).json();
    expect(data.completedAt).toBeNull();
  });

  test("omitting completed leaves completion untouched", async () => {
    const created = seed({ title: "done", completedAt: "2026-02-01T00:00:00.000Z" });
    const { data } = await (await put(String(created.id), valid)).json();
    expect(data.completedAt).toBe("2026-02-01T00:00:00.000Z");
  });

  test("completing an already-complete todo keeps the original timestamp", async () => {
    const created = seed({ title: "done", completedAt: "2026-02-01T00:00:00.000Z" });
    const { data } = await (await put(String(created.id), { ...valid, completed: true })).json();
    expect(data.completedAt).toBe("2026-02-01T00:00:00.000Z");
  });

  test("validates the body", async () => {
    const created = seed({ title: "open" });
    const res = await put(String(created.id), { ...valid, title: "" });
    expect(res.status).toBe(400);
    expect((await res.json()).errors.title).toBe("Title is required.");
  });

  test("404s for a missing todo", async () => {
    expect((await put("999", valid)).status).toBe(404);
  });

  test("404s for a soft-deleted todo", async () => {
    const created = seed({ title: "gone", deletedAt: "2026-02-01T00:00:00.000Z" });
    expect((await put(String(created.id), valid)).status).toBe(404);
  });

  test.each([["abc"], ["1.5"], [""], ["0"], ["-1"]])("400s for id %p", async (id) => {
    expect((await put(id, valid)).status).toBe(400);
  });
});

describe("DELETE /api/todos/:id", () => {
  test("soft-deletes rather than removing the row", async () => {
    const created = seed({ title: "doomed" });
    expect((await del(String(created.id))).status).toBe(200);

    expect((await (await get()).json()).data).toEqual([]);
    expect(db.select().from(todosTable).all()).toHaveLength(1);
  });

  test("a second delete 404s", async () => {
    const created = seed({ title: "doomed" });
    await del(String(created.id));

    const res = await del(String(created.id));
    expect(res.status).toBe(404);
    expect((await res.json()).errors.form).toBe("Todo not found.");
  });

  test("404s for a todo that never existed", async () => {
    expect((await del("999")).status).toBe(404);
  });

  test.each([["abc"], ["1.5"], [""]])("400s for id %p", async (id) => {
    expect((await del(id)).status).toBe(400);
  });
});
