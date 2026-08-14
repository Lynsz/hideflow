-- HireFlow core schema: private, user-owned data with database-enforced isolation.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.application_status as enum (
  'saved',
  'applied',
  'screening',
  'hr_interview',
  'technical_interview',
  'technical_challenge',
  'final_interview',
  'offer',
  'hired',
  'rejected',
  'withdrawn'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 160),
  website text,
  linkedin_url text,
  location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid,
  job_title text not null check (char_length(trim(job_title)) between 1 and 180),
  job_url text,
  location text,
  work_mode text check (work_mode is null or work_mode in ('remote', 'hybrid', 'onsite')),
  employment_type text check (
    employment_type is null
    or employment_type in ('clt', 'pj', 'internship', 'freelance')
  ),
  salary_min numeric(14, 2) check (salary_min is null or salary_min >= 0),
  salary_max numeric(14, 2) check (salary_max is null or salary_max >= 0),
  currency text not null default 'BRL' check (currency ~ '^[A-Z]{3}$'),
  applied_at date,
  source text,
  description text,
  notes text,
  status public.application_status not null default 'saved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applications_salary_range_check check (
    salary_min is null or salary_max is null or salary_max >= salary_min
  ),
  constraint applications_company_owner_fkey foreign key (company_id, user_id)
    references public.companies (id, user_id) on delete restrict,
  unique (id, user_id)
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid not null,
  name text not null check (char_length(trim(name)) between 1 and 160),
  role text,
  email text,
  phone text,
  linkedin_url text,
  contact_type text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contacts_company_owner_fkey foreign key (company_id, user_id)
    references public.companies (id, user_id) on delete cascade
);

create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid not null,
  type text not null check (char_length(trim(type)) between 1 and 100),
  scheduled_at timestamptz not null,
  interviewer_name text,
  meeting_url text,
  notes text,
  result text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint interviews_application_owner_fkey foreign key (application_id, user_id)
    references public.applications (id, user_id) on delete cascade
);

create table public.application_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid not null,
  from_status public.application_status,
  to_status public.application_status not null,
  created_at timestamptz not null default now(),
  constraint application_history_application_owner_fkey
    foreign key (application_id, user_id)
    references public.applications (id, user_id) on delete cascade
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid not null,
  name text not null check (char_length(trim(name)) between 1 and 255),
  storage_path text not null check (char_length(trim(storage_path)) > 0),
  document_type text not null check (char_length(trim(document_type)) > 0),
  created_at timestamptz not null default now(),
  constraint documents_application_owner_fkey foreign key (application_id, user_id)
    references public.applications (id, user_id) on delete cascade
);

create index companies_user_id_idx on public.companies (user_id);
create index applications_user_status_idx on public.applications (user_id, status);
create index applications_user_applied_at_idx on public.applications (user_id, applied_at desc);
create index applications_company_id_idx on public.applications (company_id);
create index contacts_user_id_idx on public.contacts (user_id);
create index contacts_company_id_idx on public.contacts (company_id);
create index interviews_user_scheduled_at_idx on public.interviews (user_id, scheduled_at);
create index interviews_application_id_idx on public.interviews (application_id);
create index application_history_user_id_idx on public.application_history (user_id);
create index application_history_application_id_idx on public.application_history (application_id);
create index documents_user_id_idx on public.documents (user_id);
create index documents_application_id_idx on public.documents (application_id);

create function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger companies_set_updated_at
before update on public.companies
for each row execute function private.set_updated_at();

create trigger applications_set_updated_at
before update on public.applications
for each row execute function private.set_updated_at();

create trigger contacts_set_updated_at
before update on public.contacts
for each row execute function private.set_updated_at();

create trigger interviews_set_updated_at
before update on public.interviews
for each row execute function private.set_updated_at();

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    left(
      coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
        split_part(coalesce(new.email, ''), '@', 1),
        ''
      ),
      120
    )
  );

  return new;
end;
$$;

revoke execute on function private.set_updated_at() from public, anon, authenticated;
revoke execute on function private.handle_new_user() from public, anon, authenticated;
grant usage on schema private to supabase_auth_admin;
grant execute on function private.handle_new_user() to supabase_auth_admin;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.applications enable row level security;
alter table public.contacts enable row level security;
alter table public.interviews enable row level security;
alter table public.application_history enable row level security;
alter table public.documents enable row level security;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "companies_select_own"
on public.companies for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "companies_insert_own"
on public.companies for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "companies_update_own"
on public.companies for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "companies_delete_own"
on public.companies for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "applications_select_own"
on public.applications for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "applications_insert_own"
on public.applications for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "applications_update_own"
on public.applications for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "applications_delete_own"
on public.applications for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "contacts_select_own"
on public.contacts for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "contacts_insert_own"
on public.contacts for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "contacts_update_own"
on public.contacts for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "contacts_delete_own"
on public.contacts for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "interviews_select_own"
on public.interviews for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "interviews_insert_own"
on public.interviews for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "interviews_update_own"
on public.interviews for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "interviews_delete_own"
on public.interviews for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "application_history_select_own"
on public.application_history for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "application_history_insert_own"
on public.application_history for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "application_history_update_own"
on public.application_history for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "application_history_delete_own"
on public.application_history for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "documents_select_own"
on public.documents for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "documents_insert_own"
on public.documents for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "documents_update_own"
on public.documents for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "documents_delete_own"
on public.documents for delete
to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.profiles from anon;
revoke all on public.companies from anon;
revoke all on public.applications from anon;
revoke all on public.contacts from anon;
revoke all on public.interviews from anon;
revoke all on public.application_history from anon;
revoke all on public.documents from anon;

grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.companies to authenticated;
grant select, insert, update, delete on public.applications to authenticated;
grant select, insert, update, delete on public.contacts to authenticated;
grant select, insert, update, delete on public.interviews to authenticated;
grant select, insert, update, delete on public.application_history to authenticated;
grant select, insert, update, delete on public.documents to authenticated;
