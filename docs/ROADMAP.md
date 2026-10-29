# Roadmap

Tick items off as they're done. One milestone per working session. Details of finished work are in git history.

## Done
- M1 Scaffold (Next.js, GitHub, Vercel at lesson-call-five.vercel.app)
- M2 Video call (LiveKit, token route) · M3 Screen share with both cameras in the sidebar
- M4 Auth + lessons (Supabase, RLS, dashboard, student join by slug)
- M5 Shared text pad (Tiptap + Yjs over LiveKit data streams) · M6 Whiteboard (Excalidraw)
- M7 Edit permission + snapshots + Clear · M8 Error states, mobile check, production call test
- D1 Design system (`docs/DESIGN.md`, `components/ui/`) · D1b Dashboard with student cards, quick call
- D2 Resizable desktop layout · D3 Board panel, (!) nudge, room restyle · D4 Phone layout
- F1 One quick call · F2 Big cameras without share · F3 One join per person · F4 Whiteboard fixes · F5 Teacher's name · F6 Icon controls + muting
- D5a–c "Highlighter" refresh (mock-up: claude.ai/artifact/96VPE4fW6muQeC482KAAjt): TeachingTime name, marker tokens and strokes, loading/join/goodbye moments

# Friends test (by Sun 1 Nov 2026)
Goal: friends can sign up as teachers and give lessons. Order matters: move Supabase to Europe **before** friends create accounts, and check security **before** opening sign-up.

## S1: Speed (was M10)
Vercel functions ran in North America while Supabase was in US West, so each page waited on several long round trips. Fix: both in the same region. Testing happens in South America, later users are global, so US East is the middle ground (round trips from Chile: São Paulo ~125 ms, US East ~215 ms, Frankfurt ~300 ms). Video is unaffected (LiveKit picks the nearest edge).
- [x] Measure before: one Supabase lookup via the token route 0.4–0.65 s from the dev server (log: "application-code")
- [x] New Supabase project in US East (`us-east-1`): run `supabase/migrations/` in order, recreate the teacher account (old lessons are not copied)
- [x] Swap the Supabase keys in `.env.local` and Vercel (the user pastes them); Vercel region `iad1` in `vercel.json`
- [x] Measure after: the database lookup now adds only ~0.05–0.1 s on the live site (token route with vs without a lookup); the rest is the network from Chile to US East

## S2: Teacher sign-up (replaces M9)
- [x] `/signup` page (name, email, password) with `supabase.auth.signUp`; the name goes into `display_name` metadata
- [x] Email confirmation link → `/auth/confirm` route; "Check your email" screen; `/link-expired` for bad links
- [x] "Forgot password" on the login page, with a reset page; friendly error messages (`lib/authErrors.ts`)
- [x] `proxy.ts`: sign-up and forgot-password for logged-out visitors, reset page needs the link's login
- [x] User, in Supabase: Gmail as custom SMTP, sign-ups on with "Confirm email", minimum password 8, email templates, redirect URLs
- [x] Test: sign up with a second email, confirm, reset password (live and local)
- [ ] An empty dashboard welcomes a new teacher (see "Arrow doodle" below)
- [x] Update "Teacher account" in `docs/ARCHITECTURE.md`

## S3: Security check (before inviting friends)
- [ ] RLS: each teacher sees only their own lessons and files; run Supabase's Security Advisor
- [ ] Token route: student tokens only for an existing slug; slugs too long to guess; token lifetime and grants (no room admin for students)
- [ ] Teacher-only messages (`control`, mute, nudge) can't be faked by the student
- [ ] `/api/mute` and the end/delete routes check lesson ownership
- [ ] No secret in `NEXT_PUBLIC_*` or the client bundle
- [ ] Sign-up abuse: Supabase CAPTCHA (Turnstile) or rate limits; minimum password length
- [ ] Security headers in `next.config.ts` (no framing, referrer policy; CSP if LiveKit and Excalidraw still work)
- [ ] Write findings here, plus the "Before going commercial" list below

## S4: Audio library
- [ ] Private Supabase Storage bucket `audio`, files under `<teacher_id>/`; RLS so a teacher only reads and writes their own folder; audio types only, about 20 MB per file (free tier: 1 GB total). Migration in `supabase/migrations/`
- [ ] Upload, list and delete files (dashboard)
- [ ] Room, teacher only: audio button opens the library; pick a file → play / pause / seek
- [ ] Playback is published as an extra LiveKit audio track (Web Audio), so the student hears it even while the teacher's mic is muted; files load through short-lived signed URLs
- [ ] Student sees a small "Audio playing" indicator

## S5: UX/UI polish
- [ ] D5d: one wait, one screen (below)
- [ ] Walk through every screen with the user (login, sign-up, dashboard, join, room on desktop and phone); list fixes, then do them
- [ ] D4: real phone test on the live site
- [ ] Decide the D5 "Still to decide" items

## S6: Nicer URL
- [ ] Optional now (user, in Vercel): rename the project, e.g. `teachingtime.vercel.app`; then update Supabase's Site URL and redirect URLs and the docs
- [ ] Later: own domain (see "Before going commercial")

# Open design work

## D5d: One wait, one screen
Rule: a wait that takes you into or out of a lesson shows the full loading screen, without breaks. Small actions that keep you on the page (save name, add student) get a pending state on their button.
- [ ] Dashboard's Suspense fallback ("Loading…") becomes the loading screen, so "Leaving the lesson" flows straight into it until the students are shown (the 15 s auto-refresh doesn't trigger it)
- [ ] "Start a quick call" switches to "Getting your lesson ready" on click (form pending state) and it stays until connected; no second screen in between
- [ ] Check that opening a student's card shows the loading screen at once too
- [ ] Buttons for small actions (Save name, Add, Remove/End) show a pending state

## D5: Still to decide
- [ ] Dark ink instead of brown for the main buttons
- [ ] Arrow doodle pointing to "Add a student" on an empty dashboard

# Later

## D6: Scheduling
- [ ] Plan the next lesson per student (date and time), shown on the student card

## Before going commercial
- [ ] Vercel Hobby is non-commercial only: move to Vercel Pro, or Netlify / Cloudflare Pages
- [ ] Own domain (e.g. teachingtime.app)
- [ ] Privacy policy and terms (GDPR: EU users, video and stored boards)
- [ ] Free tiers: LiveKit's monthly participant minutes are shared by all teachers (a 1-hour lesson uses about 120); Supabase free projects pause after about a week without activity
