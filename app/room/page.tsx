"use client";

import { useState } from "react";
import LessonRoom from "@/components/room/LessonRoom";

// M2 test page: join the hard-coded test room with just a name.
// Replaced by /lesson/[id] (teacher) and /join/[slug] (student) in M4.
export default function TestRoomPage() {
  const [name, setName] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setJoining(true);
    setError(null);
    const res = await fetch("/api/livekit-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setJoining(false);
    if (!res.ok) {
      setError(data.error ?? "Could not join");
      return;
    }
    setToken(data.token);
  }

  if (token) {
    return <LessonRoom token={token} onLeave={() => setToken(null)} />;
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-neutral-950 p-4 text-neutral-100">
      <form onSubmit={join} className="flex w-full max-w-sm flex-col gap-3">
        <h1 className="text-2xl font-semibold">Join test lesson</h1>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
        />
        <button
          disabled={joining}
          className="rounded-md bg-blue-600 px-3 py-2 font-medium disabled:opacity-50"
        >
          {joining ? "Joining…" : "Join"}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>
    </main>
  );
}
