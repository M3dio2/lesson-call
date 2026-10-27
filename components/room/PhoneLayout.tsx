"use client";

import {
  isTrackReference,
  ParticipantTile,
  useTracks,
  VideoTrack,
  type TrackReferenceOrPlaceholder,
} from "@livekit/components-react";
import { Track } from "livekit-client";

// Inline sizes: LiveKit's unlayered CSS beats Tailwind on .lk-* elements (docs/DESIGN.md).
const FILL = { width: "100%", height: "100%" } as const;

// Phone layout (docs/DESIGN.md): the screen share has priority and fills the stage; the other
// person's camera overlaps it in a corner. Without a screen share, the other person's camera
// fills the stage. No self-view on phones. The board is not shown (it still syncs in the
// background).
export default function PhoneLayout() {
  const screen = useTracks([Track.Source.ScreenShare]).at(-1);
  const cameras = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }], {
    onlySubscribed: false,
  });
  const other = cameras.find((c) => !c.participant.isLocal);
  const main = screen ?? other;

  return (
    <div className="relative m-2 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-panel bg-video">
      {main ? (
        <Stage trackRef={main} />
      ) : (
        // Alone in the room; the status banner above says who we're waiting for.
        <p className="p-4 text-center text-sm text-paper/70">Nobody else is here yet.</p>
      )}
      {screen && other && (
        <div className="absolute right-2 bottom-2 aspect-video w-[32%] min-w-28 overflow-hidden rounded-md shadow-soft">
          <ParticipantTile trackRef={other} style={FILL} />
        </div>
      )}
    </div>
  );
}

function Stage({ trackRef }: { trackRef: TrackReferenceOrPlaceholder }) {
  if (trackRef.source === Track.Source.ScreenShare && isTrackReference(trackRef)) {
    return <VideoTrack trackRef={trackRef} style={{ ...FILL, objectFit: "contain" }} />;
  }
  return <ParticipantTile trackRef={trackRef} style={FILL} />;
}
