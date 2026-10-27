-- Lessons created by the teacher. Students never query this table directly:
-- the token route looks up invite slugs with the secret key on the server.
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  invite_slug text not null unique,
  text_snapshot text,     -- base64 Yjs state (M7)
  board_snapshot jsonb,   -- Excalidraw elements (M7)
  created_at timestamptz not null default now()
);

alter table public.lessons enable row level security;

create policy "Teachers manage their own lessons"
  on public.lessons
  for all
  to authenticated
  using (teacher_id = (select auth.uid()))
  with check (teacher_id = (select auth.uid()));
