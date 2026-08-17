-- Stage 11: structured, user-owned technologies linked to applications.

create table public.technologies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  normalized_name text generated always as (lower(name)) stored,
  created_at timestamptz not null default now(),
  constraint technologies_name_check check (
    char_length(name) between 1 and 60
    and name = regexp_replace(btrim(name), '[[:space:]]+', ' ', 'g')
  ),
  unique (id, user_id),
  unique (user_id, normalized_name)
);

create table public.application_technologies (
  application_id uuid not null,
  technology_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (application_id, technology_id),
  constraint application_technologies_application_owner_fkey
    foreign key (application_id, user_id)
    references public.applications (id, user_id) on delete cascade,
  constraint application_technologies_technology_owner_fkey
    foreign key (technology_id, user_id)
    references public.technologies (id, user_id) on delete cascade
);

create index technologies_user_name_idx
  on public.technologies (user_id, name);

create index application_technologies_user_application_idx
  on public.application_technologies (user_id, application_id, technology_id);

create index application_technologies_technology_id_idx
  on public.application_technologies (technology_id);

alter table public.technologies enable row level security;
alter table public.application_technologies enable row level security;

create policy "technologies_select_own"
on public.technologies for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "technologies_insert_own"
on public.technologies for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "technologies_delete_own"
on public.technologies for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "application_technologies_select_own"
on public.application_technologies for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "application_technologies_insert_own"
on public.application_technologies for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "application_technologies_delete_own"
on public.application_technologies for delete
to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.technologies from public, anon, authenticated;
revoke all on public.application_technologies from public, anon, authenticated;

grant select, delete on public.technologies to authenticated;
grant insert (user_id, name) on public.technologies to authenticated;
grant select, delete on public.application_technologies to authenticated;
grant insert (application_id, technology_id, user_id)
on public.application_technologies to authenticated;
