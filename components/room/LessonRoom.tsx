"use client";

import "@livekit/components-styles";
import {
  ControlBar,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useRoomContext,
  useTracks,
  VideoTrack,
} from "@livekit/components-react";
import { MediaDeviceFailure, RoomEvent, Track, type TrackPublication } from "livekit-client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import * as Y from "yjs";
import TextPad from "@/components/board/TextPad";
import StatusBanner, { deviceProblemMessage } from "./StatusBanner";
import { fromBase64 } from "@/lib/sync/base64";
import { clearLesson } from "@/lib/sync/clearLesson";
import { useLessonPersistence } from "@/lib/sync/useLessonPersistence";
import { useYjsSync } from "@/lib/sync/useYjsSync";
import { useYMapValue } from "@/lib/sync/useYMapValue";

const Whiteboard = dynamic(() => import("@/components/board/Whiteboard"), {
  ssr: false,
  loading: () => <p className="p-4 text-neutral-400">Loading whiteboard…</p>,
});

export type Role = "teacher" | "student";

// Teacher only: the lesson to load from and save to Supabase.
export type SavedLesson = { id: string; snapshot: string | null };

type Props = {
  token: string;
  role: Role;
  lesson?: SavedLesson;
  onLeave: () => void;
};

export default function LessonRoom({ token, role, lesson, onLeave }: Props) {
  const [problem, setProblem] = useState<string | null>(null);

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      connect
      video
      audio
      onDisconnected={onLeave}
      onMediaDeviceFailure={(failure, kind) => setProblem(deviceProblemMessage(failure, kind))}
      // Camera/mic failures also arrive here (e.g. "Permission denied by system" on macOS).
      onError={(error) => {
        const failure = MediaDeviceFailure.getFailure(error);
        setProblem(
          failure
            ? deviceProblemMessage(failure)
            : "Something went wrong with the connection. Check your internet and reload.",
        );
      }}
      data-lk-theme="default"
      className="flex flex-col"
      // Inline on purpose: LiveKit's unlayered `.lk-room-container { height: 100% }` beats
      // Tailwind's h-dvh, which collapsed the stage on phones.
      style={{ height: "100dvh" }}
    >
      <StatusBanner role={role} problem={problem} onDismissProblem={() => setProblem(null)} />
      <LessonContent role={role} lesson={lesson} />
      <ControlBar
        variation="minimal"
        controls={{ microphone: true, camera: true, screenShare: true, chat: false, leave: true }}
        onDeviceError={({ source, error }) =>
          setProblem(
            deviceProblemMessage(
              MediaDeviceFailure.getFailure(error),
              source === Track.Source.Microphone ? "audioinput" : "videoinput",
            ),
          )
        }
      />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

type StageTab = "screen" | "text" | "board";

// The lesson Y.Doc holds everything shared:
// - the text pad (Tiptap's default XML fragment)
// - "board": whiteboard elements
// - "control": teacher-owned settings ("tab", "studentCanEdit")
// It lives inside LiveKitRoom so it can sync over the room's data channel.
// The teacher's doc starts from the saved snapshot; the student's starts empty and is filled
// by the peer on connect.
function LessonContent({ role, lesson }: { role: Role; lesson?: SavedLesson }) {
  const room = useRoomContext();
  const [doc] = useState(() => {
    const doc = new Y.Doc();
    if (lesson?.snapshot) Y.applyUpdate(doc, fromBase64(lesson.snapshot));
    return doc;
  });
  const control = useMemo(() => doc.getMap<unknown>("control"), [doc]);

  // The teacher ignores live edits from the student while editing is off
  // (the student's UI is read-only then; this also stops a tampered client).
  useYjsSync(
    doc,
    "lesson",
    role === "teacher" ? () => control.get("studentCanEdit") === true : undefined,
  );
  useLessonPersistence(doc, lesson?.id);

  // When anyone starts sharing their screen, the teacher's client switches everyone to it.
  useEffect(() => {
    if (role !== "teacher") return;
    const onPublished = (publication: TrackPublication) => {
      if (publication.source === Track.Source.ScreenShare) control.set("tab", "screen");
    };
    room.on(RoomEvent.LocalTrackPublished, onPublished);
    room.on(RoomEvent.TrackPublished, onPublished);
    return () => {
      room.off(RoomEvent.LocalTrackPublished, onPublished);
      room.off(RoomEvent.TrackPublished, onPublished);
    };
  }, [room, role, control]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-2 md:flex-row">
      <MainStage doc={doc} control={control} role={role} />
      <CameraSidebar />
    </div>
  );
}

// The teacher picks the tab; the student's view follows.
// Screen and text stay mounted so switching doesn't reload the video or editor.
// The whiteboard mounts only when shown, because Excalidraw can't measure a hidden canvas.
function MainStage({ doc, control, role }: { doc: Y.Doc; control: Y.Map<unknown>; role: Role }) {
  const tab = useYMapValue<StageTab>(control, "tab") ?? "text";
  const studentCanEdit = useYMapValue<boolean>(control, "studentCanEdit") ?? false;
  const screenShares = useTracks([Track.Source.ScreenShare]);
  const screen = screenShares.at(-1);
  const isTeacher = role === "teacher";
  const canEdit = isTeacher || studentCanEdit;

  const tabs: { id: StageTab; label: string }[] = [
    { id: "screen", label: screen ? "Screen ●" : "Screen" },
    { id: "text", label: "Text" },
    { id: "board", label: "Whiteboard" },
  ];

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-neutral-900">
      <nav className="flex flex-wrap items-center gap-1 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => control.set("tab", t.id)}
            disabled={!isTeacher}
            className={`rounded-md px-3 py-1.5 text-sm ${
              tab === t.id
                ? "bg-neutral-700 text-white"
                : "text-neutral-400 enabled:hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
        {isTeacher ? (
          <TeacherControls doc={doc} control={control} studentCanEdit={studentCanEdit} />
        ) : (
          <span className="ml-auto px-2 text-xs text-neutral-500">
            {studentCanEdit ? "You can edit" : "View only"} · Your teacher chooses the view
          </span>
        )}
      </nav>
      <div
        className={`min-h-0 flex-1 items-center justify-center ${tab === "screen" ? "flex" : "hidden"}`}
      >
        {screen ? (
          <VideoTrack trackRef={screen} className="h-full w-full object-contain" />
        ) : (
          <p className="p-4 text-center text-neutral-400">
            Nobody is sharing their screen. Click “Share screen” below to start.
          </p>
        )}
      </div>
      <div className={`min-h-0 flex-1 ${tab === "text" ? "flex" : "hidden"}`}>
        <TextPad doc={doc} editable={canEdit} />
      </div>
      {tab === "board" && (
        <div className="min-h-0 flex-1 bg-white">
          <Whiteboard doc={doc} editable={canEdit} />
        </div>
      )}
    </main>
  );
}

function TeacherControls({
  doc,
  control,
  studentCanEdit,
}: {
  doc: Y.Doc;
  control: Y.Map<unknown>;
  studentCanEdit: boolean;
}) {
  return (
    <div className="ml-auto flex items-center gap-3 px-2 text-sm">
      <label className="flex cursor-pointer items-center gap-2 text-neutral-300">
        <input
          type="checkbox"
          checked={studentCanEdit}
          onChange={(e) => control.set("studentCanEdit", e.target.checked)}
          className="h-4 w-4 accent-blue-600"
        />
        Student can edit
      </label>
      <button
        onClick={() => {
          if (confirm("Clear the text pad and whiteboard for both of you?")) clearLesson(doc);
        }}
        className="rounded-md px-2 py-1 text-neutral-400 hover:text-red-400"
      >
        Clear
      </button>
    </div>
  );
}

// Both cameras stay visible at all times, whatever is on the main stage.
function CameraSidebar() {
  const cameras = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }], {
    onlySubscribed: false,
  });

  return (
    <aside className="flex shrink-0 gap-2 md:w-72 md:flex-col">
      {cameras.map((trackRef) => (
        <ParticipantTile
          key={trackRef.participant.identity}
          trackRef={trackRef}
          className="aspect-video flex-1 md:flex-none"
        />
      ))}
    </aside>
  );
}
