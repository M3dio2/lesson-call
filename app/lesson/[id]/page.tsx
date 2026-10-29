import { notFound } from "next/navigation";
import { Suspense } from "react";
import LoadingScreen from "@/components/room/LoadingScreen";
import TeacherRoom from "@/components/room/TeacherRoom";
import { createClient } from "@/lib/supabase/server";
import { isWithin } from "@/lib/time";

// After this long without activity, the next start is a new lesson with a clean board.
const NEW_LESSON_AFTER_MS = 3 * 60 * 60 * 1000;

export default function LessonPage({ params }: PageProps<"/lesson/[id]">) {
  return (
    <Suspense fallback={<LoadingScreen title="Getting your lesson ready" />}>
      <Lesson params={params} />
    </Suspense>
  );
}

async function Lesson({ params }: Pick<PageProps<"/lesson/[id]">, "params">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, doc_snapshot, invite_slug, kind, last_active_at")
    .eq("id", id)
    .maybeSingle();
  if (!lesson) notFound();

  // Read-only on purpose (links may be prefetched); last_active_at is written by the
  // token route when the teacher actually joins, and by every save.
  const sameLesson = isWithin(lesson.last_active_at, NEW_LESSON_AFTER_MS);

  return (
    <TeacherRoom
      lesson={{
        id: lesson.id,
        inviteSlug: lesson.invite_slug,
        snapshot: sameLesson ? lesson.doc_snapshot : null,
        saveBoard: lesson.kind === "student",
      }}
    />
  );
}
