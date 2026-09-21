import { describe, expect, test } from "bun:test";

import type { Todo } from "@todo/shared";

import { toListView } from "./TodoListView";

const todo = (id: number): Todo => ({
  id,
  title: `Todo ${id}`,
  description: "",
  dueDate: "2026-09-30",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  completedAt: null,
  deletedAt: null,
});

describe("toListView", () => {
  test("loading before anything arrives", () => {
    expect(toListView({ isPending: true, error: null, todos: undefined })).toEqual({
      status: "loading",
    });
  });

  test("failed when the first load errors", () => {
    expect(
      toListView({ isPending: false, error: new Error("boom"), todos: undefined }),
    ).toEqual({ status: "failed", message: "boom" });
  });

  test("empty when the server returns nothing", () => {
    expect(toListView({ isPending: false, error: null, todos: [] })).toEqual({
      status: "empty",
    });
  });

  test("ready when todos are loaded", () => {
    const todos = [todo(1)];
    expect(toListView({ isPending: false, error: null, todos })).toEqual({
      status: "ready",
      todos,
    });
  });

  test("keeps showing todos when a background refetch fails", () => {
    // The regression this module exists for: a failed write invalidates the
    // list, that refetch fails too, and the user must not lose their list.
    const todos = [todo(1), todo(2)];
    expect(
      toListView({ isPending: false, error: new Error("Could not reach the server."), todos }),
    ).toEqual({ status: "ready", todos });
  });

  test("falls back to a generic message for a non-Error rejection", () => {
    expect(toListView({ isPending: false, error: "nope", todos: undefined })).toEqual({
      status: "failed",
      message: "Failed to load todos.",
    });
  });
});
