import { serve } from "bun";

// The web app's HTML entrypoint. Bun bundles the script and style graph it
// references and serves the result; this one import is the only code-level
// crossing between the two packages.
import index from "../../web/src/index.html";

import { createDb } from "./db/client";
import { createTodoRoutes } from "./routes/todos";

const { db } = createDb();
const todos = createTodoRoutes(db);

const server = serve({
  routes: {
    "/api/todos": {
      GET: todos.list,
      POST: todos.create,
    },

    "/api/todos/:id": {
      PUT: todos.update,
      DELETE: todos.remove,
    },

    // Everything else is the SPA shell.
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
