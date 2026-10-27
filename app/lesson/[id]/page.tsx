import { notFound } from "next/navigation";
import { Suspense } from "react";
import TeacherRoom from "@/components/room/TeacherRoom";
import { createClient } from "@/lib/supabase/server";

export default function LessonPage({ params }: PageProps<"/lesson/[id]">) {
  return (
    <Suspense fallback={<p className="p-4 text-neutral-400">Starting lesson…</p>}>
      <Lesson params={params} />
    </Suspense>
  );
}

async function Lesson({ params }: Pick<PageProps<"/lesson/[id]">, "params">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: lesson } = await supabase.from("lessons").select("id").eq("id", id).maybeSingle();
  if (!lesson) notFound();

  return <TeacherRoom lessonId={lesson.id} />;
}
