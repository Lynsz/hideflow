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
    '2026-08-22T15:00:00Z',
    'completed'
  ),
  (
    'bbbbbbbb-4444-4444-8444-bbbbbbbbbbbb',
    '22222222-2222-4222-8222-222222222222',
    'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb',
    'hr',
    '2026-08-23T15:00:00Z',
    'completed'
  ),
  (
    'aaaaaaaa-5555-4555-8555-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa',
    'behavioral',
    '2026-08-24T15:00:00Z',
    'completed'
  );

select ok(
  not has_table_privilege('anon', 'public.interview_debriefs', 'select'),
  'anonymous users cannot read interview debriefs'
);

select ok(
  not has_column_privilege(
    'authenticated',
    'public.interview_debriefs',
    'user_id',
    'update'
  ),
  'authenticated clients cannot reassign debrief ownership'
);

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

insert into public.interview_debriefs (
  user_id,
  interview_id,
  overall_rating,
  went_well,
  thank_you_sent_at
)
values (
  '11111111-1111-4111-8111-111111111111',
  'aaaaaaaa-3333-4333-8333-aaaaaaaaaaaa',
  4,
  'Expliquei o impacto com dados',
  '2026-08-22T18:00:00Z'
);

select is(
  (select overall_rating from public.interview_debriefs),
  4::smallint,
  'the owner creates a debrief for their interview'
);

select throws_ok(
  $$
    update public.interview_debriefs
    set overall_rating = 6
    where interview_id = 'aaaaaaaa-3333-4333-8333-aaaaaaaaaaaa'
  $$,
  '23514',
  null,
  'the database rejects ratings outside the supported scale'
);

set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

select is(
  (select count(*) from public.interview_debriefs),
  0::bigint,
  'RLS hides another users debrief'
);

select throws_ok(
  $$
    insert into public.interview_debriefs (
      user_id,
      interview_id,
      overall_rating
    ) values (
      '22222222-2222-4222-8222-222222222222',
      'aaaaaaaa-5555-4555-8555-aaaaaaaaaaaa',
      3
    )
  $$,
  '23503',
  null,
  'the composite foreign key rejects another users interview'
);

update public.interview_debriefs
set went_well = 'Unauthorized change'
where interview_id = 'aaaaaaaa-3333-4333-8333-aaaaaaaaaaaa';

set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select is(
  (
    select went_well
    from public.interview_debriefs
    where interview_id = 'aaaaaaaa-3333-4333-8333-aaaaaaaaaaaa'
  ),
  'Expliquei o impacto com dados',
  'another user cannot update the owners debrief'
);

delete from public.interviews
where id = 'aaaaaaaa-3333-4333-8333-aaaaaaaaaaaa';

select is(
  (select count(*) from public.interview_debriefs),
  0::bigint,
  'deleting the interview cascades to its debrief'
);

select * from finish();
rollback;
