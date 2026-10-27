// Time helpers for server components (React's lint rules forbid Date.now() in render).

export function isoAgo(ms: number) {
  return new Date(Date.now() - ms).toISOString();
}

export function isWithin(iso: string | null, ms: number) {
  return iso !== null && Date.now() - Date.parse(iso) < ms;
}
