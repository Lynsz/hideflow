begin;
select plan(9);

insert into auth.users (id, email)
values
  ('11111111-1111-4111-8111-111111111111', 'owner@example.com'),
  ('22222222-2222-4222-8222-222222222222', 'other@example.com');

select ok(
  has_column_privilege(
    'authenticated',
    'public.profiles',
    'weekly_application_target',
    'update'
  ),
  'authenticated users can update productivity targets'
);

select ok(
  not has_column_privilege(
    'authenticated',
    'public.profiles',
    'avatar_url',
    'update'
  ),
  'unrelated profile columns remain protected'
);

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select is(
  (select weekly_application_target from public.profiles),
  5::smallint,
  'new profiles receive the application target default'
);

select is(
  (select weekly_follow_up_target from public.profiles),
  3::smallint,
  'new profiles receive the follow-up target default'
);

select is(
  (select weekly_outreach_target from public.profiles),
  3::smallint,
  'new profiles receive the outreach target default'
);

update public.profiles
set
  weekly_application_target = 8,
  weekly_follow_up_target = 4,
  weekly_outreach_target = 6
where id = '11111111-1111-4111-8111-111111111111';

select is(
  (select weekly_application_target from public.profiles),
  8::smallint,
  'the owner updates their own targets'
);

select throws_ok(
  $$
    update public.profiles
    set weekly_application_target = 101
    where id = '11111111-1111-4111-8111-111111111111'
  $$,
  '23514',
  null,
  'the database rejects targets above the supported limit'
);

set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

select results_eq(
  $$ select id from public.profiles order by id $$,
  $$ values ('22222222-2222-4222-8222-222222222222'::uuid) $$,
  'RLS exposes only the current users profile'
);

update public.profiles
set weekly_application_target = 99
where id = '11111111-1111-4111-8111-111111111111';

set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select is(
  (select weekly_application_target from public.profiles),
  8::smallint,
  'another user cannot update the owners targets'
);

select * from finish();
rollback;
