"use client";

import { useRoomContext } from "@livekit/components-react";
import { type RemoteParticipant, RoomEvent } from "livekit-client";
import { useCallback, useEffect, useEffectEvent } from "react";
import { isTeacher } from "./useStudentCanEdit";

const TOPIC = "nudge";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// The teacher's (!) button: a one-off message telling the student's board which tab to show.
// Deliberately not stored in the Y.Doc, so it isn't replayed when someone joins or refreshes.
// Only messages from the teacher count, so another student with the link can't send one.
export function useNudge<T extends string>(
  isValid: (tab: string) => tab is T,
  onNudge: (tab: T) => void,
) {
  const room = useRoomContext();
  const handle = useEffectEvent((tab: T) => onNudge(tab));
  const valid = useEffectEvent((tab: string) => isValid(tab));

  useEffect(() => {
    const onData = (
      payload: Uint8Array,
      from: RemoteParticipant | undefined,
      _kind: unknown,
      topic?: string,
    ) => {
      if (topic !== TOPIC || !isTeacher(from)) return;
      try {
        const { tab } = JSON.parse(decoder.decode(payload));
        if (typeof tab === "string" && valid(tab)) handle(tab as T);
      } catch {
        // Ignore malformed messages.
      }
    };
    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [room]);

  return useCallback(
    (tab: T) =>
      room.localParticipant
        .publishData(encoder.encode(JSON.stringify({ tab })), { reliable: true, topic: TOPIC })
        .catch(console.error),
    [room],
  );
}
