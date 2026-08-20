begin;
select plan(11);

insert into auth.users (id, email)
values
  ('11111111-1111-4111-8111-111111111111', 'owner@example.com'),
  ('22222222-2222-4222-8222-222222222222', 'other@example.com');

select ok(
  not has_function_privilege(
    'anon',
    'public.import_applications_csv(jsonb)',
    'execute'
  ),
  'anonymous users cannot execute the import function'
);

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select results_eq(
  $$
    select (public.import_applications_csv(jsonb_build_array(jsonb_build_object(
      'companyName', 'Acme',
      'jobTitle', 'Frontend Engineer',
      'status', 'applied',
      'workMode', 'remote',
      'employmentType', 'clt',
      'location', 'São Paulo',
      'salaryMin', 8000,
      'salaryMax', 10000,
      'currency', 'BRL',
      'appliedAt', '2026-08-20',
      'source', 'Indicação',
      'jobUrl', 'https://example.com/job',
      'technologies', jsonb_build_array('TypeScript', 'React')
    ))) ->> 'imported'
  $$,
  array['1'],
  'the owner imports one application'
);

select is(
  (select count(*) from public.companies),
  1::bigint,
  'the import creates one company for the owner'
);

select is(
  (select count(*) from public.applications),
  1::bigint,
  'the import creates one application for the owner'
);

select is(
  (select count(*) from public.application_technologies),
  2::bigint,
  'the import links normalized technologies'
);

select results_eq(
  $$
    select (public.import_applications_csv(jsonb_build_array(jsonb_build_object(
      'companyName', 'Acme',
      'jobTitle', 'Frontend Engineer',
      'status', 'applied',
      'workMode', 'remote',
      'employmentType', 'clt',
      'location', 'São Paulo',
      'salaryMin', 8000,
      'salaryMax', 10000,
      'currency', 'BRL',
      'appliedAt', '2026-08-20',
      'source', 'Indicação',
      'jobUrl', 'https://example.com/job',
      'technologies', jsonb_build_array('TypeScript', 'React')
    ))) ->> 'skipped'
  $$,
  array['1'],
  'an exact duplicate is reported as skipped'
);

select is(
  (select count(*) from public.applications),
  1::bigint,
  'a duplicate does not create another application'
);

set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

select results_eq(
  $$
    select (public.import_applications_csv(jsonb_build_array(jsonb_build_object(
      'companyName', 'Acme',
      'jobTitle', 'Frontend Engineer',
      'status', 'saved',
      'workMode', null,
      'employmentType', null,
      'location', null,
      'salaryMin', null,
      'salaryMax', null,
      'currency', 'BRL',
      'appliedAt', null,
      'source', null,
      'jobUrl', null,
      'technologies', jsonb_build_array()
    ))) ->> 'imported'
  $$,
  array['1'],
  'another owner can import the same company without crossing accounts'
);

select is(
  (select count(*) from public.applications),
  1::bigint,
  'RLS exposes only the current owners application'
);

select throws_ok(
  $$
    select public.import_applications_csv(
      (select jsonb_agg(jsonb_build_object()) from generate_series(1, 201))
    )
  $$,
  '22023',
  'Import must contain between 1 and 200 rows',
  'the database rejects oversized batches'
);

select throws_ok(
  $$
    select public.import_applications_csv(jsonb_build_array(jsonb_build_object(
      'companyName', jsonb_build_object('unexpected', true),
      'jobTitle', 'Frontend Engineer',
      'status', 'saved',
      'currency', 'BRL',
      'technologies', jsonb_build_array()
    )))
  $$,
  '22023',
  'Invalid import field type',
  'the database validates JSON types independently from the interface'
);

select * from finish();
rollback;
