-- Stage 25: one private reflection for each UTC calendar week.

create table public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start date not null,
  overall_rating smallint check (
    overall_rating is null or overall_rating between 1 and 5
  ),
  wins text check (
    wins is null or char_length(wins) <= 4000
  ),
  challenges text check (
    challenges is null or char_length(challenges) <= 4000
  ),
  lessons text check (
    lessons is null or char_length(lessons) <= 4000
  ),
  next_week_focus text check (
    next_week_focus is null or char_length(next_week_focus) <= 2000
  ),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weekly_reviews_week_start_monday_check
    check (extract(isodow from week_start) = 1),
  constraint weekly_reviews_user_week_unique unique (user_id, week_start),
  unique (id, user_id)
);

create trigger weekly_reviews_set_updated_at
before update on public.weekly_reviews
for each row execute function private.set_updated_at();

alter table public.weekly_reviews enable row level security;

create policy "weekly_reviews_select_own"
on public.weekly_reviews for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "weekly_reviews_insert_own"
on public.weekly_reviews for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "weekly_reviews_update_own"
on public.weekly_reviews for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke all on public.weekly_reviews from public, anon, authenticated;
grant select on public.weekly_reviews to authenticated;
grant insert (
  user_id,
  week_start,
  overall_rating,
  wins,
  challenges,
  lessons,
  next_week_focus,
  completed_at
) on public.weekly_reviews to authenticated;
grant update (
  overall_rating,
  wins,
  challenges,
  lessons,
  next_week_focus,
  completed_at
) on public.weekly_reviews to authenticated;
