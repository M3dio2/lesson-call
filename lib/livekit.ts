import { RoomServiceClient } from "livekit-server-sdk";

// Server-only LiveKit helpers.

export function roomName(lessonId: string) {
  return `lesson-${lessonId}`;
}

// Lesson ids whose room has someone in it right now. On the dashboard the teacher isn't in
// any room, so this means "the student is waiting". Errors count as "nobody there".
export async function occupiedLessons(lessonIds: string[]): Promise<Set<string>> {
  const url = process.env.NEXT_PUBLIC_LIVEKIT_URL;
  if (!url || lessonIds.length === 0) return new Set();

  const client = new RoomServiceClient(
    url.replace(/^wss:/, "https:"),
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
  );
  try {
    const rooms = await client.listRooms(lessonIds.map(roomName));
    return new Set(
      rooms
        .filter((room) => room.numParticipants > 0)
        .map((room) => room.name.slice("lesson-".length)),
    );
  } catch (error) {
    console.error("Could not check LiveKit rooms:", error);
    return new Set();
  }
}
