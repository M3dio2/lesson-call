# Roadmap

Tick items off as they're done. One milestone per working session.

## M1: Scaffold
- [x] Next.js + TypeScript + Tailwind project
- [x] `CLAUDE.md`, `docs/ROADMAP.md`, `.env.local.example`
- [ ] GitHub repo created and pushed
- [ ] Vercel project linked and first deploy

## M2: Video call
- [ ] LiveKit Cloud project created; keys in `.env.local` and Vercel
- [ ] `/api/livekit-token` route (hard-coded room for now)
- [ ] Room page: two camera tiles, mic and camera toggles, leave button

## M3: Screen share layout
- [ ] Share-screen button
- [ ] Screen on the main stage, both cameras in the sidebar

## M4: Auth + lessons
- [ ] Supabase project; `lessons` table + RLS migration
- [ ] Teacher login, dashboard, create lesson, copy invite link
- [ ] Student join page (`/join/[slug]`, enter name)
- [ ] Token route checks auth or slug and sets the role

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
