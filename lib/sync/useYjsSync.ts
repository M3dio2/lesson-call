"use client";

import { useRoomContext } from "@livekit/components-react";
import { RoomEvent, type RemoteParticipant } from "livekit-client";
import { useEffect } from "react";
import * as Y from "yjs";
import { onBytes, sendBytes } from "./transport";

const REMOTE = "remote";

// Keeps a Y.Doc in sync with everyone in the LiveKit room.
// - Local edits are broadcast as Yjs updates.
// - When two participants see each other (join, late join, reconnect), each sends its
//   state vector and the other replies with exactly what is missing. This works both ways,
//   so whoever has the newer content, nothing is lost.
export function useYjsSync(doc: Y.Doc, name: string) {
  const room = useRoomContext();

  useEffect(() => {
    const topics = { stateVector: `${name}:sv`, diff: `${name}:diff`, update: `${name}:update` };

    const greet = (identities: string[]) => {
      if (identities.length === 0) return;
      sendBytes(room, topics.stateVector, Y.encodeStateVector(doc), identities).catch(
        console.error,
      );
    };
    const greetEveryone = () => greet([...room.remoteParticipants.keys()]);
    const onParticipantConnected = (p: RemoteParticipant) => greet([p.identity]);

    const onLocalUpdate = (update: Uint8Array, origin: unknown) => {
      if (origin === REMOTE || room.remoteParticipants.size === 0) return;
      sendBytes(room, topics.update, update).catch(console.error);
    };
    const applyRemote = (bytes: Uint8Array) => Y.applyUpdate(doc, bytes, REMOTE);

    const unsubscribe = [
      onBytes(room, topics.stateVector, (stateVector, from) => {
        sendBytes(room, topics.diff, Y.encodeStateAsUpdate(doc, stateVector), [from]).catch(
          console.error,
        );
      }),
      onBytes(room, topics.diff, applyRemote),
      onBytes(room, topics.update, applyRemote),
    ];
    doc.on("update", onLocalUpdate);
    room.on(RoomEvent.Connected, greetEveryone);
    room.on(RoomEvent.Reconnected, greetEveryone);
    room.on(RoomEvent.ParticipantConnected, onParticipantConnected);
    greetEveryone();

    return () => {
      unsubscribe.forEach((off) => off());
      doc.off("update", onLocalUpdate);
      room.off(RoomEvent.Connected, greetEveryone);
      room.off(RoomEvent.Reconnected, greetEveryone);
      room.off(RoomEvent.ParticipantConnected, onParticipantConnected);
    };
  }, [room, doc, name]);
}
