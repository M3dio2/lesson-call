-- Text pad, whiteboard and controls now live in one Yjs document,
-- so a single snapshot column replaces the two separate ones.
alter table public.lessons rename column text_snapshot to doc_snapshot;  -- base64 Yjs state
alter table public.lessons drop column board_snapshot;
