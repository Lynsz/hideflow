-- Stage 21: configurable productivity goals stored on the existing private
-- profile. Progress remains derived from user-owned operational records.

alter table public.profiles
add column weekly_application_target smallint not null default 5,
add column weekly_follow_up_target smallint not null default 3,
add column weekly_outreach_target smallint not null default 3;

alter table public.profiles
add constraint profiles_weekly_application_target_check
  check (weekly_application_target between 0 and 100),
add constraint profiles_weekly_follow_up_target_check
  check (weekly_follow_up_target between 0 and 100),
add constraint profiles_weekly_outreach_target_check
  check (weekly_outreach_target between 0 and 100);

-- Keep identity and audit columns read-only for Data API clients.
revoke update on public.profiles from authenticated;
grant update (
  full_name,
  default_currency,
  analytics_period,
  weekly_application_target,
  weekly_follow_up_target,
  weekly_outreach_target
) on public.profiles to authenticated;

-- Support the two rolling-window queries that were not covered by the
-- existing application and timeline indexes.
create index reminders_user_completed_at_idx
  on public.reminders (user_id, completed_at desc)
  where completed_at is not null;

create index application_activities_user_outreach_idx
  on public.application_activities (user_id, occurred_at desc)
  where activity_type in ('email', 'phone_call', 'linkedin');
