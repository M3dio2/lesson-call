import Link from "next/link";
import { Suspense } from "react";
import CopyLinkButton from "@/components/CopyLinkButton";
import { AutoRefresh, ConfirmSubmit, LocalDate } from "@/components/dashboard/DashboardBits";
import Button, { buttonClass } from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { occupiedLessons } from "@/lib/livekit";
import { createClient } from "@/lib/supabase/server";
import { isoAgo } from "@/lib/time";
import { addStudent, removeLesson, signOut, startQuickCall } from "./actions";

const QUICK_CALL_MAX_AGE_MS = 12 * 60 * 60 * 1000;

export default function DashboardPage() {
  return (
    <main className="min-h-dvh flex-1 p-4 sm:p-8">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <header className="flex items-center justify-between">
          <p className="text-lg font-semibold text-accent">Lesson Call</p>
          <form action={signOut}>
            <Button variant="ghost" size="sm">
              Log out
            </Button>
          </form>
        </header>

        <Suspense fallback={<p className="text-ink-muted">Loading…</p>}>
          <Lessons />
        </Suspense>
      </div>
    </main>
  );
}

type Lesson = {
  id: string;
  title: string;
  invite_slug: string;
  kind: "student" | "quick";
  last_active_at: string | null;
  created_at: string;
};

async function Lessons() {
  const supabase = await createClient();

  // Quick calls nobody ended are cleaned up after 12 hours.
  await supabase
    .from("lessons")
    .delete()
    .eq("kind", "quick")
    .lt("created_at", isoAgo(QUICK_CALL_MAX_AGE_MS));

  const { data } = await supabase
    .from("lessons")
    .select("id, title, invite_slug, kind, last_active_at, created_at")
    .order("title");
  const lessons = (data ?? []) as Lesson[];
  const occupied = await occupiedLessons(lessons.map((l) => l.id));
  const quickCalls = lessons.filter((l) => l.kind === "quick");
  const students = lessons.filter((l) => l.kind === "student");

  return (
    <>
      <AutoRefresh />

      <section className="flex flex-col gap-3">
        {quickCalls.map((call) => (
          <div
            key={call.id}
            className="flex flex-wrap items-center gap-2 rounded-panel border border-accent bg-surface p-4"
          >
            <div className="flex-1">
              <p className="font-semibold">Quick call in progress</p>
              <p className="text-sm text-ink-muted">
                {occupied.has(call.id) ? "Your student is waiting." : "Nobody is in the call."}
              </p>
            </div>
            <CopyLinkButton slug={call.invite_slug} />
            <Link href={`/lesson/${call.id}`} className={buttonClass("primary", "sm")}>
              Rejoin
            </Link>
            <form action={removeLesson}>
              <input type="hidden" name="id" value={call.id} />
              <ConfirmSubmit message="End this quick call? The student link will stop working.">
                End
              </ConfirmSubmit>
            </form>
          </div>
        ))}
        <form action={startQuickCall}>
          <Button className="w-full py-3 text-lg">Start a quick call</Button>
        </form>
        <p className="text-center text-sm text-ink-muted">
          A one-off call with a new student link. Nothing is saved.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h1 className="text-xl font-semibold">Your students</h1>
        <ul className="flex flex-col gap-3">
          {students.map((student) => (
            <StudentCard key={student.id} student={student} waiting={occupied.has(student.id)} />
          ))}
        </ul>
        {students.length === 0 && (
          <p className="text-ink-muted">
            Add a student to give them their own room and a link that stays the same every week.
          </p>
        )}
        <form action={addStudent} className="flex items-end gap-2">
          <Field
            label="Add a student"
            name="title"
            placeholder="Name, e.g. Anna"
            required
            className="min-w-0 flex-1"
          />
          <Button variant="secondary">Add</Button>
        </form>
      </section>
    </>
  );
}

// The whole card opens the room; the buttons sit above the card link.
function StudentCard({ student, waiting }: { student: Lesson; waiting: boolean }) {
  return (
    <li className="relative flex flex-wrap items-center gap-3 rounded-panel border border-line bg-surface p-4 transition-colors hover:border-accent">
      <Link
        href={`/lesson/${student.id}`}
        aria-label={`Open ${student.title}'s room`}
        className="absolute inset-0 rounded-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />
      <div className="flex-1">
        <p className="flex items-center gap-2 font-semibold">
          {student.title}
          {waiting && (
            <span className="flex items-center gap-1 rounded-full bg-ok/10 px-2 py-0.5 text-xs font-medium text-ok">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" /> Waiting
            </span>
          )}
        </p>
        <p className="text-sm text-ink-muted">
          {student.last_active_at ? (
            <>
              Last lesson: <LocalDate iso={student.last_active_at} />
            </>
          ) : (
            "No lessons yet"
          )}
        </p>
      </div>
      <div className="relative flex items-center gap-1">
        <CopyLinkButton slug={student.invite_slug} />
        <form action={removeLesson}>
          <input type="hidden" name="id" value={student.id} />
          <ConfirmSubmit message={`Remove ${student.title}? Their link will stop working.`}>
            Remove
          </ConfirmSubmit>
        </form>
        <span aria-hidden className="pl-1 text-ink-muted">
          →
        </span>
      </div>
    </li>
  );
}
