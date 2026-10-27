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
- [ ] Board header: local Text/Draw tabs; teacher controls (!) nudge, edit toggle, Clear
- [ ] Student's board switches on nudge, with a short highlight
- [ ] Room (banners, control bar, tiles, toolbar) in the paper palette

## D4: Phone layout
- [ ] Screen share fills the screen; teacher camera overlaps it; board hidden

## D5: Scheduling
- [ ] Plan the next lesson per student (date and time), shown on the student card
