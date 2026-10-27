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
- [ ] LiveKit data-channel transport + message types
- [ ] Tiptap + Yjs text pad, synced, with sync on join

## M6: Whiteboard
- [ ] Excalidraw tab synced over the data channel
- [ ] Stage tabs (Screen / Text / Whiteboard); student follows teacher's tab

## M7: Permissions + persistence
- [ ] "Student can edit" toggle (read-only plus ignoring student edits)
- [ ] Text and board snapshots saved to Supabase and restored on rejoin

## M8: Polish + production
- [ ] Error states: camera or mic denied, peer left, reconnecting
- [ ] Mobile and tablet check for the student view
- [ ] Production deploy + real call test from another device
