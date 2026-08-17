-- Account preferences live on the user-owned profile and remain protected by
-- the existing profiles_select_own / profiles_update_own RLS policies.

alter table public.profiles
add column default_currency text not null default 'BRL',
add column analytics_period text not null default '12m';

alter table public.profiles
add constraint profiles_default_currency_check
check (default_currency in ('BRL', 'USD', 'EUR')),
add constraint profiles_analytics_period_check
check (analytics_period in ('3m', '6m', '12m', 'all'));

-- Prevent authenticated clients from changing identity or audit columns.
revoke update on public.profiles from authenticated;
grant update (full_name, default_currency, analytics_period)
on public.profiles to authenticated;
