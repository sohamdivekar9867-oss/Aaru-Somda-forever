-- TEDDY / IMPORTANT DATES SETUP
-- Run MASTER_SHARED_SETUP.sql once. This standalone script is provided for reference/recovery.
-- It creates the shared important_dates table and seeds the relationship start date.

create table if not exists public.important_dates (
  id uuid primary key default gen_random_uuid(),
  emoji text not null default '❤️',
  title text not null,
  event_date date not null,
  description text,
  little_memory text,
  is_relationship_start boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.important_dates enable row level security;
drop policy if exists "Couple can view important dates" on public.important_dates;
drop policy if exists "Couple can add important dates" on public.important_dates;
drop policy if exists "Couple can update important dates" on public.important_dates;
drop policy if exists "Couple can delete important dates" on public.important_dates;
create policy "Couple can view important dates" on public.important_dates for select to authenticated using (public.is_couple_member());
create policy "Couple can add important dates" on public.important_dates for insert to authenticated with check (public.is_couple_member());
create policy "Couple can update important dates" on public.important_dates for update to authenticated using (public.is_couple_member()) with check (public.is_couple_member());
create policy "Couple can delete important dates" on public.important_dates for delete to authenticated using (public.is_couple_member());
insert into public.important_dates (emoji,title,event_date,description,little_memory,is_relationship_start)
select '❤️','The Day We Started Dating','2026-08-27','The day Aaru said yes.','The day everything changed. ❤️',true
where not exists (select 1 from public.important_dates where is_relationship_start=true);
