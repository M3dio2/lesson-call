"use client";

import { useCallback, useSyncExternalStore } from "react";

// True while the CSS media query matches. Server render assumes "no match".
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

// Matches Tailwind's `md` breakpoint: below it, the lesson uses the phone layout.
export const PHONE_QUERY = "(max-width: 767px)";
