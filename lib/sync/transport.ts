import type { Room } from "livekit-client";

// Binary messages over LiveKit data streams: reliable, ordered, and no size limit
// (plain publishData packets are limited to ~15 KB, too small for a full document).

export async function sendBytes(room: Room, topic: string, bytes: Uint8Array, to?: string[]) {
  await room.localParticipant.sendBytes(bytes, { topic, destinationIdentities: to });
}

export function onBytes(
  room: Room,
  topic: string,
  handler: (bytes: Uint8Array, fromIdentity: string) => void,
) {
  room.registerByteStreamHandler(topic, async (reader, { identity }) => {
    handler(concat(await reader.readAll()), identity);
  });
  return () => room.unregisterByteStreamHandler(topic);
}

function concat(chunks: Uint8Array[]) {
  if (chunks.length === 1) return chunks[0];
  const out = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}
