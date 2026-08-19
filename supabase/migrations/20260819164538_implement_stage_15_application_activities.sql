-- Stage 15: private, manually recorded interactions for each application.

create type public.application_activity_type as enum (
  'note',
  'email',
  'phone_call',
  'linkedin',
  'other'
);

create table public.application_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid not null,
  activity_type public.application_activity_type not null,
  title text not null check (char_length(trim(title)) between 1 and 120),
  notes text check (notes is null or char_length(notes) <= 2000),
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint application_activities_application_owner_fkey
    foreign key (application_id, user_id)
    references public.applications (id, user_id) on delete cascade,
  unique (id, user_id)
);

-- Covers application timeline reads and the ownership predicate used by RLS.
create index application_activities_owner_timeline_idx
  on public.application_activities
  (user_id, application_id, occurred_at desc, id);

alter table public.application_activities enable row level security;

create policy "application_activities_select_own"
on public.application_activities for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "application_activities_insert_own"
on public.application_activities for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "application_activities_delete_own"
on public.application_activities for delete
to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.application_activities from public, anon, authenticated;
grant select, delete on public.application_activities to authenticated;
grant insert (user_id, application_id, activity_type, title, notes, occurred_at)
on public.application_activities to authenticated;
