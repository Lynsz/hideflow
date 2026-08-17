-- Stage 10: private, application-owned reminders and follow-up tasks.

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid not null,
  title text not null check (char_length(trim(title)) between 1 and 160),
  notes text check (notes is null or char_length(notes) <= 2000),
  due_at timestamptz not null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reminders_application_owner_fkey
    foreign key (application_id, user_id)
    references public.applications (id, user_id) on delete cascade,
  unique (id, user_id)
);

-- Supports application detail reads and cascades from applications.
create index reminders_application_due_at_idx
  on public.reminders (application_id, due_at, id);

-- The main reminders and dashboard queries only scan unfinished work.
create index reminders_user_pending_due_at_idx
  on public.reminders (user_id, due_at, id)
  where completed_at is null;

create trigger reminders_set_updated_at
before update on public.reminders
for each row execute function private.set_updated_at();

alter table public.reminders enable row level security;

create policy "reminders_select_own"
on public.reminders for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "reminders_insert_own"
on public.reminders for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "reminders_update_own"
on public.reminders for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "reminders_delete_own"
on public.reminders for delete
to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.reminders from public, anon, authenticated;
grant select, delete on public.reminders to authenticated;
grant insert (user_id, application_id, title, notes, due_at)
on public.reminders to authenticated;
grant update (title, notes, due_at, completed_at)
on public.reminders to authenticated;
