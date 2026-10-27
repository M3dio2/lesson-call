// Yjs snapshots are stored in Postgres as base64 text.

export function toBase64(bytes: Uint8Array) {
  let binary = "";
  const chunk = 0x8000; // String.fromCharCode has an argument limit
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function fromBase64(base64: string) {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}
