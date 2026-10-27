// Shared by the /api/mute route (sends) and the student's status banner (listens).
// Sent by the server, so the client only trusts it when it has no sending participant.
export const MUTED_BY_TEACHER_TOPIC = "muted-by-teacher";

// Teacher's client: asks the server to mute one participant, or everyone else.
export async function muteMicrophones(lessonId: string, identity?: string) {
  const res = await fetch("/api/mute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lessonId, identity }),
  });
  if (!res.ok) throw new Error("Could not mute");
}
