"use client";

import "@livekit/components-styles";
import {
  ControlBar,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  isTrackReference,
  type TrackReferenceOrPlaceholder,
  useTracks,
  VideoTrack,
} from "@livekit/components-react";
import { MediaDeviceFailure, Track } from "livekit-client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { Group, Panel, Separator, useDefaultLayout, usePanelRef } from "react-resizable-panels";
import * as Y from "yjs";
import TextPad from "@/components/board/TextPad";
import Button from "@/components/ui/Button";
import UiPanel from "@/components/ui/Panel";
import TabBar from "@/components/ui/TabBar";
import StatusBanner, { deviceProblemMessage } from "./StatusBanner";
import { fromBase64 } from "@/lib/sync/base64";
import { clearLesson } from "@/lib/sync/clearLesson";
import { useLessonPersistence } from "@/lib/sync/useLessonPersistence";
import { useNudge } from "@/lib/sync/useNudge";
import { useYjsSync } from "@/lib/sync/useYjsSync";
import { useYMapValue } from "@/lib/sync/useYMapValue";

const Whiteboard = dynamic(() => import("@/components/board/Whiteboard"), {
  ssr: false,
  loading: () => <p className="p-4 text-ink-muted">Loading whiteboard…</p>,
});

export type Role = "teacher" | "student";

// Teacher only: the lesson to load from and save to Supabase.
export type SavedLesson = {
  id: string;
  inviteSlug: string;
  snapshot: string | null; // null = start with a clean board
  saveBoard: boolean; // quick calls aren't saved
};

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
      className="lesson-room flex flex-col"
      // Inline on purpose: LiveKit's unlayered `.lk-room-container { height: 100% }` beats
      // Tailwind's h-dvh, which collapsed the stage on phones.
      style={{ height: "100dvh" }}
    >
      <StatusBanner
        role={role}
        inviteSlug={lesson?.inviteSlug}
        problem={problem}
        onDismissProblem={() => setProblem(null)}
      />
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

type BoardTab = "text" | "draw";

// The lesson Y.Doc holds everything shared:
// - the text pad (Tiptap's default XML fragment)
// - "board": whiteboard elements
// - "control": teacher-owned settings ("studentCanEdit")
// It lives inside LiveKitRoom so it can sync over the room's data channel.
// The teacher's doc starts from the saved snapshot; the student's starts empty and is filled
// by the peer on connect.
function LessonContent({ role, lesson }: { role: Role; lesson?: SavedLesson }) {
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
  useLessonPersistence(doc, lesson?.saveBoard ? lesson.id : undefined);

  return <LessonLayout doc={doc} control={control} role={role} />;
}

// Desktop layout (docs/DESIGN.md): screen stage | board panel, camera strip below.
// Every divider can be dragged; sizes are remembered per browser. Only sizes the user
// chose are saved, not the automatic collapse of the stage.
function LessonLayout({ doc, control, role }: { doc: Y.Doc; control: Y.Map<unknown>; role: Role }) {
  const screen = useTracks([Track.Source.ScreenShare]).at(-1);
  const isSharing = Boolean(screen);
  const outer = useDefaultLayout({ id: "lesson-outer", onlySaveAfterUserInteractions: true });
  const inner = useDefaultLayout({ id: "lesson-inner", onlySaveAfterUserInteractions: true });
  const stageRef = usePanelRef();

  // The screen stage only takes space while someone is sharing.
  useEffect(() => {
    if (isSharing) stageRef.current?.expand();
    else stageRef.current?.collapse();
  }, [isSharing, stageRef]);

  return (
    <Group
      orientation="vertical"
      defaultLayout={outer.defaultLayout}
      onLayoutChanged={outer.onLayoutChanged}
      className="min-h-0 flex-1 p-2"
    >
      <Panel id="content" minSize="35%">
        <Group
          orientation="horizontal"
          defaultLayout={inner.defaultLayout}
          onLayoutChanged={inner.onLayoutChanged}
        >
          <Panel
            id="stage"
            panelRef={stageRef}
            collapsible
            collapsedSize="0%"
            minSize="25%"
            defaultSize="60%"
          >
            <ScreenStage screen={screen} />
          </Panel>
          <ResizeHandle orientation="vertical-line" />
          <Panel id="board" minSize="25%">
            <BoardPanel doc={doc} control={control} role={role} />
          </Panel>
        </Group>
      </Panel>
      <ResizeHandle orientation="horizontal-line" />
      <Panel id="cameras" defaultSize="22%" minSize="10%" maxSize="45%">
        <CameraStrip />
      </Panel>
    </Group>
  );
}

function ResizeHandle({ orientation }: { orientation: "vertical-line" | "horizontal-line" }) {
  const vertical = orientation === "vertical-line";
  return (
    <Separator className={`group flex items-center justify-center ${vertical ? "w-2" : "h-2"}`}>
      <div
        className={`rounded-full bg-line transition-colors group-hover:bg-accent group-data-[separator=active]:bg-accent ${
          vertical ? "h-10 w-1" : "h-1 w-10"
        }`}
      />
    </Separator>
  );
}

function ScreenStage({ screen }: { screen?: TrackReferenceOrPlaceholder }) {
  return (
    <div className="flex h-full items-center justify-center overflow-hidden rounded-panel bg-video">
      {screen && isTrackReference(screen) ? (
        <VideoTrack
          trackRef={screen}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      ) : (
        <p className="p-4 text-center text-sm text-paper/70">Nobody is sharing their screen.</p>
      )}
    </div>
  );
}

// Text and whiteboard. Each person picks their own tab.
// The text pad stays mounted (keeps the editor); the whiteboard mounts only when shown,
// because Excalidraw can't measure a hidden canvas.
function BoardPanel({ doc, control, role }: { doc: Y.Doc; control: Y.Map<unknown>; role: Role }) {
  const [tab, setTab] = useState<BoardTab>("text");
  const [highlight, setHighlight] = useState<BoardTab | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const studentCanEdit = useYMapValue<boolean>(control, "studentCanEdit") ?? false;
  const isTeacher = role === "teacher";
  const canEdit = isTeacher || studentCanEdit;

  // Student: the teacher pressed (!) — show that tab and mark it briefly.
  const sendNudge = useNudge(isBoardTab, (nudged) => {
    if (isTeacher) return;
    setTab(nudged);
    setHighlight(nudged);
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlight(null), 1500);
  });

  return (
    <UiPanel
      className="h-full"
      header={
        <>
          <TabBar
            tabs={[
              { id: "text", label: "Text" },
              { id: "draw", label: "Draw" },
            ]}
            value={tab}
            onChange={setTab}
            highlight={highlight}
          />
          {isTeacher ? (
            <TeacherControls
              doc={doc}
              control={control}
              studentCanEdit={studentCanEdit}
              onNudge={() => sendNudge(tab)}
            />
          ) : (
            <span className="ml-auto px-2 text-xs text-ink-muted">
              {studentCanEdit ? "You can edit" : "View only"}
            </span>
          )}
        </>
      }
    >
      <div className={`min-h-0 flex-1 ${tab === "text" ? "flex" : "hidden"}`}>
        <TextPad doc={doc} editable={canEdit} />
      </div>
      {tab === "draw" && (
        <div className="min-h-0 flex-1">
          <Whiteboard doc={doc} editable={canEdit} />
        </div>
      )}
    </UiPanel>
  );
}

const isBoardTab = (tab: string): tab is BoardTab => tab === "text" || tab === "draw";

function TeacherControls({
  doc,
  control,
  studentCanEdit,
  onNudge,
}: {
  doc: Y.Doc;
  control: Y.Map<unknown>;
  studentCanEdit: boolean;
  onNudge: () => void;
}) {
  const [sent, setSent] = useState(false);

  return (
    <div className="ml-auto flex items-center gap-2 text-sm">
      <Button
        variant="secondary"
        size="sm"
        title="Show the student this tab"
        aria-label="Show the student this tab"
        onClick={() => {
          onNudge();
          setSent(true);
          setTimeout(() => setSent(false), 1500);
        }}
        className="w-8 rounded-full font-bold"
      >
        {sent ? "✓" : "!"}
      </Button>
      <label className="flex cursor-pointer items-center gap-2 text-ink">
        <input
          type="checkbox"
          checked={studentCanEdit}
          onChange={(e) => control.set("studentCanEdit", e.target.checked)}
          className="h-4 w-4 accent-ok"
        />
        Student can edit
      </label>
      <Button
        variant="danger"
        size="sm"
        onClick={() => {
          if (confirm("Clear the text pad and whiteboard for both of you?")) clearLesson(doc);
        }}
      >
        Clear
      </Button>
    </div>
  );
}

// Both cameras, side by side. Tiles take the strip's height, so the strip (not the tiles)
// decides how much room the cameras use.
function CameraStrip() {
  const cameras = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }], {
    onlySubscribed: false,
  });

  return (
    <div className="flex h-full justify-center gap-2 overflow-hidden rounded-panel bg-surface-2 p-2">
      {cameras.map((trackRef) => (
        <ParticipantTile
          key={trackRef.participant.identity}
          trackRef={trackRef}
          // Inline: LiveKit's unlayered CSS beats Tailwind sizes (docs/DESIGN.md).
          style={{ height: "100%", aspectRatio: "16 / 9", flex: "0 1 auto", minWidth: 0 }}
        />
      ))}
    </div>
  );
}
