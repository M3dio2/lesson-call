// Time helpers for server components (React's lint rules forbid Date.now() in render).

export function isWithin(iso: string | null, ms: number) {
  return iso !== null && Date.now() - Date.parse(iso) < ms;
}
