"use client";

import { useConnectionState, useRemoteParticipants } from "@livekit/components-react";
import { ConnectionState, MediaDeviceFailure } from "livekit-client";
import CopyLinkButton from "@/components/CopyLinkButton";
import type { Role } from "./LessonRoom";

// Turns a camera/microphone failure into advice the teacher or student can act on.
export function deviceProblemMessage(failure?: MediaDeviceFailure, kind?: MediaDeviceKind) {
  const device =
    kind === "videoinput"
      ? "camera"
      : kind === "audioinput"
        ? "microphone"
        : "camera or microphone";
  switch (failure) {
    case MediaDeviceFailure.PermissionDenied:
      return `Your browser blocked the ${device}. Click the icon at the left of the address bar, allow the ${device}, then reload the page. If it is already allowed there, allow your browser in your computer's privacy settings (Mac: System Settings → Privacy & Security → Camera / Microphone).`;
    case MediaDeviceFailure.NotFound:
      return `No ${device} was found. Check that it is connected, then reload the page.`;
    case MediaDeviceFailure.DeviceInUse:
      return `Your ${device} is being used by another app (for example Zoom or Teams). Close that app, then reload the page.`;
    default:
      return `Your ${device} could not be started. Reload the page to try again.`;
  }
}

// One line above the lesson: connection problems first, then "waiting for the other person",
// then a device problem (dismissable).
export default function StatusBanner({
  role,
  inviteSlug,
  problem,
  onDismissProblem,
}: {
  role: Role;
  inviteSlug?: string;
  problem: string | null;
  onDismissProblem: () => void;
}) {
  const connection = useConnectionState();
  const others = useRemoteParticipants();

  if (
    connection === ConnectionState.Reconnecting ||
    connection === ConnectionState.SignalReconnecting
  ) {
    return <Banner tone="warning">Connection lost. Reconnecting…</Banner>;
  }
  if (connection === ConnectionState.Connecting) {
    return <Banner tone="info">Connecting to the lesson…</Banner>;
  }
  if (problem) {
    return (
      <Banner tone="error" onDismiss={onDismissProblem}>
        {problem}
      </Banner>
    );
  }
  if (connection === ConnectionState.Connected && others.length === 0) {
    return (
      <Banner
        tone="info"
        action={role === "teacher" && inviteSlug ? <CopyLinkButton slug={inviteSlug} /> : undefined}
      >
        {role === "teacher"
          ? "Waiting for your student to join. Send them the student link."
          : "Waiting for your teacher to join…"}
      </Banner>
    );
  }
  return null;
}

function Banner({
  tone,
  children,
  action,
  onDismiss,
}: {
  tone: "info" | "warning" | "error";
  children: React.ReactNode;
  action?: React.ReactNode;
  onDismiss?: () => void;
}) {
  const colors = {
    info: "bg-neutral-800 text-neutral-200",
    warning: "bg-amber-900/80 text-amber-100",
    error: "bg-red-900/80 text-red-100",
  }[tone];

  return (
    <div className={`mx-2 mt-2 flex items-start gap-3 rounded-md px-3 py-2 text-sm ${colors}`}>
      <p className="flex-1 self-center">{children}</p>
      {action}
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
          ✕
        </button>
      )}
    </div>
  );
}
