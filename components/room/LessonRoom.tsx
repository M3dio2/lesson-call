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
import { RoomEvent, Track, type TrackPublication } from "livekit-client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import * as Y from "yjs";
import TextPad from "@/components/board/TextPad";
import { useYjsSync } from "@/lib/sync/useYjsSync";
import { useYMapValue } from "@/lib/sync/useYMapValue";

const Whiteboard = dynamic(() => import("@/components/board/Whiteboard"), {
  ssr: false,
  loading: () => <p className="p-4 text-neutral-400">Loading whiteboard…</p>,
});

export type Role = "teacher" | "student";

type Props = {
  token: string;
  role: Role;
  onLeave: () => void;
};

export default function LessonRoom({ token, role, onLeave }: Props) {
  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      connect
      video
      audio
      onDisconnected={onLeave}
      data-lk-theme="default"
      className="flex h-dvh flex-col"
    >
      <LessonContent role={role} />
      <ControlBar
        variation="minimal"
        controls={{ microphone: true, camera: true, screenShare: true, chat: false, leave: true }}
      />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

type StageTab = "screen" | "text" | "board";

// The lesson Y.Doc holds everything shared:
// - the text pad (Tiptap's default XML fragment)
// - "board": whiteboard elements
// - "control": teacher-owned settings (stage tab; edit permission in M7)
// It lives inside LiveKitRoom so it can sync over the room's data channel.
// A new document per join; the peer fills it in on connect (saved to Supabase in M7).
function LessonContent({ role }: { role: Role }) {
  const room = useRoomContext();
  const [doc] = useState(() => new Y.Doc());
  const control = useMemo(() => doc.getMap<unknown>("control"), [doc]);
  useYjsSync(doc, "lesson");

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
  const screenShares = useTracks([Track.Source.ScreenShare]);
  const screen = screenShares.at(-1);
  const isTeacher = role === "teacher";

  const tabs: { id: StageTab; label: string }[] = [
    { id: "screen", label: screen ? "Screen ●" : "Screen" },
    { id: "text", label: "Text" },
    { id: "board", label: "Whiteboard" },
  ];

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-neutral-900">
      <nav className="flex items-center gap-1 p-1">
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
        {!isTeacher && (
          <span className="ml-auto px-2 text-xs text-neutral-500">
            Your teacher chooses the view
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
        <TextPad doc={doc} />
      </div>
      {tab === "board" && (
        <div className="min-h-0 flex-1 bg-white">
          <Whiteboard doc={doc} />
        </div>
      )}
    </main>
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
