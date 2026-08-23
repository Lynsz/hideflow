-- Stage 22: one private, structured preparation workspace per interview.

create table public.interview_preparations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  interview_id uuid not null unique,
  company_research text check (
    company_research is null or char_length(company_research) <= 4000
  ),
  role_alignment text check (
    role_alignment is null or char_length(role_alignment) <= 4000
  ),
  star_stories text check (
    star_stories is null or char_length(star_stories) <= 4000
  ),
  questions_to_ask text check (
    questions_to_ask is null or char_length(questions_to_ask) <= 4000
  ),
  logistics_notes text check (
    logistics_notes is null or char_length(logistics_notes) <= 2000
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint interview_preparations_interview_owner_fkey
    foreign key (interview_id, user_id)
    references public.interviews (id, user_id) on delete cascade,
  unique (id, user_id)
);

-- Covers ownership predicates, account exports and recent-preparation reads.
create index interview_preparations_owner_updated_idx
  on public.interview_preparations (user_id, updated_at desc, id);

create trigger interview_preparations_set_updated_at
before update on public.interview_preparations
for each row execute function private.set_updated_at();

alter table public.interview_preparations enable row level security;

create policy "interview_preparations_select_own"
on public.interview_preparations for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "interview_preparations_insert_own"
on public.interview_preparations for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "interview_preparations_update_own"
on public.interview_preparations for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke all on public.interview_preparations from public, anon, authenticated;
grant select on public.interview_preparations to authenticated;
grant insert (
  user_id,
  interview_id,
  company_research,
  role_alignment,
  star_stories,
  questions_to_ask,
  logistics_notes
) on public.interview_preparations to authenticated;
grant update (
  company_research,
  role_alignment,
  star_stories,
  questions_to_ask,
  logistics_notes
) on public.interview_preparations to authenticated;
