begin;
select plan(8);

insert into auth.users (id, email)
values
  ('11111111-1111-4111-8111-111111111111', 'owner@example.com'),
  ('22222222-2222-4222-8222-222222222222', 'other@example.com');

select ok(
  not has_table_privilege('anon', 'public.weekly_reviews', 'select'),
  'anonymous users cannot read weekly reviews'
);

select ok(
  not has_column_privilege(
    'authenticated',
    'public.weekly_reviews',
    'user_id',
    'update'
  ),
  'authenticated clients cannot reassign weekly review ownership'
);

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

insert into public.weekly_reviews (
  user_id,
  week_start,
  overall_rating,
  wins,
  completed_at
)
values (
  '11111111-1111-4111-8111-111111111111',
  '2026-08-24',
  4,
  'Mantive consistência nas candidaturas',
  '2026-08-28T18:00:00Z'
);

select is(
  (select overall_rating from public.weekly_reviews),
  4::smallint,
  'the owner creates a review for a Monday week start'
);

select throws_ok(
  $$
    insert into public.weekly_reviews (user_id, week_start)
    values (
      '11111111-1111-4111-8111-111111111111',
      '2026-08-25'
    )
  $$,
  '23514',
  null,
  'the database rejects a week that does not start on Monday'
);

select throws_ok(
  $$
    update public.weekly_reviews
    set overall_rating = 6
    where week_start = '2026-08-24'
  $$,
  '23514',
  null,
  'the database rejects ratings outside the supported scale'
);

select throws_ok(
  $$
    insert into public.weekly_reviews (user_id, week_start)
    values (
      '11111111-1111-4111-8111-111111111111',
      '2026-08-24'
    )
  $$,
  '23505',
  null,
  'each owner has at most one review per week'
);

set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

select is(
  (select count(*) from public.weekly_reviews),
  0::bigint,
  'RLS hides another users weekly review'
);

update public.weekly_reviews
set wins = 'Unauthorized change'
where week_start = '2026-08-24';

set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select is(
  (select wins from public.weekly_reviews),
  'Mantive consistência nas candidaturas',
  'another user cannot update the owners review'
);

select * from finish();
rollback;
