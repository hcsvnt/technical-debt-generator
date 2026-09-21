import {
  errorResponseSchema,
  todoListResponseSchema,
  todoResponseSchema,
  type Todo,
  type TodoErrors,
  type TodoFilter,
  type TodoInput,
} from "@todo/shared";

/**
 * Thrown for any non-2xx response. Carries the server's field-keyed errors so
 * the form can map them straight back onto inputs.
 */
export class ApiError extends Error {
  readonly errors: TodoErrors;

  constructor(errors: TodoErrors, fallback: string) {
    super(errors.form ?? Object.values(errors)[0] ?? fallback);
    this.name = "ApiError";
    this.errors = errors;
  }
}

async function request(path: string, init?: RequestInit): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(path, init);
  } catch {
    throw new ApiError({ form: "Could not reach the server." }, "Network error.");
  }

  const body = await res.json().catch(() => undefined);

  if (!res.ok) {
    const parsed = errorResponseSchema.safeParse(body);
    throw new ApiError(
      parsed.success ? parsed.data.errors : { form: "Something went wrong." },
      res.statusText,
    );
  }

  return body;
}

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

/**
 * Responses are parsed, not cast. A server contract change fails loudly here
 * rather than surfacing as `undefined` three components deep.
 */
export async function fetchTodos(filter: TodoFilter): Promise<Todo[]> {
  const query = filter === "all" ? "" : `?filter=${filter}`;
  return todoListResponseSchema.parse(await request(`/api/todos${query}`)).data;
}

export async function createTodo(input: TodoInput): Promise<Todo> {
  return todoResponseSchema.parse(await request("/api/todos", jsonInit("POST", input))).data;
}

export async function updateTodo(id: number, input: TodoInput & { completed?: boolean }) {
  return todoResponseSchema.parse(await request(`/api/todos/${id}`, jsonInit("PUT", input))).data;
}

export async function setTodoCompleted(todo: Todo, completed: boolean): Promise<Todo> {
  return updateTodo(todo.id, {
    title: todo.title,
    description: todo.description,
    dueDate: todo.dueDate,
    completed,
  });
}

export async function deleteTodo(id: number): Promise<void> {
  await request(`/api/todos/${id}`, { method: "DELETE" });
}
