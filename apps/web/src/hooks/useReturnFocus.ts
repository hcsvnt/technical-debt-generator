import { useCallback, useEffect, useRef } from "react";

/**
 * Restores focus to whatever opened a controlled dialog.
 *
 * Radix returns focus to its own DialogTrigger, but these dialogs are driven
 * by an `open` prop with the trigger elsewhere, so it has nothing to return
 * to and focus falls back to <body>. Remember the element ourselves and hand
 * the result to onCloseAutoFocus.
 */
export function useReturnFocus(open: boolean) {
  const trigger = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      trigger.current = document.activeElement as HTMLElement | null;
    }
  }, [open]);

  return useCallback((event: Event) => {
    const target = trigger.current;
    if (!target?.isConnected) return;

    event.preventDefault();
    target.focus();
  }, []);
}
