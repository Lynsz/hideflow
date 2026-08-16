-- Stage 5: contacts, interviews and an auditable application timeline.

update public.contacts
set contact_type = 'other'
where contact_type is not null
  and contact_type not in (
    'recruiter',
    'tech_recruiter',
    'hr',
    'hiring_manager',
    'technical_interviewer',
    'developer',
    'manager',
    'other'
  );

alter table public.contacts
  add constraint contacts_id_user_id_key unique (id, user_id),
  add constraint contacts_contact_type_check check (
    contact_type is null
    or contact_type in (
      'recruiter',
      'tech_recruiter',
      'hr',
      'hiring_manager',
      'technical_interviewer',
      'developer',
      'manager',
      'other'
    )
  );

create table public.application_contacts (
  application_id uuid not null,
  contact_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (application_id, contact_id),
  constraint application_contacts_application_owner_fkey
    foreign key (application_id, user_id)
    references public.applications (id, user_id) on delete cascade,
  constraint application_contacts_contact_owner_fkey
    foreign key (contact_id, user_id)
    references public.contacts (id, user_id) on delete cascade
);

update public.interviews
set result = 'scheduled'
where result is null
  or result not in (
    'scheduled',
    'completed',
    'passed',
    'failed',
    'cancelled',
    'rescheduled'
  );

update public.interviews
set type = 'other'
where type not in (
  'hr',
  'technical',
  'behavioral',
  'culture',
  'manager',
  'pair_programming',
  'technical_challenge',
  'final',
  'other'
);

alter table public.interviews
  add constraint interviews_id_user_id_key unique (id, user_id),
  add column contact_id uuid,
  alter column result set default 'scheduled',
  alter column result set not null,
  add constraint interviews_type_check check (
    type in (
      'hr',
      'technical',
      'behavioral',
      'culture',
      'manager',
      'pair_programming',
      'technical_challenge',
      'final',
      'other'
    )
  ),
  add constraint interviews_result_check check (
    result in (
      'scheduled',
      'completed',
      'passed',
      'failed',
      'cancelled',
      'rescheduled'
    )
  ),
  add constraint interviews_contact_owner_fkey
    foreign key (contact_id, user_id)
    references public.contacts (id, user_id)
    on delete set null (contact_id);

create table public.interview_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid not null,
  interview_id uuid,
  event_type text not null check (
    event_type in (
      'created',
      'rescheduled',
      'completed',
      'passed',
      'failed',
      'cancelled'
    )
  ),
  interview_type text not null check (
    interview_type in (
      'hr',
      'technical',
      'behavioral',
      'culture',
      'manager',
      'pair_programming',
      'technical_challenge',
      'final',
      'other'
    )
  ),
  result text check (
    result is null
    or result in (
      'scheduled',
      'completed',
      'passed',
      'failed',
      'cancelled',
      'rescheduled'
    )
  ),
  scheduled_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint interview_events_application_owner_fkey
    foreign key (application_id, user_id)
    references public.applications (id, user_id) on delete cascade,
  constraint interview_events_interview_owner_fkey
    foreign key (interview_id, user_id)
    references public.interviews (id, user_id)
    on delete set null (interview_id)
);

create index contacts_user_type_idx
  on public.contacts (user_id, contact_type)
  where contact_type is not null;

create index application_contacts_user_id_idx
  on public.application_contacts (user_id);

create index application_contacts_contact_id_idx
  on public.application_contacts (contact_id);

create index interviews_contact_id_idx
  on public.interviews (contact_id)
  where contact_id is not null;

create index interviews_user_result_scheduled_at_idx
  on public.interviews (user_id, result, scheduled_at);

create index interview_events_application_created_at_idx
  on public.interview_events (application_id, created_at desc);

create function private.validate_application_contact_company()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  application_company_id uuid;
  contact_company_id uuid;
begin
  select company_id into application_company_id
  from public.applications
  where id = new.application_id and user_id = new.user_id;

  select company_id into contact_company_id
  from public.contacts
  where id = new.contact_id and user_id = new.user_id;

  if application_company_id is null
    or contact_company_id is null
    or application_company_id is distinct from contact_company_id then
    raise exception 'Contact and application must belong to the same user and company'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger application_contacts_validate_company
before insert or update on public.application_contacts
for each row execute function private.validate_application_contact_company();

create function private.validate_interview_contact_company()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  application_company_id uuid;
  contact_company_id uuid;
begin
  if tg_op = 'UPDATE' and old.application_id is distinct from new.application_id then
    raise exception 'An interview cannot be moved to another application'
      using errcode = '23514';
  end if;

  if new.contact_id is null then
    return new;
  end if;

  select company_id into application_company_id
  from public.applications
  where id = new.application_id and user_id = new.user_id;

  select company_id into contact_company_id
  from public.contacts
  where id = new.contact_id and user_id = new.user_id;

  if application_company_id is null
    or contact_company_id is null
    or application_company_id is distinct from contact_company_id then
    raise exception 'Interviewer must belong to the application company'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger interviews_validate_contact_company
before insert or update of application_id, contact_id, user_id on public.interviews
for each row execute function private.validate_interview_contact_company();

create function private.protect_linked_contact_company()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.company_id is distinct from new.company_id
    and (
      exists (
        select 1 from public.application_contacts
        where contact_id = old.id and user_id = old.user_id
      )
      or exists (
        select 1 from public.interviews
        where contact_id = old.id and user_id = old.user_id
      )
    ) then
    raise exception 'Unlink the contact before changing its company'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger contacts_protect_linked_company
before update of company_id on public.contacts
for each row execute function private.protect_linked_contact_company();

create function private.record_interview_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.interview_events (
      user_id, application_id, interview_id, event_type,
      interview_type, result, scheduled_at
    ) values (
      new.user_id, new.application_id, new.id, 'created',
      new.type, new.result, new.scheduled_at
    );
    return new;
  end if;

  if old.scheduled_at is distinct from new.scheduled_at then
    insert into public.interview_events (
      user_id, application_id, interview_id, event_type,
      interview_type, result, scheduled_at
    ) values (
      new.user_id, new.application_id, new.id, 'rescheduled',
      new.type, new.result, new.scheduled_at
    );
  end if;

  if old.result is distinct from new.result
    and new.result <> 'scheduled'
    and not (
      new.result = 'rescheduled'
      and old.scheduled_at is distinct from new.scheduled_at
    ) then
    insert into public.interview_events (
      user_id, application_id, interview_id, event_type,
      interview_type, result, scheduled_at
    ) values (
      new.user_id, new.application_id, new.id,
      case when new.result = 'rescheduled' then 'rescheduled' else new.result end,
      new.type, new.result, new.scheduled_at
    );
  end if;

  return new;
end;
$$;

create trigger interviews_record_event
after insert or update of scheduled_at, result on public.interviews
for each row execute function private.record_interview_event();

revoke execute on function private.validate_application_contact_company()
from public, anon, authenticated;
revoke execute on function private.validate_interview_contact_company()
from public, anon, authenticated;
revoke execute on function private.protect_linked_contact_company()
from public, anon, authenticated;
revoke execute on function private.record_interview_event()
from public, anon, authenticated;

alter table public.application_contacts enable row level security;
alter table public.interview_events enable row level security;

drop policy "interviews_insert_own" on public.interviews;

create policy "interviews_insert_own"
on public.interviews for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and result = 'scheduled'
);

create policy "application_contacts_select_own"
on public.application_contacts for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "application_contacts_insert_own"
on public.application_contacts for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "application_contacts_delete_own"
on public.application_contacts for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "interview_events_select_own"
on public.interview_events for select
to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.application_contacts from public, anon, authenticated;
revoke all on public.interview_events from public, anon;
revoke all on public.interview_events from authenticated;

grant select, insert, delete on public.application_contacts to authenticated;
grant select on public.interview_events to authenticated;
