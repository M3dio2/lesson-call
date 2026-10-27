"use client";

import "@livekit/components-styles";
import {
  ControlBar,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  VideoTrack,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useState } from "react";
import * as Y from "yjs";
import TextPad from "@/components/board/TextPad";
import { useYjsSync } from "@/lib/sync/useYjsSync";

type Props = {
  token: string;
  onLeave: () => void;
};

export default function LessonRoom({ token, onLeave }: Props) {
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
      <LessonContent />
      <ControlBar
        variation="minimal"
        controls={{ microphone: true, camera: true, screenShare: true, chat: false, leave: true }}
      />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

// Lives inside LiveKitRoom so the shared document can sync over the room's data channel.
// A new document per join; the peer fills it in on connect (saved to Supabase in M7).
function LessonContent() {
  const [doc] = useState(() => new Y.Doc());
  useYjsSync(doc, "text");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-2 md:flex-row">
      <MainStage doc={doc} />
      <CameraSidebar />
    </div>
  );
}

type StageTab = "screen" | "text";

// Tabs are local for now; in M6 the student follows the teacher's tab and a whiteboard is added.
// Both panels stay mounted so switching tabs doesn't reload the video or the editor.
function MainStage({ doc }: { doc: Y.Doc }) {
  const [tab, setTab] = useState<StageTab>("text");
  const screenShares = useTracks([Track.Source.ScreenShare]);
  const screen = screenShares.at(-1);

  const tabs: { id: StageTab; label: string }[] = [
    { id: "screen", label: screen ? "Screen ●" : "Screen" },
    { id: "text", label: "Text" },
  ];

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-neutral-900">
      <nav className="flex gap-1 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-md px-3 py-1.5 text-sm ${
              tab === t.id ? "bg-neutral-700 text-white" : "text-neutral-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
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
