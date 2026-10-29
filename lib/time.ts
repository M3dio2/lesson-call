// Time helpers for server components (React's lint rules forbid Date.now() in render).

// Quick calls end after this (dashboard cleanup; the token route stops letting students in).
export const QUICK_CALL_MAX_AGE_MS = 12 * 60 * 60 * 1000;

export function isWithin(iso: string | null, ms: number) {
  return iso !== null && Date.now() - Date.parse(iso) < ms;
}
