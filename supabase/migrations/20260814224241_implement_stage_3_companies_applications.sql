-- Stage 3: strengthen the companies/applications model for the real CRUD flows.

alter table public.applications
  drop constraint applications_employment_type_check;

alter table public.applications
  add constraint applications_employment_type_check check (
    employment_type is null
    or employment_type in (
      'clt',
      'pj',
      'internship',
      'freelance',
      'temporary',
      'other'
    )
  );

alter table public.applications
  alter column company_id set not null;

create index companies_user_name_idx
  on public.companies (user_id, lower(name));

create index companies_user_created_at_idx
  on public.companies (user_id, created_at desc);

create index applications_user_created_at_idx
  on public.applications (user_id, created_at desc);

create index applications_user_company_idx
  on public.applications (user_id, company_id);

create index applications_user_work_mode_idx
  on public.applications (user_id, work_mode)
  where work_mode is not null;

create index applications_user_employment_type_idx
  on public.applications (user_id, employment_type)
  where employment_type is not null;

create index application_history_application_created_at_idx
  on public.application_history (application_id, created_at desc);

create function private.record_application_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status is distinct from new.status then
    insert into public.application_history (
      user_id,
      application_id,
      from_status,
      to_status
    )
    values (
      new.user_id,
      new.id,
      old.status,
      new.status
    );
  end if;

  return new;
end;
$$;

revoke execute on function private.record_application_status_change()
from public, anon, authenticated;

create trigger applications_record_status_change
after update of status on public.applications
for each row execute function private.record_application_status_change();

drop policy "application_history_insert_own" on public.application_history;
drop policy "application_history_update_own" on public.application_history;
drop policy "application_history_delete_own" on public.application_history;

revoke insert, update, delete on public.application_history from authenticated;
