import { describe, expect, test } from "bun:test";

import {
  isCalendarDate,
  todoFilterSchema,
  todoInputSchema,
  toTodoErrors,
} from "./todo";

const valid = { title: "Ship it", description: "All of it", dueDate: "2026-09-30" };

describe("todoInputSchema", () => {
  test("accepts a complete input and trims it", () => {
    const result = todoInputSchema.parse({
      title: "  Ship it  ",
      description: "  All of it  ",
      dueDate: " 2026-09-30 ",
    });
    expect(result).toEqual(valid);
  });

  test.each([
    ["missing title", { ...valid, title: "" }, "title", "Title is required."],
    ["whitespace title", { ...valid, title: "   " }, "title", "Title is required."],
    ["missing description", { ...valid, description: "" }, "description", "Description is required."],
    ["whitespace description", { ...valid, description: " \t " }, "description", "Description is required."],
    ["missing dueDate", { ...valid, dueDate: "" }, "dueDate", "Due date is required."],
    ["month 13", { ...valid, dueDate: "2026-13-01" }, "dueDate", "Use YYYY-MM-DD."],
    ["day 32", { ...valid, dueDate: "2026-01-32" }, "dueDate", "Use YYYY-MM-DD."],
    ["no zero padding", { ...valid, dueDate: "2026-1-1" }, "dueDate", "Use YYYY-MM-DD."],
    ["not a date", { ...valid, dueDate: "tomorrow" }, "dueDate", "Use YYYY-MM-DD."],
  ])("rejects %s", (_label, input, field, message) => {
    const result = todoInputSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(toTodoErrors(result.error!)[field as "title"]).toBe(message);
  });

  test("rejects a day the month does not have", () => {
    // Regression guard: z.iso.date() is regex-based and would accept this.
    const result = todoInputSchema.safeParse({ ...valid, dueDate: "2026-02-31" });
    expect(result.success).toBe(false);
    expect(toTodoErrors(result.error!).dueDate).toBe("Use YYYY-MM-DD.");
  });

  test("accepts a leap day in a leap year", () => {
    expect(todoInputSchema.safeParse({ ...valid, dueDate: "2028-02-29" }).success).toBe(true);
  });

  test("rejects a leap day in a common year", () => {
    expect(todoInputSchema.safeParse({ ...valid, dueDate: "2026-02-29" }).success).toBe(false);
  });

  test("reports every invalid field at once", () => {
    const result = todoInputSchema.safeParse({ title: "", description: "", dueDate: "" });
    expect(toTodoErrors(result.error!)).toEqual({
      title: "Title is required.",
      description: "Description is required.",
      dueDate: "Due date is required.",
    });
  });
});

describe("isCalendarDate", () => {
  test.each([
    ["2026-09-30", true],
    ["2028-02-29", true],
    ["2026-02-29", false],
    ["2026-02-31", false],
    ["2026-13-01", false],
    ["2026-00-10", false],
    ["2026-09-00", false],
    ["26-09-30", false],
    ["", false],
  ])("%s -> %s", (value, expected) => {
    expect(isCalendarDate(value)).toBe(expected);
  });
});

describe("todoFilterSchema", () => {
  test.each(["all", "active", "completed"])("passes %s through", (value) => {
    expect(todoFilterSchema.parse(value)).toBe(value);
  });

  test.each([["nonsense"], [""], [undefined], [null], [42]])(
    "falls back to all for %p",
    (value) => {
      expect(todoFilterSchema.parse(value)).toBe("all");
    },
  );
});
