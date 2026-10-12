import { useSyncExternalStore } from "react";

const REDUCE = "(prefers-reduced-motion: reduce)";

/** Whether the visitor asked for less motion; follows the OS setting live. */
export function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = matchMedia(REDUCE);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => matchMedia(REDUCE).matches,
  );
}
