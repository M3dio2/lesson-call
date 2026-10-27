@AGENTS.md

# Lesson Call

1-on-1 video lesson app for an English teacher and one student. Like Google Meet, plus:
- Screen share on the main stage while **both cameras stay visible** in a sidebar.
- Shared **text pad** and **whiteboard** tabs that sync instantly.
- Teacher toggles whether the student may edit the text pad and whiteboard.

## Current milestone
**M2: Video call.** See `docs/ROADMAP.md`. Update this line when a milestone is finished.

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
- Secrets (`LIVEKIT_API_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) are used **only** in server code (route handlers). Never prefix them with `NEXT_PUBLIC_`.
- Claude never asks for or handles secret values. The user pastes them in themselves.

## Architecture rules
- **Roles:** the `teacher` or `student` role is put in the LiveKit token metadata by `/api/livekit-token`.
  - Teacher: must be logged in to Supabase.
  - Student: sends the lesson's `invite_slug` plus a display name, and needs no account.
- **Data channel messages** are JSON, typed in `lib/sync/messages.ts`, and each has a `type` field.
  - On connect, a client sends `sync-request`. The peer replies with full state, and only incremental updates follow.
- **Edit permission** is enforced in two places:
  - The student's editors are read-only when permission is off.
  - The teacher's client ignores student updates while permission is off.
- **Snapshots:** the teacher's client saves text and board snapshots to Supabase every 30 seconds and when leaving.

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

## Workflow
- One milestone per session. Start by reading `docs/ROADMAP.md`.
- After building:
  1. `npm run build` and `npm run lint` must pass.
  2. The user tests with two browser windows (normal plus incognito acting as the student).
  3. Commit on a feature branch, then merge to `main`. Vercel deploys from `main`.
- Then tick the milestone off in `docs/ROADMAP.md` and update "Current milestone" above.
- Keep it simple: this is a small, single-teacher app. No premature abstractions.

## Known free-tier caveats
- Vercel Hobby is for non-commercial use. For paid lessons, consider Vercel Pro, or Netlify or Cloudflare Pages.
- Supabase free projects pause after about 1 week of inactivity. Unpause them in the dashboard.
- LiveKit Cloud's free tier has a monthly limit on participant minutes. A 1-hour lesson uses about 120.
