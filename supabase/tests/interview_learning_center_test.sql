begin;
select plan(4);

insert into auth.users (id, email)
values
  ('11111111-1111-4111-8111-111111111111', 'owner@example.com'),
  ('22222222-2222-4222-8222-222222222222', 'other@example.com');

insert into public.companies (id, user_id, name)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'Owner Company'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '22222222-2222-4222-8222-222222222222',
    'Other Company'
  );

insert into public.applications (id, user_id, company_id, job_title)
values
  (
    'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'Frontend Engineer'
  ),
  (
    'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb',
    '22222222-2222-4222-8222-222222222222',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'Backend Engineer'
  );

insert into public.interviews (
  id,
  user_id,
  application_id,
  type,
  scheduled_at,
  result
)
values
  (
    'aaaaaaaa-3333-4333-8333-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa',
    'technical',
    '2026-08-20T15:00:00Z',
    'completed'
  ),
  (
    'aaaaaaaa-4444-4444-8444-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa',
    'behavioral',
    '2026-08-21T15:00:00Z',
    'passed'
  ),
  (
    'aaaaaaaa-5555-4555-8555-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa',
    'final',
    '2026-08-25T15:00:00Z',
    'scheduled'
  ),
  (
    'bbbbbbbb-6666-4666-8666-bbbbbbbbbbbb',
    '22222222-2222-4222-8222-222222222222',
    'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb',
    'technical',
    '2026-08-20T15:00:00Z',
    'completed'
  );

insert into public.interview_debriefs (
  user_id,
  interview_id,
  overall_rating,
  went_well,
  thank_you_sent_at
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'aaaaaaaa-3333-4333-8333-aaaaaaaaaaaa',
    4,
    'Usei exemplos com métricas',
    '2026-08-20T18:00:00Z'
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'aaaaaaaa-4444-4444-8444-aaaaaaaaaaaa',
    2,
    'Fiz perguntas relevantes',
    null
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'aaaaaaaa-5555-4555-8555-aaaaaaaaaaaa',
    null,
    null,
    null
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'bbbbbbbb-6666-4666-8666-bbbbbbbbbbbb',
    5,
    'Outro usuário',
    null
  );

select ok(
  not has_function_privilege(
    'anon',
    'public.get_interview_learning_summary()',
    'execute'
  ),
  'anonymous users cannot execute the learning summary'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.get_interview_learning_summary()',
    'execute'
  ),
  'authenticated users can execute the learning summary'
);

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select results_eq(
  $$
    select
      total_debriefs,
      completed_interviews,
      covered_completed_interviews,
      rated_debriefs,
      rating_total,
      pending_thank_yous,
      rating_1_count,
      rating_2_count,
      rating_3_count,
      rating_4_count,
      rating_5_count
    from public.get_interview_learning_summary()
  $$,
  $$ values (
    3::bigint,
    2::bigint,
    2::bigint,
    2::bigint,
    6::bigint,
    2::bigint,
    0::bigint,
    1::bigint,
    0::bigint,
    1::bigint,
    0::bigint
  ) $$,
  'the owner receives exact metrics without another users data'
);

set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

select results_eq(
  $$
    select total_debriefs, completed_interviews, rating_total
    from public.get_interview_learning_summary()
  $$,
  $$ values (1::bigint, 1::bigint, 5::bigint) $$,
  'the summary changes with the authenticated owner'
);

select * from finish();
rollback;
