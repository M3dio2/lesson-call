import { AccessToken } from "livekit-server-sdk";

// M2: anyone can join the hard-coded test room. M4 replaces this with
// teacher auth (Supabase) and student invite slugs, and sets the role server-side.
const TEST_ROOM = "test-room";

export async function POST(request: Request) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret) {
    return Response.json({ error: "LiveKit keys are not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 40) : "";
  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity: `${name}-${crypto.randomUUID().slice(0, 8)}`,
    name,
    ttl: "4h",
  });
  token.addGrant({
    roomJoin: true,
    room: TEST_ROOM,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return Response.json({ token: await token.toJwt() });
}
