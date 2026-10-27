"use client";

import { useCallback, useSyncExternalStore } from "react";
import type * as Y from "yjs";

// Re-renders when `key` changes in a shared Y.Map. Use for small values (strings, booleans).
export function useYMapValue<T>(map: Y.Map<unknown>, key: string): T | undefined {
  const subscribe = useCallback(
    (onChange: () => void) => {
      map.observe(onChange);
      return () => map.unobserve(onChange);
    },
    [map],
  );
  return useSyncExternalStore(
    subscribe,
    () => map.get(key) as T | undefined,
    () => undefined,
  );
}
