import Link from "next/link";
import { Suspense } from "react";
import CopyLinkButton from "@/components/CopyLinkButton";
import { createClient } from "@/lib/supabase/server";
import { createLesson, deleteLesson, signOut } from "./actions";

export default function DashboardPage() {
  return (
    <main className="min-h-dvh flex-1 bg-neutral-950 p-4 text-neutral-100">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Your lessons</h1>
          <form action={signOut}>
            <button className="text-sm text-neutral-400 hover:text-neutral-100">Log out</button>
          </form>
        </header>

        <form action={createLesson} className="flex gap-2">
          <input
            name="title"
            placeholder="Lesson name, e.g. “Anna – Tuesdays”"
            required
            className="min-w-0 flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
          <button className="rounded-md bg-blue-600 px-4 py-2 font-medium">Create</button>
        </form>

        <Suspense fallback={<p className="text-neutral-400">Loading lessons…</p>}>
          <LessonList />
        </Suspense>
      </div>
    </main>
  );
}

async function LessonList() {
  const supabase = await createClient();
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, invite_slug, created_at")
    .order("created_at", { ascending: false });

  return (
    <ul className="flex flex-col gap-3">
      {lessons?.map((lesson) => (
        <li
          key={lesson.id}
          className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 p-3"
        >
          <span className="flex-1 font-medium">{lesson.title}</span>
          <CopyLinkButton slug={lesson.invite_slug} />
          <Link
            href={`/lesson/${lesson.id}`}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium"
          >
            Start
          </Link>
          <form action={deleteLesson}>
            <input type="hidden" name="id" value={lesson.id} />
            <button className="px-2 py-1.5 text-sm text-neutral-500 hover:text-red-400">
              Delete
            </button>
          </form>
        </li>
      ))}
      {lessons?.length === 0 && (
        <p className="text-neutral-400">
          No lessons yet. Create one per student; the invite link stays the same every week.
        </p>
      )}
    </ul>
  );
}
