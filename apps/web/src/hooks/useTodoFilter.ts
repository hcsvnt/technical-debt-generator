import { useCallback, useSyncExternalStore } from "react";

import { todoFilterSchema, type TodoFilter } from "@todo/shared";

/**
 * The URL is the single source of truth for the filter.
 *
 * Subscribing to popstate is what makes the Back button work: previously the
 * filter was pushed onto the history stack but never read back, so going Back
 * changed the URL and left the UI showing the old filter.
 */

const FILTER_CHANGED = "todo:filterchange";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(FILTER_CHANGED, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(FILTER_CHANGED, onChange);
  };
}

const readFilter = (): TodoFilter =>
  todoFilterSchema.parse(new URLSearchParams(window.location.search).get("filter"));

export function useTodoFilter() {
  const filter = useSyncExternalStore(subscribe, readFilter, () => "all" as const);

  const setFilter = useCallback((value: TodoFilter) => {
    const params = new URLSearchParams(window.location.search);
    if (value === "all") {
      params.delete("filter");
    } else {
      params.set("filter", value);
    }

    const query = params.toString();
    window.history.pushState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
    // pushState does not fire popstate, so nudge our own subscribers.
    window.dispatchEvent(new Event(FILTER_CHANGED));
  }, []);

  return { filter, setFilter };
}
