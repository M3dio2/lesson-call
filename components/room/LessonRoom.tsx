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
        <MainStage />
        <CameraSidebar />
      </div>
      <ControlBar
        variation="minimal"
        controls={{ microphone: true, camera: true, screenShare: true, chat: false, leave: true }}
      />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

// Shows the most recent screen share. Text pad and whiteboard tabs are added in M5/M6.
function MainStage() {
  const screenShares = useTracks([Track.Source.ScreenShare]);
  const screen = screenShares.at(-1);

  return (
    <main className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-neutral-900">
      {screen ? (
        <VideoTrack trackRef={screen} className="h-full w-full object-contain" />
      ) : (
        <p className="p-4 text-center text-neutral-400">
          Nobody is sharing their screen. Click “Share screen” below to start.
        </p>
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
