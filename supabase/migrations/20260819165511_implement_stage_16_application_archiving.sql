-- Stage 16: reversible application archiving without deleting history.

alter table public.applications
  add column archived_at timestamptz;

-- Operational views consistently filter active applications and use two
-- distinct recency columns: creation in the list, updates in Kanban/dashboard.
create index applications_user_active_created_at_idx
  on public.applications (user_id, created_at desc, id)
  where archived_at is null;

create index applications_user_active_updated_at_idx
  on public.applications (user_id, updated_at desc, id)
  where archived_at is null;
