"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LessonRoom, { type SavedLesson } from "./LessonRoom";

export default function TeacherRoom({ lesson }: { lesson: SavedLesson }) {
  const lessonId = lesson.id;
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/livekit-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) setToken(data.token);
        else setError(data.error ?? "Could not start the lesson");
      })
      .catch(() => setError("Could not start the lesson"));
  }, [lessonId]);

  if (error) {
    return <p className="p-4 text-danger">{error}</p>;
  }
  if (!token) {
    return <p className="p-4 text-ink-muted">Starting lesson…</p>;
  }
  return (
    <LessonRoom
      token={token}
      role="teacher"
      lesson={lesson}
      onLeave={() => router.push("/dashboard")}
    />
  );
}
