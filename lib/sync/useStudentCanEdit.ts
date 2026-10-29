"use client";

import { useRoomContext } from "@livekit/components-react";
import { type Participant, RoomEvent } from "livekit-client";
import { useEffect, useState } from "react";

const KEY = "studentCanEdit";

// The role comes from the token metadata, which only the token route sets.
export function isTeacher(participant?: Participant) {
  try {
    return JSON.parse(participant?.metadata || "{}").role === "teacher";
  } catch {
    return false;
  }
}

// The teacher's "student can edit" switch, kept in the teacher's LiveKit participant attributes.
// Only the teacher's token may update its own attributes (canUpdateOwnMetadata), so a tampered
// student client can't switch it on. It isn't in the Y.Doc for that reason: the teacher accepts
// full-state diffs from the student (to recover after a refresh), and those can change anything.
// Starts off on every join. The student reads it from the teacher; teacher gone = off.
export function useStudentCanEdit(isTeacherSelf: boolean) {
  const room = useRoomContext();
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    if (!isTeacherSelf) return;
    const publish = () =>
      room.localParticipant.setAttributes({ [KEY]: String(canEdit) }).catch(console.error);
    if (room.state === "connected") publish();
    room.on(RoomEvent.Connected, publish);
    return () => {
      room.off(RoomEvent.Connected, publish);
    };
  }, [room, isTeacherSelf, canEdit]);

  useEffect(() => {
    if (isTeacherSelf) return;
    const read = () =>
      setCanEdit(
        [...room.remoteParticipants.values()].some(
          (p) => isTeacher(p) && p.attributes[KEY] === "true",
        ),
      );
    const events = [
      RoomEvent.Connected,
      RoomEvent.ParticipantConnected,
      RoomEvent.ParticipantDisconnected,
      RoomEvent.ParticipantAttributesChanged,
    ] as const;
    events.forEach((event) => room.on(event, read));
    read();
    return () => {
      events.forEach((event) => room.off(event, read));
    };
  }, [room, isTeacherSelf]);

  return [canEdit, setCanEdit] as const;
}
