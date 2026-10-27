@AGENTS.md

# Lesson Call

1-on-1 video lesson app for an English teacher and one student. Like Google Meet, plus:
- Screen share on the main stage while **both cameras stay visible** in a sidebar.
- Shared **text pad** and **whiteboard** tabs that sync instantly.
- Teacher toggles whether the student may edit the text pad and whiteboard.

## Current milestone
**D3: Board nudge + room restyle.** See `docs/ROADMAP.md` (design milestones D1–D4). Update this line when a milestone is finished.

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4. Next 16 differs from older versions, so check `node_modules/next/dist/docs/` before using Next APIs.
- **LiveKit Cloud** (free tier) for audio, video and screen share, using `livekit-client` and `@livekit/components-react`.
  - The LiveKit **data channel** carries all live sync: Yjs updates, whiteboard changes, and teacher control messages.
  - Supabase is not used for live sync.
- **Supabase** (free tier) for teacher auth (`@supabase/ssr`) and the `lessons` table (with snapshots of the text pad and whiteboard).
- **Text pad:** Tiptap + Yjs. **Whiteboard:** Excalidraw (MIT), loaded with `dynamic(..., { ssr: false })`.
- Hosted on Vercel (Hobby).

## Commands
- `npm run dev`: dev server at http://localhost:3000
- `npm run build`: production build. Must pass before every commit.
- `npm run lint`: ESLint.

## Environment
- Variable names live in `.env.local.example`. Real values go in `.env.local` (gitignored) and in the Vercel project env settings.
- Secrets (`LIVEKIT_API_SECRET`, `SUPABASE_SECRET_KEY`) are used **only** in server code (route handlers). Never prefix them with `NEXT_PUBLIC_`.
- Claude never asks for or handles secret values. The user pastes them in themselves.

## Architecture rules
- **Roles:** the `teacher` or `student` role is put in the LiveKit token metadata by `/api/livekit-token`.
  - Teacher: must be logged in to Supabase.
  - Student: sends the lesson's `invite_slug` plus a display name, and needs no account.
- **Shared state** is one Yjs `Y.Doc` per join, created in `LessonContent` (`components/room/LessonRoom.tsx`). It holds:
  - the text pad: Tiptap's default XML fragment
  - `board`: a Y.Map of Excalidraw elements by id, merged with `reconcileElements`
  - `control`: a Y.Map of teacher-owned settings, such as `tab` and (M7) `studentCanEdit`. Only the teacher's UI writes it.
- **Sync:** `lib/sync/useYjsSync.ts` syncs the doc over LiveKit **data streams** (`lib/sync/transport.ts`; no size limit).
  - When two peers see each other, they exchange state vectors and the missing updates. Late joins and refreshes recover from the peer.
- **`cacheComponents` is on** (in `next.config.ts`). Any component that reads `cookies()`, `params` or Supabase data must sit inside `<Suspense>`, or the build fails.
  - Pattern: the page is sync; an inner async component does the read.
  - `partialPrefetching` can prerender with cookies available, so `Date.now()` (used by Supabase) still errors. `createClient()` in `lib/supabase/server.ts` therefore calls `await connection()` first.
- **Auth redirects** live in `proxy.ts` (Next 16's name for middleware).
- **Lesson kinds:** `lessons.kind` is `student` (fixed link; board kept until the next lesson) or `quick` (one-off; not saved; deleted with "End" or after 12 hours).
  - `lessons.last_active_at` is set by the token route when the teacher joins, and by each save.
  - If it's more than 3 hours old, `app/lesson/[id]/page.tsx` starts with a clean board.
- **Teacher account:** created by hand in the Supabase dashboard, with sign-ups disabled. There is no sign-up page.
- **Edit permission** is enforced in two places:
  - The student's editors are read-only when permission is off.
  - The teacher's client ignores student updates while permission is off.
- **Snapshots:** `useLessonPersistence` (teacher only) saves the whole Y.Doc as base64 into `lessons.doc_snapshot`.
  - It saves every 30 seconds if something changed, when the tab is hidden, and when leaving.
  - `app/lesson/[id]/page.tsx` loads the snapshot back into the teacher's doc.
- **Edit permission details:**
  - The teacher's filter drops live `update`s from the student, but always accepts full-state `diff`s, so a refreshed page can recover from the peer.
  - Dropping a Yjs update leaves later updates from that client "pending", because they depend on it. `useYjsSync` notices pending structs and asks that peer for a diff, which heals the gap. A side effect: edits made while forbidden arrive once permission is back on.
  - The read-only UI uses Tiptap's `setEditable` and Excalidraw's `viewModeEnabled`.
- **"Clear"** (`lib/sync/clearLesson.ts`) marks whiteboard elements deleted with a higher version, and empties the text fragment.

## Layout
- `app/`: routes
  - `dashboard/`: teacher's lesson list
  - `lesson/[id]/`: teacher room
  - `join/[slug]/`: student join
  - `api/livekit-token/`: token route
- `components/room/`: video layout and controls
- `components/board/`: TextPad, Whiteboard
- `lib/sync/`: data-channel transport and Yjs provider
- `lib/supabase/`: Supabase clients
- `supabase/migrations/`: SQL. Run it manually in the Supabase SQL editor.

## Design
- **Read `docs/DESIGN.md` before any UI work.** It holds the principles, colour tokens and shared components (`components/ui/`).
- Use token classes (`bg-paper`, `text-ink-muted`, `bg-accent`, …), never raw hex values or `neutral-*`/`blue-*`.
- If CSS changes don't show up in `npm run dev`, Turbopack's cache is stale. Stop the server, delete `.next/dev` and restart. The browser may also need a hard reload.

## Workflow
- One milestone per session. Start by reading `docs/ROADMAP.md`.
- After building:
  1. `npm run build` and `npm run lint` must pass.
  2. The user tests with two browser windows (normal plus incognito acting as the student).
  3. Commit on a feature branch, then merge to `main`. Vercel deploys from `main`.
- Then tick the milestone off in `docs/ROADMAP.md` and update "Current milestone" above.
- Git branch switches can make a running `npm run dev` serve 404s for files that were briefly removed. Restart the dev server after committing.
- **Automated browser tests** (Playwright) may only join the lesson titled **"Test"**, and only after asking the user. Real lessons may have the teacher live in them.
- LiveKit's stylesheet is unlayered, so it beats Tailwind utilities on `.lk-*` elements. Use inline `style` for sizes on LiveKit components (see `LessonRoom`).
- Keep it simple: this is a small, single-teacher app. No premature abstractions.

## Known free-tier caveats
- Vercel Hobby is for non-commercial use. For paid lessons, consider Vercel Pro, or Netlify or Cloudflare Pages.
- Supabase free projects pause after about 1 week of inactivity. Unpause them in the dashboard.
- LiveKit Cloud's free tier has a monthly limit on participant minutes. A 1-hour lesson uses about 120.
