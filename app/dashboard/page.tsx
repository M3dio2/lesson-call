import Link from "next/link";
import { Suspense } from "react";
import CopyLinkButton from "@/components/CopyLinkButton";
import Button, { buttonClass } from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { createClient } from "@/lib/supabase/server";
import { createLesson, deleteLesson, signOut } from "./actions";

export default function DashboardPage() {
  return (
    <main className="min-h-dvh flex-1 p-4 sm:p-8">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-accent">Lesson Call</p>
            <h1 className="text-2xl font-semibold">Your lessons</h1>
          </div>
          <form action={signOut}>
            <Button variant="ghost" size="sm">
              Log out
            </Button>
          </form>
        </header>

        <form action={createLesson} className="flex items-end gap-2">
          <Field
            label="New lesson"
            name="title"
            placeholder="e.g. “Anna – Tuesdays”"
            required
            className="min-w-0 flex-1"
          />
          <Button>Create</Button>
        </form>

        <Suspense fallback={<p className="text-ink-muted">Loading lessons…</p>}>
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
          className="flex flex-wrap items-center gap-2 rounded-panel border border-line bg-surface p-3"
        >
          <span className="flex-1 font-medium">{lesson.title}</span>
          <CopyLinkButton slug={lesson.invite_slug} />
          <Link href={`/lesson/${lesson.id}`} className={buttonClass("primary", "sm")}>
            Start
          </Link>
          <form action={deleteLesson}>
            <input type="hidden" name="id" value={lesson.id} />
            <Button variant="danger" size="sm">
              Delete
            </Button>
          </form>
        </li>
      ))}
      {lessons?.length === 0 && (
        <p className="text-ink-muted">
          No lessons yet. Create one per student; the invite link stays the same every week.
        </p>
      )}
    </ul>
  );
}
