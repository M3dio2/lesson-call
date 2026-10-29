# Architecture details

Read this before touching `lib/sync/`, the room (`components/room/`) or the API routes. `CLAUDE.md` has the short version.

## Roles and accounts
- The `teacher` or `student` role is put in the LiveKit token metadata by `/api/livekit-token`.
  - Teacher: must be logged in to Supabase.
  - Student: sends the lesson's `invite_slug` plus a display name, and needs no account.
- **Teacher accounts:** teachers sign up at `/signup` (name, email, password). The name goes into Supabase user metadata (`display_name`); the dashboard asks for it if it's missing, and the token route reads it with `getUser()`.
  - Email links (confirm sign-up, reset password) go to `/auth/confirm`, which calls `verifyOtp` and redirects (`next`, same-site paths only); bad or used links land on `/link-expired`. The Supabase email templates must point there (see the comment in `app/auth/confirm/route.ts`).
  - Emails are sent through custom SMTP (the teacher's Gmail for now): Supabase's built-in mailer only reaches its own team.
  - `proxy.ts`: `/`, `/signup`, `/forgot-password` are for logged-out visitors; `/dashboard`, `/lesson`, `/reset-password` need a login.

## Lessons
- `lessons.kind` is `student` (fixed link; board kept until the next lesson) or `quick` (one-off; not saved; deleted with "End" or after 12 hours).
- `lessons.last_active_at` is set by the token route when the teacher joins, and by each save.
  - If it's more than 3 hours old, `app/lesson/[id]/page.tsx` starts with a clean board.

## Shared state
One Yjs `Y.Doc` per join, created in `LessonContent` (`components/room/LessonRoom.tsx`). It holds:
- the text pad: Tiptap's default XML fragment
- `board`: a Y.Map of Excalidraw elements by id, merged with `reconcileElements`
- `control`: a Y.Map of teacher-owned settings, such as `tab` and `studentCanEdit`. Only the teacher's UI writes it.

## Sync
- `lib/sync/useYjsSync.ts` syncs the doc over LiveKit **data streams** (`lib/sync/transport.ts`; no size limit).
- When two peers see each other, they exchange state vectors and the missing updates. Late joins and refreshes recover from the peer.

## Edit permission
Enforced in two places:
- The student's editors are read-only when permission is off (Tiptap's `setEditable`, Excalidraw's `viewModeEnabled`).
- The teacher's client ignores student updates while permission is off.

Details:
- The teacher's filter drops live `update`s from the student, but always accepts full-state `diff`s, so a refreshed page can recover from the peer.
- Dropping a Yjs update leaves later updates from that client "pending", because they depend on it. `useYjsSync` notices pending structs and asks that peer for a diff, which heals the gap. A side effect: edits made while forbidden arrive once permission is back on.

## Snapshots
- `useLessonPersistence` (teacher only) saves the whole Y.Doc as base64 into `lessons.doc_snapshot`.
- It saves every 30 seconds if something changed, when the tab is hidden, and when leaving.
- `app/lesson/[id]/page.tsx` loads the snapshot back into the teacher's doc.

## Teacher actions
- **Muting:** `/api/mute` (teacher only, checks lesson ownership) mutes microphones through LiveKit's server API and sends a server-only data message (`lib/mute.ts`) so the student sees why. LiveKit can't switch a mic back on; the student unmutes themselves.
- **(!) nudge** (`lib/sync/useNudge.ts`): a one-off LiveKit data message (topic `nudge`), not stored in the Y.Doc, so it isn't replayed on join or refresh. The student's board switches to that tab and highlights it.
- **"Clear"** (`lib/sync/clearLesson.ts`) marks whiteboard elements deleted with a higher version, and empties the text fragment.
