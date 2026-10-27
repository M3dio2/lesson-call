"use client";

import { useState } from "react";
import LessonRoom from "./LessonRoom";

export default function StudentJoin({ slug }: { slug: string }) {
  const [name, setName] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [left, setLeft] = useState(false);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setJoining(true);
    setError(null);
    const res = await fetch("/api/livekit-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, name }),
    });
    const data = await res.json();
    setJoining(false);
    if (!res.ok) {
      setError(data.error ?? "Could not join");
      return;
    }
    setLeft(false);
    setToken(data.token);
  }

  if (token) {
    return (
      <LessonRoom
        token={token}
        onLeave={() => {
          setToken(null);
          setLeft(true);
        }}
      />
    );
  }

  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center bg-neutral-950 p-4 text-neutral-100">
      <form onSubmit={join} className="flex w-full max-w-sm flex-col gap-3">
        <h1 className="text-2xl font-semibold">{left ? "You left the lesson" : "Join your lesson"}</h1>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoComplete="given-name"
          required
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
        />
        <button
          disabled={joining}
          className="rounded-md bg-blue-600 px-3 py-2 font-medium disabled:opacity-50"
        >
          {joining ? "Joining…" : left ? "Rejoin" : "Join"}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>
    </main>
  );
}
