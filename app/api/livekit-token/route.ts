import { AccessToken } from "livekit-server-sdk";
import { createAdminClient, createClient } from "@/lib/supabase/server";

type Role = "teacher" | "student";

// Teacher: { lessonId } plus a Supabase session; RLS makes sure the lesson is theirs.
// Student: { slug, name } from the invite link; no account needed.
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
    name = "Teacher";
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
  } else {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity: `${role}-${crypto.randomUUID().slice(0, 8)}`,
    name,
    metadata: JSON.stringify({ role }),
    ttl: "4h",
  });
  token.addGrant({
    roomJoin: true,
    room: `lesson-${lessonId}`,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return Response.json({ token: await token.toJwt() });
}
