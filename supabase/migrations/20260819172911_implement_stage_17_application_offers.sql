-- Stage 17: one private, comparable offer per application.

create type public.offer_salary_period as enum ('monthly', 'annual');

create table public.application_offers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid not null unique,
  salary_amount numeric(14, 2) not null check (salary_amount > 0),
  salary_period public.offer_salary_period not null,
  currency text not null check (currency in ('BRL', 'USD', 'EUR')),
  bonus_amount numeric(14, 2) check (
    bonus_amount is null or bonus_amount >= 0
  ),
  equity text check (equity is null or char_length(equity) <= 1000),
  benefits text check (benefits is null or char_length(benefits) <= 3000),
  received_at date not null,
  decision_deadline date,
  notes text check (notes is null or char_length(notes) <= 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint application_offers_application_owner_fkey
    foreign key (application_id, user_id)
    references public.applications (id, user_id) on delete cascade,
  constraint application_offers_deadline_check
    check (
      decision_deadline is null or decision_deadline >= received_at
    ),
  unique (id, user_id)
);

create index application_offers_owner_received_at_idx
  on public.application_offers (user_id, received_at desc, id);

create index application_offers_owner_deadline_idx
  on public.application_offers (user_id, decision_deadline, id)
  where decision_deadline is not null;

create trigger application_offers_set_updated_at
before update on public.application_offers
for each row execute function private.set_updated_at();

alter table public.application_offers enable row level security;

create policy "application_offers_select_own"
on public.application_offers for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "application_offers_insert_own"
on public.application_offers for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "application_offers_update_own"
on public.application_offers for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "application_offers_delete_own"
on public.application_offers for delete
to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.application_offers from public, anon, authenticated;
grant select, insert, update, delete
on public.application_offers to authenticated;
