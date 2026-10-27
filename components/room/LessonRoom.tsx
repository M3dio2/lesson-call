"use client";

import "@livekit/components-styles";
import {
  ControlBar,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";

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
      <div className="flex min-h-0 flex-1 flex-col gap-2 p-2 md:flex-row">
        <main className="flex min-h-0 flex-1 items-center justify-center rounded-lg bg-neutral-900 text-neutral-400">
          Main stage (screen share and boards come in later milestones)
        </main>
        <CameraSidebar />
      </div>
      <ControlBar
        variation="minimal"
        controls={{ microphone: true, camera: true, screenShare: false, chat: false, leave: true }}
      />
      <RoomAudioRenderer />
    </LiveKitRoom>
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
