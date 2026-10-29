"use client";

import { ControlBar, useRemoteParticipants } from "@livekit/components-react";
import { MediaDeviceFailure, Track } from "livekit-client";
import { MicOff, Pencil, PencilOff } from "lucide-react";
import { useState } from "react";
import { muteMicrophones } from "@/lib/mute";
import type { Role } from "./LessonRoom";
import { deviceProblemMessage } from "./StatusBanner";

// Bottom bar: the teacher's own controls (mute student, student can edit), then LiveKit's
// mic · camera · share screen · leave.
export default function RoomControls({
  role,
  lessonId,
  studentCanEdit,
  onStudentCanEditChange,
  isPhone,
  onProblem,
}: {
  role: Role;
  lessonId?: string;
  studentCanEdit: boolean;
  onStudentCanEditChange: (canEdit: boolean) => void;
  isPhone: boolean;
  onProblem: (message: string) => void;
}) {
  return (
    <div className="room-controls flex flex-wrap items-center justify-center gap-2 border-t border-line bg-paper px-2">
      {role === "teacher" && lessonId && (
        <>
          <MuteStudentButton lessonId={lessonId} onProblem={onProblem} />
          <StudentCanEditToggle canEdit={studentCanEdit} onChange={onStudentCanEditChange} />
          <span aria-hidden className="mx-1 h-6 w-px bg-line" />
        </>
      )}
      <ControlBar
        variation="minimal"
        // Phone browsers can't share their screen.
        controls={{
          microphone: true,
          camera: true,
          screenShare: !isPhone,
          chat: false,
          leave: true,
        }}
        onDeviceError={({ source, error }) =>
          onProblem(
            deviceProblemMessage(
              MediaDeviceFailure.getFailure(error),
              source === Track.Source.Microphone ? "audioinput" : "videoinput",
            ),
          )
        }
      />
    </div>
  );
}

function MuteStudentButton({
  lessonId,
  onProblem,
}: {
  lessonId: string;
  onProblem: (message: string) => void;
}) {
  const others = useRemoteParticipants();
  const [busy, setBusy] = useState(false);

  return (
    <button
      className="lk-button"
      title="Mute the student's microphone"
      aria-label="Mute the student's microphone"
      disabled={busy || others.length === 0}
      onClick={() => {
        setBusy(true);
        muteMicrophones(lessonId)
          .catch(() => onProblem("Muting didn't work. Please try again."))
          .finally(() => setBusy(false));
      }}
    >
      <MicOff size={16} aria-hidden />
      Mute student
    </button>
  );
}

// Published in the teacher's participant attributes, so the student's editors follow it
// (lib/sync/useStudentCanEdit.ts).
function StudentCanEditToggle({
  canEdit,
  onChange,
}: {
  canEdit: boolean;
  onChange: (canEdit: boolean) => void;
}) {
  const label = canEdit
    ? "The student can edit the text and drawing. Click to make it view only."
    : "The student can only view the text and drawing. Click to let them edit.";

  return (
    <button
      className={`lk-button student-edit-toggle ${canEdit ? "is-on" : ""}`}
      title={label}
      aria-label="Student can edit"
      aria-pressed={canEdit}
      onClick={() => onChange(!canEdit)}
    >
      {canEdit ? <Pencil size={16} aria-hidden /> : <PencilOff size={16} aria-hidden />}
    </button>
  );
}
