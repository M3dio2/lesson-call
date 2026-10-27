import { AccessToken } from "livekit-server-sdk";
import { roomName } from "@/lib/livekit";
import { createAdminClient, createClient } from "@/lib/supabase/server";

type Role = "teacher" | "student";

// Teacher: { lessonId } plus a Supabase session; RLS makes sure the lesson is theirs.
// Student: { slug, name, clientId } from the invite link; no account needed.
// Identities are fixed per person (teacher account, student browser), so joining again from
// another tab makes LiveKit drop the older one (DisconnectReason.DUPLICATE_IDENTITY).
export async function POST(request: Request) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret) {
    return Response.json({ error: "LiveKit keys are not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  let lessonId: string;
  let role: Role;
  let name: string;
  let identity: string;

  if (typeof body.lessonId === "string") {
    const supabase = await createClient();
    const { data: claims } = await supabase.auth.getClaims();
    if (!claims?.claims) {
      return Response.json({ error: "Please log in" }, { status: 401 });
    }
    const { data: lesson } = await supabase
      .from("lessons")
      .select("id")
      .eq("id", body.lessonId)
      .maybeSingle();
    if (!lesson) {
      return Response.json({ error: "Lesson not found" }, { status: 404 });
    }
    lessonId = lesson.id;
    role = "teacher";
    // Marks the lesson as started (dashboard "Last lesson", 3-hour clean-board rule).
    await supabase
      .from("lessons")
      .update({ last_active_at: new Date().toISOString() })
      .eq("id", lessonId);
    name = "Teacher";
    identity = `teacher-${claims.claims.sub}`;
  } else if (typeof body.slug === "string") {
    name = typeof body.name === "string" ? body.name.trim().slice(0, 40) : "";
    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }
    const { data: lesson } = await createAdminClient()
      .from("lessons")
      .select("id")
      .eq("invite_slug", body.slug)
      .maybeSingle();
    if (!lesson) {
      return Response.json({ error: "This invite link is not valid" }, { status: 404 });
    }
    lessonId = lesson.id;
    role = "student";
    // Prefixed, so a student can never take over the teacher's identity.
    const clientId = /^[a-z0-9-]{8,40}$/i.test(body.clientId) ? body.clientId : crypto.randomUUID();
    identity = `student-${clientId}`;
  } else {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity,
    name,
    metadata: JSON.stringify({ role }),
    ttl: "4h",
  });
  token.addGrant({
    roomJoin: true,
    room: roomName(lessonId),
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return Response.json({ token: await token.toJwt() });
}
