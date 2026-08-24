-- Stage 24: exact, ownership-scoped metrics for the interview learning center.

create index interview_debriefs_owner_rating_updated_idx
  on public.interview_debriefs (
    user_id,
    overall_rating,
    updated_at desc,
    id
  )
  where overall_rating is not null;

create function public.get_interview_learning_summary()
returns table (
  total_debriefs bigint,
  completed_interviews bigint,
  covered_completed_interviews bigint,
  rated_debriefs bigint,
  rating_total bigint,
  pending_thank_yous bigint,
  rating_1_count bigint,
  rating_2_count bigint,
  rating_3_count bigint,
  rating_4_count bigint,
  rating_5_count bigint
)
language sql
stable
security invoker
set search_path = ''
as $function$
  with debrief_summary as (
    select
      count(*) as total_debriefs,
      count(overall_rating) as rated_debriefs,
      coalesce(sum(overall_rating), 0)::bigint as rating_total,
      count(*) filter (where thank_you_sent_at is null) as pending_thank_yous,
      count(*) filter (where overall_rating = 1) as rating_1_count,
      count(*) filter (where overall_rating = 2) as rating_2_count,
      count(*) filter (where overall_rating = 3) as rating_3_count,
      count(*) filter (where overall_rating = 4) as rating_4_count,
      count(*) filter (where overall_rating = 5) as rating_5_count
    from public.interview_debriefs
    where user_id = (select auth.uid())
  ),
  interview_summary as (
    select
      count(*) as completed_interviews,
      count(debrief.id) as covered_completed_interviews
    from public.interviews as interview
    left join public.interview_debriefs as debrief
      on debrief.interview_id = interview.id
      and debrief.user_id = interview.user_id
    where interview.user_id = (select auth.uid())
      and interview.result in ('completed', 'passed', 'failed')
  )
  select
    debrief.total_debriefs,
    interview.completed_interviews,
    interview.covered_completed_interviews,
    debrief.rated_debriefs,
    debrief.rating_total,
    debrief.pending_thank_yous,
    debrief.rating_1_count,
    debrief.rating_2_count,
    debrief.rating_3_count,
    debrief.rating_4_count,
    debrief.rating_5_count
  from debrief_summary as debrief
  cross join interview_summary as interview;
$function$;

revoke all on function public.get_interview_learning_summary()
from public, anon, authenticated;
grant execute on function public.get_interview_learning_summary()
to authenticated;
