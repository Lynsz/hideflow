-- Stage 23: one private post-interview debrief per interview.

create table public.interview_debriefs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  interview_id uuid not null unique,
  overall_rating smallint check (
    overall_rating is null or overall_rating between 1 and 5
  ),
  went_well text check (
    went_well is null or char_length(went_well) <= 4000
  ),
  improve_next_time text check (
    improve_next_time is null or char_length(improve_next_time) <= 4000
  ),
  questions_received text check (
    questions_received is null or char_length(questions_received) <= 4000
  ),
  follow_up_notes text check (
    follow_up_notes is null or char_length(follow_up_notes) <= 2000
  ),
  thank_you_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint interview_debriefs_interview_owner_fkey
    foreign key (interview_id, user_id)
    references public.interviews (id, user_id) on delete cascade,
  unique (id, user_id)
);

create index interview_debriefs_owner_updated_idx
  on public.interview_debriefs (user_id, updated_at desc, id);

create trigger interview_debriefs_set_updated_at
before update on public.interview_debriefs
for each row execute function private.set_updated_at();

alter table public.interview_debriefs enable row level security;

create policy "interview_debriefs_select_own"
on public.interview_debriefs for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "interview_debriefs_insert_own"
on public.interview_debriefs for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "interview_debriefs_update_own"
on public.interview_debriefs for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke all on public.interview_debriefs from public, anon, authenticated;
grant select on public.interview_debriefs to authenticated;
grant insert (
  user_id,
  interview_id,
  overall_rating,
  went_well,
  improve_next_time,
  questions_received,
  follow_up_notes,
  thank_you_sent_at
) on public.interview_debriefs to authenticated;
grant update (
  overall_rating,
  went_well,
  improve_next_time,
  questions_received,
  follow_up_notes,
  thank_you_sent_at
) on public.interview_debriefs to authenticated;
