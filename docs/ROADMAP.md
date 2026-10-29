# Roadmap

Tick items off as they're done. One milestone per working session.

## M1: Scaffold
- [x] Next.js + TypeScript + Tailwind project
- [x] `CLAUDE.md`, `docs/ROADMAP.md`, `.env.local.example`
- [x] GitHub repo created and pushed (github.com/M3dio2/lesson-call)
- [x] Vercel project linked and first deploy (lesson-call-five.vercel.app)

## M2: Video call
- [x] LiveKit Cloud project created; keys in `.env.local` and Vercel
- [x] `/api/livekit-token` route (hard-coded room for now)
- [x] Room page: two camera tiles, mic and camera toggles, leave button (`/room`, temporary)

## M3: Screen share layout
- [x] Share-screen button (with tab audio)
- [x] Screen on the main stage, both cameras in the sidebar

## M4: Auth + lessons
- [x] Supabase project; `lessons` table + RLS migration
- [x] Teacher login, dashboard, create lesson, copy invite link
- [x] Student join page (`/join/[slug]`, enter name)
- [x] Token route checks auth or slug and sets the role

## M5: Shared text pad
- [x] LiveKit data-stream transport (`lib/sync/transport.ts`)
- [x] Tiptap + Yjs text pad, synced, with sync on join (`useYjsSync`)

## M6: Whiteboard
- [x] Excalidraw tab synced over the data channel (`board` Y.Map, copies in and out)
- [x] Stage tabs (Screen / Text / Whiteboard); student follows teacher's tab; auto-switch to Screen on share

## M7: Permissions + persistence
- [x] "Student can edit" toggle (read-only plus ignoring student edits, with pending-update resync)
- [x] Lesson doc snapshot saved to Supabase (`doc_snapshot`) and restored; "Clear" button

## M8: Polish + production
- [x] Error states: camera or mic denied, peer left, reconnecting (`StatusBanner`)
- [x] Mobile check for the student view (fixed: LiveKit CSS collapsed the stage)
- [x] Production deploy + real call test from another device (phone on mobile data)

# Design milestones
See `docs/DESIGN.md` for the principles and tokens these follow.

## D1: Design system + simple pages
- [x] `docs/DESIGN.md`: principles, tokens (contrast-checked), components, layout, do/don't
- [x] Tokens in `app/globals.css`; shared `components/ui/` (Button, Field, Panel, TabBar)
- [x] Login, dashboard and join pages restyled

## D1b: Dashboard redesign
- [x] Student cards (click to open the room), "Waiting" badge via LiveKit, "Last lesson" date
- [x] Quick call: one-off room, nothing saved, ended from the dashboard or after 12 h
- [x] Board kept until the next lesson (fresh board after 3 h without activity)
- [x] "Copy student link" in the room's waiting banner

## D2: Resizable lesson layout (desktop)
- [x] Screen stage | Board panel side by side; camera strip below; drag to resize
- [x] Screen stage collapses when nobody shares; sizes remembered per browser
- [x] Remove teacher-driven tab following

## D3: Board panel + (!) nudge + room restyle
- [x] Board header: local Text/Draw tabs; teacher controls (!) nudge, edit toggle, Clear
- [x] Student's board switches on nudge, with a short highlight
- [x] Room (banners, control bar, tiles, toolbar) in the paper palette

## D4: Phone layout
- [x] Screen share fills the screen; the other person's camera overlaps it; no self-view; board hidden
- [ ] Real phone test on the live site

## F: Fixes (planned with the user; do these before D5)
### F1: Only one quick call, ended when the teacher leaves
- [x] "Start a quick call" always works; it ends any existing quick call first
- [x] Teacher's Leave (not a dropped connection) ends the quick call: row deleted, LiveKit room closed
- [x] Dashboard (15 s refresh) deletes an empty quick call, with a 2-minute grace period after creation
- [x] "End" also closes the LiveKit room (`RoomServiceClient.deleteRoom`). The student sees "The call has ended." (check `DisconnectReason.ROOM_DELETED` in `StudentJoin`)

### F2: Big cameras when nobody shares (desktop)
- [x] No screen share: the left stage shows the other person's camera large, with a small self-view in a corner. The board is on the right (about 35%, resizable). The camera strip collapses.
- [x] Screen share: unchanged (screen | board, camera strip below)
- [x] Alone in the room: own camera fills the stage

### F3: One join per person
- [x] Teacher joins with a fixed identity (`teacher-<user id>`); LiveKit then drops the older tab
- [x] Student: one identity per browser and lesson (kept in `localStorage`), same effect
- [x] The dropped tab shows "You joined this lesson in another tab." (`DisconnectReason.DUPLICATE_IDENTITY`) instead of rejoining

### F4: Whiteboard fixes
- [x] Excalidraw redraws when its panel is resized (`ResizeObserver` → `api.refresh()`)
- [x] Custom, slimmer main menu (Excalidraw's `<MainMenu>` with only the useful items; no help, links or socials)
- [x] No library (book) button; tool buttons shrink below 440px board width; board panel at least 340px wide

### F5: Teacher's name
- [x] Teacher's display name stored in Supabase user metadata (no migration)
- [x] Asked on the dashboard the first time (no sign-up page exists); editable later
- [x] Token route uses it instead of "Teacher"

### F6: Teacher controls as icons, in the control bar
- [x] Icon set: `lucide-react` (ISC licence); every icon button has a tooltip and `aria-label`
- [x] "Student can edit" becomes an icon toggle (pencil / pencil-off) in the bottom control bar, teacher only
- [x] "Clear" becomes a trash-can icon in the board header (same place), still with a confirmation
- [x] Muting (was F3): "Mute student" in the control bar (mutes everyone but the teacher); mute button when hovering the student's tile
- [x] Server route `/api/mute`: checks the teacher owns the lesson, then `RoomServiceClient.mutePublishedTrack`
- [x] The student can unmute themselves (LiveKit can't force a mic on) and sees "Your teacher muted your microphone."

# Design refresh

## D5: Bring it to life ("Highlighter")
Direction chosen with the user (mock-up: claude.ai/artifact/96VPE4fW6muQeC482KAAjt). A yellow marker used the way a teacher marks a text.
Rules: one marker gesture per screen; draw once, then rest (only the loading line loops); yellow means "look here", never a background; motion under 1 s and off with reduced motion; during a call only the tab underline and the (!) circle move.

### D5a: Name, type and marker basics
- [x] Rename to "TeachingTime" everywhere visible (tab title, login, dashboard, join page, room messages)
- [x] Tokens: `marker` (#F4D35E), `marker-soft`, `marker-ink`; display font Bricolage Grotesque for the name and headings
- [x] Wordmark component: dark "T" tile with yellow letter + "Teaching" underlined by a drawn marker stroke
- [x] `app/icon.svg` tab icon (the "T" tile) replacing the Next.js favicon
- [x] `Marker` component: hand-drawn SVG strokes (underline, circle, tick, wavy line) that draw themselves; reduced-motion safe
- [x] `docs/DESIGN.md` updated with the marker rules and tokens

### D5b: Marker moments
- [x] Dashboard: marker circle around "Waiting"; cards lift onto a yellow hover shadow
- [x] Board: active Text/Draw tab gets a marker underline instead of a filled box
- [x] (!) nudge: the marker circles the tab on the student's board
- [x] Student join page: "Join your lesson" with "lesson" underlined

### D5c: Entering, joining and leaving
- [x] Loading screen "Getting your lesson ready" with the looping marker line (entering); "Leaving the lesson" (leaving)
- [x] Someone joins: their camera fades in, plus a small "Anna joined" toast
- [x] Call ended / left: marker tick and "See you next time!"

### D5d: One wait, one screen (next session)
Rule: a wait that takes you into or out of a lesson shows the full loading screen, without breaks. Small actions that keep you on the page (save name, add student) get a pending state on their button.
- [ ] Dashboard's Suspense fallback ("Loading…") becomes the loading screen, so "Leaving the lesson" flows straight into it until the students are shown (the 15 s auto-refresh doesn't trigger it)
- [ ] "Start a quick call" switches to "Getting your lesson ready" on click (form pending state) and it stays until connected; no second screen in between
- [ ] Check that opening a student's card shows the loading screen at once too
- [ ] Buttons for small actions (Save name, Add, Remove/End) show a pending state

### Still to decide
- [ ] Dark ink instead of brown for the main buttons
- [ ] Arrow doodle pointing to "Add a student" on an empty dashboard
- [ ] Optional: rename the Vercel project (e.g. teachingtime.vercel.app; the user does this in Vercel)

## M10: Faster for Europe
Supabase is in US West and Vercel functions in North America, while the teacher (and likely the students) are in Europe: each page load waits on several transatlantic round trips (measured 0.3–0.4 s each from the teacher's machine). Video is unaffected (LiveKit picks the nearest edge).
- [ ] Now: set Vercel's Function Region to match Supabase (us-west-1 → `sfo1`, us-west-2 → `pdx1`); the user does this in Vercel
- [ ] New Supabase project in Frankfurt (`eu-central-1`): run `supabase/migrations/` in order, recreate the teacher account, copy the `lessons` rows
- [ ] Swap the Supabase keys in `.env.local` and Vercel (the user pastes them); set Vercel's Function Region to `fra1`
- [ ] Check: dashboard and joining times before and after (dev server log: "application-code")

## M9: More teachers
The data is already per teacher (`lessons.teacher_id` + RLS, name in user metadata); what's missing is getting new teachers in.
- [ ] Invite a teacher with Supabase's "Invite user" email; a "set your password" page for the link
- [ ] "Forgot password" on the login page, with a reset page
- [ ] Check the free tiers: LiveKit minutes are shared by all teachers; Vercel Hobby is non-commercial

## D6: Scheduling
- [ ] Plan the next lesson per student (date and time), shown on the student card
