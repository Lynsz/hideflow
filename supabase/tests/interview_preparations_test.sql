begin;
select plan(8);

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
    '2026-08-25T15:00:00Z',
    'scheduled'
  ),
  (
    'bbbbbbbb-4444-4444-8444-bbbbbbbbbbbb',
    '22222222-2222-4222-8222-222222222222',
    'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb',
    'hr',
    '2026-08-26T15:00:00Z',
    'scheduled'
  ),
  (
    'aaaaaaaa-5555-4555-8555-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa',
    'behavioral',
    '2026-08-27T15:00:00Z',
    'scheduled'
  );

select ok(
  not has_table_privilege('anon', 'public.interview_preparations', 'select'),
  'anonymous users cannot read interview preparations'
);

select ok(
  not has_column_privilege(
    'authenticated',
    'public.interview_preparations',
    'user_id',
    'update'
  ),
  'authenticated clients cannot reassign preparation ownership'
);

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

insert into public.interview_preparations (
  user_id,
  interview_id,
  company_research,
  questions_to_ask
)
values (
  '11111111-1111-4111-8111-111111111111',
  'aaaaaaaa-3333-4333-8333-aaaaaaaaaaaa',
  'Principais produtos e mercado',
  'Como o time mede impacto?'
);

select is(
  (select count(*) from public.interview_preparations),
  1::bigint,
  'the owner creates preparation for their interview'
);

select throws_ok(
  $$
    update public.interview_preparations
    set company_research = repeat('x', 4001)
    where interview_id = 'aaaaaaaa-3333-4333-8333-aaaaaaaaaaaa'
  $$,
  '23514',
  null,
  'the database rejects oversized preparation sections'
);

set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

select is(
  (select count(*) from public.interview_preparations),
  0::bigint,
  'RLS hides another users preparation'
);

select throws_ok(
  $$
    insert into public.interview_preparations (
      user_id,
      interview_id,
      company_research
    ) values (
      '22222222-2222-4222-8222-222222222222',
      'aaaaaaaa-5555-4555-8555-aaaaaaaaaaaa',
      'Cross-tenant attempt'
    )
  $$,
  '23503',
  null,
  'the composite foreign key rejects another users interview'
);

update public.interview_preparations
set company_research = 'Unauthorized change'
where interview_id = 'aaaaaaaa-3333-4333-8333-aaaaaaaaaaaa';

set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select is(
  (
    select company_research
    from public.interview_preparations
    where interview_id = 'aaaaaaaa-3333-4333-8333-aaaaaaaaaaaa'
  ),
  'Principais produtos e mercado',
  'another user cannot update the owners preparation'
);

delete from public.interviews
where id = 'aaaaaaaa-3333-4333-8333-aaaaaaaaaaaa';

select is(
  (select count(*) from public.interview_preparations),
  0::bigint,
  'deleting the interview cascades to its preparation'
);

select * from finish();
rollback;
