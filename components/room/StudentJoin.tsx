"use client";

import { DisconnectReason } from "livekit-client";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Panel from "@/components/ui/Panel";
import LessonRoom from "./LessonRoom";

export default function StudentJoin({ slug }: { slug: string }) {
  const [name, setName] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [left, setLeft] = useState(false);
  const [ended, setEnded] = useState(false); // the teacher ended the call; the link is gone

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
        role="student"
        onLeave={(reason) => {
          setToken(null);
          setLeft(true);
          setEnded(reason === DisconnectReason.ROOM_DELETED);
        }}
      />
    );
  }

  if (ended) {
    return (
      <main className="flex min-h-dvh flex-1 items-center justify-center p-4">
        <Panel className="w-full max-w-sm">
          <div className="flex flex-col gap-2 p-6">
            <p className="text-sm font-medium text-accent">Lesson Call</p>
            <h1 className="text-2xl font-semibold">The call has ended.</h1>
            <p className="text-ink-muted">You can close this page.</p>
          </div>
        </Panel>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center p-4">
      <Panel className="w-full max-w-sm">
        <form onSubmit={join} className="flex flex-col gap-4 p-6">
          <div>
            <p className="text-sm font-medium text-accent">Lesson Call</p>
            <h1 className="text-2xl font-semibold">
              {left ? "You left the lesson" : "Join your lesson"}
            </h1>
          </div>
          <Field
            label="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="given-name"
            required
          />
          <Button disabled={joining}>{joining ? "Joining…" : left ? "Rejoin" : "Join"}</Button>
          {error && <p className="text-sm text-danger">{error}</p>}
        </form>
      </Panel>
    </main>
  );
}
