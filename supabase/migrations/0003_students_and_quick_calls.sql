-- Each row is either a regular student (fixed link, board kept until the next lesson)
-- or a one-off quick call (removed from the dashboard via "End", or after 12 hours).
alter table public.lessons
  add column kind text not null default 'student' check (kind in ('student', 'quick')),
  add column last_active_at timestamptz;  -- last start or save; drives "Last lesson" and the 3-hour fresh-board rule
